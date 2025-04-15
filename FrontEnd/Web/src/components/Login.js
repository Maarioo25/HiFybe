// components/Login.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Importamos Link para los enlaces
import axios from 'axios';
import '../styles/form.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/usuarios/login', { email, password });
      localStorage.setItem('token', res.data.token);
      alert('Login exitoso');
    } catch (error) {
      console.error(error);
      alert('Error al iniciar sesión');
    }
  };

  const handleGoogleLogin = () => {
    // Aquí iría la lógica de autenticación con Google (por ejemplo, usando Firebase)
    console.log('Iniciar sesión con Google');
    alert('Funcionalidad de Google en desarrollo');
  };

  const handleForgotPassword = () => {
    // Aquí podrías implementar la lógica para "Olvidé mi contraseña" más adelante
    console.log('Olvidé mi contraseña');
    alert('Funcionalidad de recuperación de contraseña en desarrollo');
  };

  return (
    <div className="form-container">
      <h2>Iniciar Sesión</h2>
      <form id="login-form" onSubmit={handleLogin}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Contraseña"
          required
        />
      </form>
      <button type="submit" form="login-form" className="submit-circle-btn">
        ➡️
      </button>
      <button className="google-btn" onClick={handleGoogleLogin}>
        <img
          src="https://www.google.com/favicon.ico"
          alt="Google Icon"
          style={{ width: '20px', marginRight: '10px' }}
        />
        Iniciar sesión con Google
      </button>
      <div className="form-links">
        <Link to="#" onClick={handleForgotPassword}>
          He olvidado mi contraseña
        </Link>
      </div>
      <div className="form-links">
        <span>¿No tienes una cuenta todavía?</span>
        <Link to="/registro">Regístrate</Link>
      </div>
    </div>
  );
};

export default Login;