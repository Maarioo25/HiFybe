// components/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/form.css'; // Importamos los estilos existentes

const Home = () => {
  return (
    <div className="form-container">
      <h2>Bienvenido</h2>
      <div className="button-group">
        <Link to="/registro">
          <button className="home-btn">Registrarse</button>
        </Link>
        <Link to="/login">
          <button className="home-btn">Iniciar Sesión</button>
        </Link>
      </div>
    </div>
  );
};

export default Home;