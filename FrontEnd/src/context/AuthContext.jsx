import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { userService } from '../services/api';

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
      const data = await userService.getCurrentUser();
      setUser(data.user);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async ({ email, password }) => {
    try {
      setLoading(true);
      const data = await userService.login(email, password);
      if (data.usuario) setUser(data.usuario);
      toast.success('¡Inicio de sesión exitoso!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.mensaje || 'Error al iniciar sesión');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      await userService.register(userData);
      toast.success('¡Registro exitoso!');
      await login({ email: userData.email, password: userData.password });
    } catch (error) {
      toast.error(error.response?.data?.mensaje || 'Error en el registro');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await userService.logout();
      setUser(null);
      toast.success('¡Sesión cerrada!');
      navigate('/auth');
    } catch (error) {
      toast.error(error.response?.data?.mensaje || 'Error al cerrar sesión');
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = () => {
    setLoading(true);
    window.location.href = 'http://localhost:5000/usuarios/google';
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    googleLogin,
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
