import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaSignOutAlt, FaBell, FaUserCircle } from 'react-icons/fa';

const Home = () => {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
    console.log('Usuario actual:', user); // Para debug
  }, [user, loading, navigate]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-harmony-primary">
        <div className="text-harmony-accent text-xl">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-harmony-primary">
      {/* Barra de navegación */}
      <nav className="bg-harmony-secondary/30 backdrop-blur-sm border-b border-harmony-text-secondary/10 p-4 relative z-40">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <img src="/images/logo.png" alt="Logo HiFybe" className="h-8 w-8" />
            <span className="text-harmony-accent text-xl font-bold">HiFybe</span>
          </div>
          <div className="flex items-center space-x-4">
            <button className="text-harmony-text-primary hover:text-harmony-accent">
              <FaBell className="w-6 h-6" />
            </button>
            <div className="relative" ref={menuRef}>
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-2"
              >
                {user?.profilePic ? (
                  <img 
                    src={user.profilePic} 
                    alt="Avatar" 
                    className="h-8 w-8 rounded-full cursor-pointer"
                  />
                ) : (
                  <FaUserCircle className="h-8 w-8 text-harmony-text-secondary" />
                )}
              </button>
              
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-harmony-secondary/95 backdrop-blur-md z-50">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-harmony-text-primary hover:bg-harmony-accent/20 rounded-md transition-colors"
                  >
                    <FaSignOutAlt className="text-harmony-text-secondary" />
                    <span>Cerrar sesión</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Contenido principal */}
      <main className="container mx-auto p-4 relative z-30">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Columna izquierda - Perfil y amigos */}
          <div className="space-y-6">
            {/* Tarjeta de perfil */}
            <div className="bg-harmony-secondary/30 backdrop-blur-sm rounded-lg p-4 border border-harmony-text-secondary/10">
              <div className="flex items-center space-x-4">
                {user?.profilePic ? (
                  <img 
                    src={user.profilePic} 
                    alt="Avatar" 
                    className="h-16 w-16 rounded-full"
                  />
                ) : (
                  <FaUserCircle className="h-16 w-16 text-harmony-text-secondary" />
                )}
                <div>
                  <h2 className="text-harmony-text-primary font-semibold">{user?.name || 'Usuario'}</h2>
                  <p className="text-harmony-text-secondary text-sm">{user?.email}</p>
                  {user?.provider && (
                    <p className="text-harmony-accent text-xs mt-1">
                      Conectado con {user.provider}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Lista de amigos */}
            <div className="bg-harmony-secondary/30 backdrop-blur-sm rounded-lg p-4 border border-harmony-text-secondary/10">
              <h3 className="text-harmony-text-primary font-semibold mb-4">Amigos</h3>
              <div className="space-y-2">
                <p className="text-harmony-text-secondary text-center">No hay amigos aún</p>
              </div>
            </div>
          </div>

          {/* Columna central - Feed de actividad */}
          <div className="space-y-6">
            {/* Crear publicación */}
            <div className="bg-harmony-secondary/30 backdrop-blur-sm rounded-lg p-4 border border-harmony-text-secondary/10">
              <div className="flex space-x-4">
                {user?.profilePic ? (
                  <img 
                    src={user.profilePic} 
                    alt="Avatar" 
                    className="h-10 w-10 rounded-full"
                  />
                ) : (
                  <FaUserCircle className="h-10 w-10 text-harmony-text-secondary" />
                )}
                <input 
                  type="text" 
                  placeholder="¿Qué estás escuchando?" 
                  className="flex-1 bg-harmony-primary/50 text-harmony-text-primary rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-harmony-accent"
                />
              </div>
            </div>

            {/* Feed de actividad */}
            <div className="space-y-4">
              <p className="text-harmony-text-secondary text-center">No hay actividad reciente</p>
            </div>
          </div>

          {/* Columna derecha - Recomendaciones y chat */}
          <div className="space-y-6">
            {/* Recomendaciones de música */}
            <div className="bg-harmony-secondary/30 backdrop-blur-sm rounded-lg p-4 border border-harmony-text-secondary/10">
              <h3 className="text-harmony-text-primary font-semibold mb-4">Recomendaciones</h3>
              <div className="space-y-4">
                <p className="text-harmony-text-secondary text-center">No hay recomendaciones</p>
              </div>
            </div>

            {/* Chat rápido */}
            <div className="bg-harmony-secondary/30 backdrop-blur-sm rounded-lg p-4 border border-harmony-text-secondary/10">
              <h3 className="text-harmony-text-primary font-semibold mb-4">Chat</h3>
              <div className="space-y-2">
                <p className="text-harmony-text-secondary text-center">No hay mensajes</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home; 