import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const res = await axios.get('http://localhost:5000/usuarios'); 
        setUsuarios(res.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchUsuarios();
  }, []);

  return (
    <div>
      <h2>Listado de Usuarios</h2>
      <ul>
        {usuarios.map(usuario => (
          <li key={usuario._id}>
            {usuario.nombre} ({usuario.email})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;
