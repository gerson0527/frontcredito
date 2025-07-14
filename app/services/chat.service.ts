// Chat service para manejar usuarios y mensajes con Socket.IO
import { io, Socket } from 'socket.io-client';

const API_BASE_URL = 'http://localhost:3000'

export interface ChatUser {
  id: number;
  nombre: string;
  apellido?: string;
  email: string;
  rol: string;
  isOnline: boolean;
  lastSeen?: string;
}

export interface ChatMessage {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  timestamp: string;
  isRead: boolean;
}

// Clase para manejar la conexión Socket.IO
class SocketChatService {
  private socket: Socket | null = null;
  private isConnected = false;
  private messageCallbacks: ((message: ChatMessage) => void)[] = [];
  private userOnlineCallbacks: ((data: { userId: number; isOnline: boolean }) => void)[] = [];
  private typingCallbacks: ((data: { userId: number; isTyping: boolean }) => void)[] = [];

  // Conectar al servidor Socket.IO
  connect(userId: number): void {
    if (this.socket && this.isConnected) {
      return; // Ya conectado
    }

    this.socket = io(API_BASE_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('📡 Conectado a Socket.IO');
      this.isConnected = true;
      // Autenticar con el servidor
      this.socket?.emit('authenticate', userId);
    });

    this.socket.on('disconnect', () => {
      console.log('📡 Desconectado de Socket.IO');
      this.isConnected = false;
    });

    // Escuchar nuevos mensajes
    this.socket.on('new_message', (message: ChatMessage) => {
      this.messageCallbacks.forEach(callback => callback(message));
    });

    // Confirmar envío de mensajes
    this.socket.on('message_sent', (message: ChatMessage) => {
      this.messageCallbacks.forEach(callback => callback(message));
    });

    // Escuchar errores de mensajes
    this.socket.on('message_error', (error: { error: string }) => {
      console.error('Error en mensaje:', error.error);
    });

    // Escuchar cambios de estado en línea
    this.socket.on('user_online', (data: { userId: number; isOnline: boolean }) => {
      this.userOnlineCallbacks.forEach(callback => callback(data));
    });

    // Escuchar indicadores de escritura
    this.socket.on('user_typing', (data: { userId: number; isTyping: boolean }) => {
      this.typingCallbacks.forEach(callback => callback(data));
    });

    // Escuchar mensajes leídos
    this.socket.on('messages_read', (data: { readById: number }) => {
      console.log(`Mensajes leídos por usuario ${data.readById}`);
    });
  }

  // Desconectar
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Enviar mensaje
  sendMessage(receiverId: number, content: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('send_message', { receiverId, content });
    }
  }

  // Marcar mensajes como leídos
  markAsRead(senderId: number): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('mark_as_read', { senderId });
    }
  }

  // Enviar indicador de escritura
  sendTyping(receiverId: number, isTyping: boolean): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('typing', { receiverId, isTyping });
    }
  }

  // Suscribirse a nuevos mensajes
  onMessage(callback: (message: ChatMessage) => void): void {
    this.messageCallbacks.push(callback);
  }

  // Suscribirse a cambios de estado en línea
  onUserOnline(callback: (data: { userId: number; isOnline: boolean }) => void): void {
    this.userOnlineCallbacks.push(callback);
  }

  // Suscribirse a indicadores de escritura
  onTyping(callback: (data: { userId: number; isTyping: boolean }) => void): void {
    this.typingCallbacks.push(callback);
  }

  // Remover callbacks
  removeMessageCallback(callback: (message: ChatMessage) => void): void {
    const index = this.messageCallbacks.indexOf(callback);
    if (index > -1) {
      this.messageCallbacks.splice(index, 1);
    }
  }

  removeUserOnlineCallback(callback: (data: { userId: number; isOnline: boolean }) => void): void {
    const index = this.userOnlineCallbacks.indexOf(callback);
    if (index > -1) {
      this.userOnlineCallbacks.splice(index, 1);
    }
  }

  removeTypingCallback(callback: (data: { userId: number; isTyping: boolean }) => void): void {
    const index = this.typingCallbacks.indexOf(callback);
    if (index > -1) {
      this.typingCallbacks.splice(index, 1);
    }
  }
}

// Instancia singleton del servicio Socket.IO
const socketService = new SocketChatService();

export const ChatService = {
  // Inicializar conexión Socket.IO
  init: (userId: number) => {
    socketService.connect(userId);
  },

  // Cerrar conexión
  disconnect: () => {
    socketService.disconnect();
  },

  // Obtener todos los usuarios disponibles para chat
  getUsers: async (): Promise<ChatUser[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/users`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.users || [];
      } else {
        console.error('Error al obtener usuarios:', response.statusText);
        return [];
      }
    } catch (error) {
      console.error('Error obteniendo usuarios:', error);
      return [];
    }
  },

  // Obtener mensajes entre dos usuarios desde la base de datos
  getMessages: async (userId1: number, userId2: number): Promise<ChatMessage[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/messages?user1=${userId1}&user2=${userId2}`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.messages || [];
      } else {
        console.error('Error al obtener mensajes:', response.statusText);
        return [];
      }
    } catch (error) {
      console.error('Error obteniendo mensajes:', error);
      return [];
    }
  },

  // Enviar un mensaje a través de Socket.IO
  sendMessage: async (receiverId: number, content: string): Promise<{ success: boolean; message?: ChatMessage }> => {
    try {
      socketService.sendMessage(receiverId, content);
      return { success: true };
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      return { success: false };
    }
  },

  // Marcar mensajes como leídos a través de Socket.IO
  markAsRead: async (senderId: number): Promise<boolean> => {
    try {
      socketService.markAsRead(senderId);
      return true;
    } catch (error) {
      console.error('Error marcando mensajes como leídos:', error);
      return false;
    }
  },

  // Obtener conteo de mensajes no leídos desde el backend
  getUnreadCounts: async (): Promise<Record<number, number>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/unread-counts`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        console.error('Error al obtener conteo de no leídos:', response.statusText);
        return {};
      }
    } catch (error) {
      console.error('Error obteniendo conteo de no leídos:', error);
      return {};
    }
  },

  // Métodos para manejar eventos Socket.IO
  onMessage: (callback: (message: ChatMessage) => void) => {
    socketService.onMessage(callback);
  },

  onUserOnline: (callback: (data: { userId: number; isOnline: boolean }) => void) => {
    socketService.onUserOnline(callback);
  },

  onTyping: (callback: (data: { userId: number; isTyping: boolean }) => void) => {
    socketService.onTyping(callback);
  },

  sendTyping: (receiverId: number, isTyping: boolean) => {
    socketService.sendTyping(receiverId, isTyping);
  },

  // Métodos para remover listeners
  removeMessageCallback: (callback: (message: ChatMessage) => void) => {
    socketService.removeMessageCallback(callback);
  },

  removeUserOnlineCallback: (callback: (data: { userId: number; isOnline: boolean }) => void) => {
    socketService.removeUserOnlineCallback(callback);
  },

  removeTypingCallback: (callback: (data: { userId: number; isTyping: boolean }) => void) => {
    socketService.removeTypingCallback(callback);
  }
};
