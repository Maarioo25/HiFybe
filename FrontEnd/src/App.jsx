import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import AuthForm from './components/AuthForm';
import MainPage from './pages/MainPage';
import ProtectedRoute from './components/ProtectedRoute';
import Friends from "./pages/Friends";
import FriendDetail from "./pages/FriendDetail";
import Chats from "./pages/Chats";
import Playlists from "./pages/Playlists";
import PlaylistDetail from "./pages/PlaylistDetail";

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gradient-to-br from-harmony-primary via-harmony-secondary to-harmony-accent">
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                iconTheme: {
                  primary: '#4CAF50',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#f44336',
                  secondary: '#fff',
                },
              },
            }}
          />
          <Routes>
            <Route path="/auth" element={<AuthForm />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MainPage />
                </ProtectedRoute>
              }
            />
            <Route path="/amigos" element={<Friends />} />
            <Route path="/friends/:id" element={<FriendDetail />} />
            <Route path="/friends/:id/playlists/:name" element={<PlaylistDetail />} />
            <Route path="/chats" element={<Chats />} />
            <Route path="/playlists" element={<Playlists />} />
            <Route path="/playlists/:name" element={<PlaylistDetail />} />
            <Route path="*" element={<Navigate to="/auth" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App; 