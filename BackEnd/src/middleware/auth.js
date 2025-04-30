// middleware/auth.js
const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario');

const requireAuth = async (req, res, next) => {
  try {
    // Leer el token de la cookie
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ mensaje: 'No autenticado. Token no encontrado.' });
    }

    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Buscar al usuario por ID decodificado
    const usuario = await Usuario.findById(decoded.id);
    if (!usuario) {
      return res.status(401).json({ mensaje: 'Usuario no válido.' });
    }

    // Agregar usuario a la request
    req.user = usuario;

    // Continuar con la siguiente función
    next();
  } catch (err) {
    console.error('Error en requireAuth:', err);
    return res.status(401).json({ mensaje: 'Autenticación inválida.' });
  }
};

module.exports = requireAuth;
