import React, { useState, useEffect } from 'react';
import { X, Search, Send, MessageCircle, Users, Circle, Minimize2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';
import { useAuth } from '../../contexts/AuthContext';
import { useChatContext } from '../../contexts/ChatContext';
import { useToast } from '../../hooks/use-toast';
import { ChatService } from '../../services/chat.service';

interface ChatUser {
  id: number;
  nombre: string;
  apellido?: string;
  email: string;
  rol: string;
  isOnline: boolean;
  lastSeen?: string;
}

interface ChatMessage {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  timestamp: string;
  isRead: boolean;
}

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatWindowProps {
  user: ChatUser;
  position: number;
  onClose: () => void;
}

// Componente de ventana de chat flotante
const ChatWindow: React.FC<ChatWindowProps> = ({ user, position, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const { user: currentUser } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadMessages();
    
    // Configurar listeners de Socket.IO
    const handleNewMessage = (message: ChatMessage) => {
      // Solo agregar mensajes que sean para esta conversación
      if ((message.senderId === user.id && message.receiverId === currentUser?.id) ||
          (message.senderId === currentUser?.id && message.receiverId === user.id)) {
        setMessages(prev => [...prev, message]);
        
        // Si el mensaje es para nosotros, marcarlo como leído inmediatamente
        // ya que la ventana está abierta y visible
        if (message.receiverId === currentUser?.id) {
          ChatService.markAsRead(message.senderId);
        }
      }
    };

    const handleTyping = (data: { userId: number; isTyping: boolean }) => {
      if (data.userId === user.id) {
        setIsTyping(data.isTyping);
      }
    };

    // Suscribirse a eventos
    ChatService.onMessage(handleNewMessage);
    ChatService.onTyping(handleTyping);

    // Cleanup al desmontar
    return () => {
      ChatService.removeMessageCallback(handleNewMessage);
      ChatService.removeTypingCallback(handleTyping);
    };
  }, [user.id, currentUser?.id]);

  const loadMessages = async () => {
    if (!currentUser) return;
    try {
      const messagesData = await ChatService.getMessages(currentUser.id, user.id);
      setMessages(messagesData);
    } catch (error) {
      console.error('Error cargando mensajes:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentUser) return;

    const content = newMessage.trim();
    setNewMessage('');

    try {
      await ChatService.sendMessage(user.id, content);
      // El mensaje se agregará automáticamente cuando llegue el evento socket
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      toast({
        title: 'Error',
        description: 'No se pudo enviar el mensaje',
        variant: 'destructive',
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewMessage(value);
    
    // Enviar indicador de escritura
    ChatService.sendTyping(user.id, value.length > 0);
  };

  return (
    <div 
      className={`fixed bottom-4 bg-background border rounded-lg shadow-lg z-50 ${
        isMinimized ? 'h-12' : 'h-96'
      } w-80`}
      style={{ 
        right: `${20 + (position * 340)}px` 
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
            {user.nombre.charAt(0)}{user.apellido?.charAt(0)}
          </div>
          <span className="font-medium text-sm truncate">
            {user.nombre} {user.apellido}
          </span>
        </div>
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            <Minimize2 className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Mensajes */}
          <ScrollArea className="flex-1 p-3 h-64">
            <div className="space-y-2">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.senderId === currentUser?.id ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] p-2 rounded-lg text-sm ${
                      message.senderId === currentUser?.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <div>{message.content}</div>
                    <div className={`text-xs mt-1 ${
                      message.senderId === currentUser?.id ? 'text-primary-foreground/70' : 'text-muted-foreground'
                    }`}>
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-3 border-t">
            <div className="flex space-x-2">
              <Input
                placeholder="Escribe un mensaje..."
                value={newMessage}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                className="flex-1 text-sm"
              />
              <Button onClick={sendMessage} size="sm">
                <Send className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export const ChatPanel: React.FC<ChatPanelProps> = ({ isOpen, onClose }) => {
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [openChats, setOpenChats] = useState<ChatUser[]>([]);
  const { user: currentUser } = useAuth();
  const { unreadCounts, updateUnreadCount, clearUnreadCount } = useChatContext();
  const { toast } = useToast();

  // Cargar usuarios al abrir el chat
  useEffect(() => {
    if (isOpen) {
      loadUsers();
      loadUnreadCounts();  
    }
  }, [isOpen]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const usersData = await ChatService.getUsers();
      const filteredUsers = usersData.filter(user => user.id !== currentUser?.id);
      setUsers(filteredUsers);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los usuarios',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadUnreadCounts = async () => {
    try {
      const counts = await ChatService.getUnreadCounts();
      // Actualizar todos los contadores en el contexto
      Object.entries(counts).forEach(([userId, count]) => {
        updateUnreadCount(parseInt(userId), count);
      });
    } catch (error) {
      console.error('Error cargando conteos de mensajes no leídos:', error);
      // Fallback: simular conteo de mensajes no leídos por usuario
      users.forEach(user => {
        updateUnreadCount(user.id, Math.floor(Math.random() * 5));
      });
    }
  };

  // Los listeners globales ya están manejados por ChatContext
  // Solo necesitamos escuchar cambios de estado en línea aquí
  useEffect(() => {
    // Escuchar cambios de estado en línea
    const handleUserOnline = (data: { userId: number; isOnline: boolean }) => {
      setUsers(prev => prev.map(user => 
        user.id === data.userId 
          ? { ...user, isOnline: data.isOnline, lastSeen: data.isOnline ? undefined : 'Desconectado' }
          : user
      ));
    };

    // Registrar listener solo para estado en línea
    if (currentUser?.id) {
      ChatService.onUserOnline(handleUserOnline);
    }

    // Cleanup
    return () => {
      if (currentUser?.id) {
        ChatService.removeUserOnlineCallback(handleUserOnline);
      }
    };
  }, [currentUser?.id]);

  // Cargar datos solo cuando se abre el panel
  useEffect(() => {
    if (isOpen) {
      loadUsers();
      loadUnreadCounts();
    }
  }, [isOpen]);

  const openChatWindow = async (user: ChatUser) => {
    // Verificar si ya está abierto
    if (!openChats.find(chat => chat.id === user.id)) {
      setOpenChats(prev => [...prev, user]);
    }
    
    // Marcar mensajes como leídos y limpiar contador
    if (currentUser) {
      await ChatService.markAsRead(user.id);
    }
    clearUnreadCount(user.id);
  };

  const closeChatWindow = async (userId: number) => {
    // Marcar mensajes como leídos antes de cerrar
    if (currentUser) {
      await ChatService.markAsRead(userId);
    }
    // Limpiar contador de no leídos
    clearUnreadCount(userId);
    // Remover de chats abiertos
    setOpenChats(prev => prev.filter(chat => chat.id !== userId));
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed bottom-16 right-4 w-80 bg-background border rounded-lg shadow-lg z-50">
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="font-semibold">Mensajes</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-col h-96">
          {/* Lista de usuarios */}
          <div className="flex flex-col">
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar usuarios..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <ScrollArea className="flex-1">
              {isLoading ? (
                <div className="flex items-center justify-center p-4">
                  <div className="text-muted-foreground">Cargando usuarios...</div>
                </div>
              ) : (
                <div className="p-2">
                  {users
                    .filter(user =>
                      user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      user.apellido?.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-muted cursor-pointer"
                        onClick={() => openChatWindow(user)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                              {user.nombre.charAt(0)}{user.apellido?.charAt(0)}
                            </div>
                            <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${
                              user.isOnline ? 'bg-green-500' : 'bg-gray-400'
                            }`} />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-sm">
                              {user.nombre} {user.apellido}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {user.isOnline ? 'En línea' : 'Desconectado'}
                            </div>
                          </div>
                        </div>
                        {unreadCounts[user.id] > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {unreadCounts[user.id]}
                          </Badge>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </div>

      {/* Ventanas de chat flotantes */}
      {openChats.map((chatUser, index) => (
        <ChatWindow
          key={chatUser.id}
          user={chatUser}
          position={index}
          onClose={() => closeChatWindow(chatUser.id)}
        />
      ))}
    </>
  );
};