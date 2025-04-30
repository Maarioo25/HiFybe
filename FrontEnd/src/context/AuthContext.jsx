import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/appwrite';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setLoading(true);
      await authService.login(credentials.email, credentials.password);
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      toast.success('¡Inicio de sesión exitoso!');
      navigate('/');
    } catch (error) {
      console.error('Error de login:', error);
      if (error.code === 401) {
        toast.error('Credenciales incorrectas');
      } else {
        toast.error('Error al iniciar sesión: ' + error.message);
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      // Llama al backend para registrar el usuario
      const { userService } = await import('../services/api');
      await userService.register(userData);
      // Iniciar sesión automáticamente
      await authService.login(userData.email, userData.password);
      // Obtener el usuario actual
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      toast.success('¡Registro exitoso!');
      navigate('/');
    } catch (error) {
      console.error('Error de registro:', error);
      // Mejorar el mensaje de error para mostrar el mensaje del backend si existe
      const mensaje = error?.response?.data?.mensaje || error?.message || 'Error desconocido en el registro';
      toast.error('Error en el registro: ' + mensaje);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async () => {
    try {
      setLoading(true);
      await authService.loginWithGoogle();
      // La redirección la maneja Appwrite
    } catch (error) {
      console.error('Error de login con Google:', error);
      toast.error('Error al iniciar sesión con Google');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await authService.logout();
      setUser(null);
      toast.success('¡Sesión cerrada!');
      navigate('/auth');
    } catch (error) {
      console.error('Error de logout:', error);
      toast.error('Error al cerrar sesión');
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    googleLogin
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}; 