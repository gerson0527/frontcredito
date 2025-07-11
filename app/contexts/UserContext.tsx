import React, { createContext, useContext, useState, useEffect } from 'react';

interface PermissionModule {
  ver: boolean;
  crear: boolean;
  editar: boolean;
  eliminar: boolean;
}

interface UserPermissions {
  creditos: PermissionModule;
  clientes: PermissionModule;
  asesores: PermissionModule;
  bancos: PermissionModule;
  financieras: PermissionModule;
  objetivos: PermissionModule;
  reportes: PermissionModule;
  comisiones: PermissionModule;
  configuracion: PermissionModule;
  gestionUsuarios: PermissionModule;
}

interface User {
  id: number;
  username: string;
  role: string;
  email: string;
  theme: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  nombres?: string;
  apellidos?: string;
  correo?: string;
  permisos?: UserPermissions; // 🎯 AGREGAR PERMISOS
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  updateUser: (userData: Partial<User>) => void;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar usuario desde localStorage al iniciar
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
      }
    } catch (error) {
      console.error('Error parsing saved user:', error);
      localStorage.removeItem('user');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Guardar usuario en localStorage cuando cambie
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const updateUser = (userData: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...userData } : null);
  };

  return (
    <UserContext.Provider value={{ user, setUser, updateUser, isLoading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    // 🎯 MEJOR MANEJO DE ERRORES
    console.error('useUser debe usarse dentro de UserProvider');
    // Retornar valores por defecto en lugar de lanzar error
    return {
      user: null,
      setUser: () => {},
      updateUser: () => {},
      isLoading: false
    };
  }
  return context;
}