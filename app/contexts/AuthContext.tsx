import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthService } from '../services/auth.service';
import { ChatService } from '../services/chat.service';

interface User {
  id: number;
  username: string;
  email: string;
  rol: string;
  permisos: any;
  nombre?: string;
  apellido?: string;
  nombres?: string;
  apellidos?: string;
  correo?: string;
  telefono?: string;
  cargo?: string;
  theme?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { username: string; password: string }) => Promise<{
    success: boolean;
    message?: string;
  }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Solo verificar autenticación si hay indicios de sesión activa
    // En este caso, como usamos cookies con credentials: 'include',
    // podemos verificar si hay cookies de sesión
    checkAuthIfNeeded();
  }, []);

  const checkAuthIfNeeded = async () => {
    try {
      // Verificar si hay cookies que indiquen una posible sesión activa
      // Como usamos httpOnly cookies, no podemos leerlas directamente,
      // pero podemos hacer una verificación silenciosa solo si creemos que hay sesión
      if (document.cookie.includes('connect.sid') || localStorage.getItem('hasActiveSession')) {
        await checkAuth();
      } else {
        // No hay indicios de sesión, marcar como no autenticado directamente
        setIsAuthenticated(false);
        setUser(null);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error verificando sesión:', error);
      setIsAuthenticated(false);
      setUser(null);
      setIsLoading(false);
    }
  };

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      
      const response = await AuthService.obtenerPerfil();
      
      if (response.success && response.user) { 
        setUser(response.user);
        setIsAuthenticated(true);
        // Marcar que hay una sesión activa
        localStorage.setItem('hasActiveSession', 'true');
        
        // Inicializar conexión Socket.IO para chat
        ChatService.init(response.user.id);
      } else {
        // No hay sesión activa o expiró
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('hasActiveSession');
      }
    } catch (error) {
      console.error('Error verificando autenticación:', error);
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('hasActiveSession');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: { username: string; password: string }) => {
    setIsLoading(true);
    try {
      const result = await AuthService.login(credentials);
      
      if (result.success && result.user) {
        setUser(result.user);
        setIsAuthenticated(true);
        // Marcar que hay una sesión activa
        localStorage.setItem('hasActiveSession', 'true');
        
        // Inicializar conexión Socket.IO para chat
        ChatService.init(result.user.id);
        
        return { success: true };
      } else {
        return { 
          success: false, 
          message: result.message || 'Error de autenticación' 
        };
      }
    } catch (error) {
      console.error('Error en login:', error);
      return { 
        success: false, 
        message: 'Error de conexión' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await AuthService.logout();
    } catch (error) {
      console.error('Error durante logout:', error);
    } finally {
      // Desconectar Socket.IO
      ChatService.disconnect();
      
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
      // Limpiar marca de sesión activa
      localStorage.removeItem('hasActiveSession');
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkAuth,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  
  return context;
}

// Hook para verificar permisos específicos
export function usePermissions() {
  const { user } = useAuth();
  
  const hasPermission = (modulo: string, accion: string): boolean => {
    if (!user || !user.permisos) return false;
    
    // El superadmin tiene todos los permisos
    if (user.rol === 'admin') return true;
    
    // Verificar permisos específicos
    const permisos = user.permisos;
    return permisos[modulo] && permisos[modulo][accion] === true;
  };

  const canView = (modulo: string) => hasPermission(modulo, 'ver');
  const canCreate = (modulo: string) => hasPermission(modulo, 'crear');
  const canEdit = (modulo: string) => hasPermission(modulo, 'editar');
  const canDelete = (modulo: string) => hasPermission(modulo, 'eliminar');

  return {
    hasPermission,
    canView,
    canCreate,
    canEdit,
    canDelete
  };
}
