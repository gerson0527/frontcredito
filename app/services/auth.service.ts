// src/services/auth.service.ts
const API_BASE_URL = 'https://backcreditos2025-backcreditos.up.railway.app'

export const AuthService = {
  login: async (credentials: { username: string; password: string }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',      
        credentials: 'include', // Necesario para cookies
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(credentials),
      });
      
      const data = await response.json();
      
      // Si el status HTTP no es exitoso, marcar como error
      if (!response.ok) {
        return {
          success: false,
          message: data.message || `Error ${response.status}: ${response.statusText}`,
          status: response.status
        };
      }
      
      // Si llegamos aquí, la respuesta fue exitosa
      return {
        success: true,
        ...data
      };
    } catch (error) {
      console.error('Error en login:', error);
      return {
        success: false,
        message: 'Error de conexión con el servidor'
      };
    }
  },

  refreshToken: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
      method: 'POST',
      credentials: 'include',
    });
    return response.ok;
  },

  logout: async () => {
    await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
  },
  cambiarPassword: async (data: { userId: string; oldPassword: string; newPassword: string }) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/cambiar-password`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await response.json();
  },
  // NUEVA FUNCIÓN: Obtener perfil del usuario autenticado
  obtenerPerfil: async () => {
    const response = await fetch(`${API_BASE_URL}/api/auth/perfil`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
    return await response.json();
  },
  // NUEVA FUNCIÓN: Actualizar perfil del usuario
  actualizarPerfil: async (data: { 
    nombres: string; 
    apellidos: string; 
    correo: string; 
    telefono?: string; 
    cargo?: string; 
  }) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/perfil`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await response.json();
  },
  // NUEVA FUNCIÓN: Actualizar tema
  actualizarTema: async (theme: 'light' | 'dark' | 'system') => {
    const response = await fetch(`${API_BASE_URL}/api/auth/tema`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ theme }),
    });
    return await response.json();
  },
};