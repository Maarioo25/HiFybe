import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Interceptor para manejar respuestas
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Manejar errores 401 (No autorizado)
    if (error.response?.status === 401) {
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      window.location.href = '/auth';
      return Promise.reject({
        response: {
          data: {
            mensaje: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.'
          }
        }
      });
    }
    // Manejar errores 500 (Error del servidor)
    if (error.response?.status === 500) {
      console.error('Error del servidor:', error.response?.data);
      return Promise.reject({
        response: {
          data: {
            mensaje: 'Error en el servidor. Por favor, verifica que todos los campos estén correctamente completados.'
          }
        }
      });
    }
    // Para otros errores, devolver el mensaje del servidor si existe
    return Promise.reject({
      response: {
        data: {
          mensaje: error.response?.data?.mensaje || 'Ha ocurrido un error. Por favor, intenta nuevamente.'
        }
      }
    });
  }
);

// Servicios de usuario
export const userService = {
  getAllUsers: async () => {
    const response = await api.get('/usuarios');
    return response.data;
  },
  getUserById: async (userId) => {
    const response = await api.get(`/usuarios/${userId}`);
    return response.data;
  },
  updateProfile: async (userId, userData) => {
    const response = await api.put(`/usuarios/${userId}`, {
      nombre: userData.nombre,
      apodo: userData.apodo,
      biografia: userData.biografia,
      foto_perfil: userData.foto_perfil
    });
    return response.data;
  },
  deleteUser: async (userId) => {
    const response = await api.delete(`/usuarios/${userId}`);
    return response.data;
  },
  login: async (email, password) => {
    const response = await api.post('/usuarios/login', { email, password });
    return response.data;
  },
  register: async (userData) => {
    const response = await api.post('/usuarios/register', userData);
    return response.data;
  }
};

// Servicios de notificaciones
export const notificationService = {
  getNotifications: async () => {
    const response = await api.get('/notificaciones');
    return response.data;
  },
  markAsRead: async (notificationId) => {
    const response = await api.put(`/notificaciones/${notificationId}/leida`);
    return response.data;
  }
};

// Servicios de chat
export const chatService = {
  getConversations: async () => {
    const response = await api.get('/conversaciones');
    return response.data;
  },
  getMessages: async (conversationId) => {
    const response = await api.get(`/conversaciones/${conversationId}/mensajes`);
    return response.data;
  },
  sendMessage: async (conversationId, message) => {
    const response = await api.post(`/conversaciones/${conversationId}/mensajes`, { message });
    return response.data;
  }
};

// Servicios de música
export const musicService = {
  getSongs: async (filters) => {
    const response = await api.get('/canciones', { params: filters });
    return response.data;
  },
  getPlaylists: async () => {
    const response = await api.get('/playlists');
    return response.data;
  },
  createPlaylist: async (playlistData) => {
    const response = await api.post('/playlists', playlistData);
    return response.data;
  },
  addSongToPlaylist: async (playlistId, songId) => {
    const response = await api.post(`/playlists/${playlistId}/canciones`, { songId });
    return response.data;
  }
};

export default api;