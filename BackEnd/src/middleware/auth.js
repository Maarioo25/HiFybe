// middleware/auth.js
const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario');

module.exports = async function requireAuth(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ mensaje: 'No autenticado. Token no encontrado.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await Usuario.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ mensaje: 'Usuario no encontrado.' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Error en requireAuth:', err);
    return res.status(401).json({ mensaje: 'Token inválido o expirado.' });
  }
};
