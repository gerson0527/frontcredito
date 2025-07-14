import React, { createContext, useContext, useState, useEffect } from 'react';
import { ChatService } from '../services/chat.service';
import { useAuth } from './AuthContext';

interface ChatMessage {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  timestamp: string;
  isRead: boolean;
}

interface ChatContextType {
  unreadCounts: Record<number, number>;
  totalUnreadCount: number;
  updateUnreadCount: (userId: number, count: number) => void;
  clearUnreadCount: (userId: number) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext debe usarse dentro de un ChatProvider');
  }
  return context;
};

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [unreadCounts, setUnreadCounts] = useState<Record<number, number>>({});
  const { user } = useAuth();

  // Solicitar permisos de notificación al cargar
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Calcular total de mensajes no leídos
  const totalUnreadCount = Object.values(unreadCounts).reduce((total, count) => total + count, 0);

  // Actualizar contador de un usuario específico
  const updateUnreadCount = (userId: number, count: number) => {
    setUnreadCounts(prev => ({ ...prev, [userId]: count }));
  };

  // Limpiar contador de un usuario específico
  const clearUnreadCount = (userId: number) => {
    setUnreadCounts(prev => ({ ...prev, [userId]: 0 }));
  };

  // Escuchar nuevos mensajes globalmente
  useEffect(() => {
    if (!user?.id) return;

    // Función para reproducir sonido de notificación
    const playNotificationSound = () => {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.2);
        
        setTimeout(() => {
          const oscillator2 = audioContext.createOscillator();
          const gainNode2 = audioContext.createGain();
          
          oscillator2.connect(gainNode2);
          gainNode2.connect(audioContext.destination);
          
          oscillator2.frequency.setValueAtTime(600, audioContext.currentTime);
          gainNode2.gain.setValueAtTime(0.1, audioContext.currentTime);
          
          oscillator2.start();
          oscillator2.stop(audioContext.currentTime + 0.2);
        }, 100);
        
      } catch (error) {
        console.log('No se pudo reproducir el sonido de notificación:', error);
      }
    };

    const handleNewMessage = (message: ChatMessage) => {
      if (message.receiverId === user.id) {
        // Incrementar contador para el remitente
        setUnreadCounts(prev => ({
          ...prev,
          [message.senderId]: (prev[message.senderId] || 0) + 1
        }));

        // Reproducir sonido y mostrar notificación
        playNotificationSound();
        
        // Crear notificación del sistema si es posible
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Nuevo mensaje', {
            body: `Mensaje recibido`,
            icon: '/favicon.ico'
          });
        }
      }
    };

    ChatService.onMessage(handleNewMessage);

    return () => {
      ChatService.removeMessageCallback(handleNewMessage);
    };
  }, [user?.id]);

  // Cargar contadores iniciales al iniciar sesión
  useEffect(() => {
    if (user?.id) {
      loadInitialUnreadCounts();
    }
  }, [user?.id]);

  const loadInitialUnreadCounts = async () => {
    try {
      const counts = await ChatService.getUnreadCounts();
      setUnreadCounts(counts);
    } catch (error) {
      console.error('Error cargando contadores iniciales:', error);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        unreadCounts,
        totalUnreadCount,
        updateUnreadCount,
        clearUnreadCount,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
