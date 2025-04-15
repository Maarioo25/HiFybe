// components/Registro.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/form.css';

const Registro = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    apodo: '',
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/usuarios/register', formData);
      alert('Usuario registrado exitosamente');
    } catch (error) {
      console.error(error);
      alert('Error al registrar usuario');
    }
  };

  const handleGoogleSignUp = () => {
    console.log('Registrarse con Google');
    alert('Funcionalidad de Google en desarrollo');
  };

  return (
    <div className="form-container">
      <h2>Registro de Usuario</h2>
      <form id="registro-form" onSubmit={handleSubmit}>
        <input type="text" name="nombre" placeholder="Nombre completo" onChange={handleChange} required />
        <input type="text" name="apodo" placeholder="Apodo" onChange={handleChange} required />
        <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
        <input type="password" name="password" placeholder="Contraseña" onChange={handleChange} required />
        
        {/* AHORA EL BOTÓN ESTÁ AQUÍ */}
        <button type="submit" className="submit-circle-btn">
          ➡️
        </button>
      </form>

      <button className="google-btn" onClick={handleGoogleSignUp}>
        <img
          src="https://www.google.com/favicon.ico"
          alt="Google Icon"
          style={{ width: '20px', marginRight: '10px' }}
        />
        Registrarse con Google
      </button>

      <div className="form-links">
        <span>¿Ya tienes una cuenta?</span>
        <Link to="/login">Inicia sesión</Link>
      </div>
    </div>
  );
};

export default Registro;
