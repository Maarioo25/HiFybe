const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario');

module.exports = async (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).json({ mensaje: '🔒 No autenticado. Token no encontrado.' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const usuario = await Usuario.findById(decoded.id);
    if (!usuario) {
      return res.status(401).json({ mensaje: '🔍 Usuario no encontrado.' });
    }
    req.user = usuario;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ mensaje: '🕒 Tu sesión expiró. Vuelve a iniciar sesión.' });
    }
    return res.status(401).json({ mensaje: '🔒 Token inválido. Acceso denegado.' });
  }
};
