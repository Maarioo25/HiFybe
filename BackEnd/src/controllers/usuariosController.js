const Usuario = require('../models/usuario');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const passport = require('passport');

// ===================== HELPERS ===================== //

const limpiarUsuario = (usuario) => {
  if (!usuario || !usuario._doc) return usuario;
  const {
    password,
    contrasena_reset_token,
    contrasena_reset_expiracion,
    __v,
    ...resto
  } = usuario._doc;
  return resto;
};

const emitirTokenYCookie = (usuario, res) => {
  const token = jwt.sign({ id: usuario._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  return token;
};

// ===================== REGISTRO ===================== //

exports.registrarUsuario = async (req, res) => {
  try {
    const { nombre, apellidos, email, password } = req.body;
    const usuarioExiste = await Usuario.findOne({ email });
    if (usuarioExiste) return res.status(400).json({ mensaje: 'Email ya registrado.' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const usuario = await Usuario.create({ nombre, apellidos, email, password: hashedPassword });

    res.status(201).json({
      mensaje: 'Usuario registrado exitosamente.',
      usuario: limpiarUsuario(usuario)
    });
  } catch (err) {
    console.error('Error en registrarUsuario:', err);
    res.status(500).json({ mensaje: 'Error al registrar usuario.' });
  }
};

// ===================== LOGIN ===================== //

exports.loginUsuario = async (req, res) => {
  try {
    const { email, password } = req.body;
    const usuario = await Usuario.findOne({ email });
    if (!usuario) return res.status(400).json({ mensaje: 'Credenciales inválidas.' });

    const valido = await bcrypt.compare(password, usuario.password);
    if (!valido) return res.status(400).json({ mensaje: 'Credenciales inválidas.' });

    usuario.ultima_conexion = Date.now();
    await usuario.save();

    emitirTokenYCookie(usuario, res);

    res.json({
      mensaje: 'Login exitoso.',
      usuario: limpiarUsuario(usuario)
    });
  } catch (err) {
    console.error('Error en loginUsuario:', err);
    res.status(500).json({ mensaje: 'Error al iniciar sesión.' });
  }
};

// ===================== AUTENTICACIÓN ACTUAL ===================== //

exports.getCurrentUser = (req, res) => {
  if (req.user) {
    res.json({ user: limpiarUsuario(req.user) });
  } else {
    res.status(401).json({ mensaje: 'No autenticado' });
  }
};

// ===================== CRUD USUARIOS ===================== //

exports.obtenerUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.find();
    res.json(usuarios.map(u => limpiarUsuario(u)));
  } catch (err) {
    console.error('Error en obtenerUsuarios:', err);
    res.status(500).json({ mensaje: 'Error al obtener usuarios.' });
  }
};

exports.obtenerUsuarioPorId = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ mensaje: 'ID inválido.' });
    }

    const usuario = await Usuario.findById(id);
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado.' });

    res.json(limpiarUsuario(usuario));
  } catch (err) {
    console.error('Error en obtenerUsuarioPorId:', err);
    res.status(500).json({ mensaje: 'Error al obtener usuario.' });
  }
};

exports.actualizarUsuario = async (req, res) => {
  try {
    const camposPermitidos = ['nombre', 'apellidos', 'biografia', 'foto_perfil', 'password'];
    const actualizaciones = {};

    for (const campo of camposPermitidos) {
      if (req.body[campo] !== undefined) {
        actualizaciones[campo] = req.body[campo];
      }
    }

    if (actualizaciones.password) {
      actualizaciones.password = await bcrypt.hash(actualizaciones.password, 10);
    }

    const usuario = await Usuario.findByIdAndUpdate(req.params.id, actualizaciones, { new: true });
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado.' });

    res.json({ mensaje: 'Usuario actualizado.', usuario: limpiarUsuario(usuario) });
  } catch (err) {
    console.error('Error en actualizarUsuario:', err);
    res.status(500).json({ mensaje: 'Error al actualizar usuario.' });
  }
};

exports.eliminarUsuario = async (req, res) => {
  try {
    const usuario = await Usuario.findByIdAndDelete(req.params.id);
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
    res.json({ mensaje: 'Usuario eliminado.' });
  } catch (err) {
    console.error('Error en eliminarUsuario:', err);
    res.status(500).json({ mensaje: 'Error al eliminar usuario.' });
  }
};

// ===================== CONTRASEÑA ===================== //

exports.solicitarResetContrasena = async (req, res) => {
  try {
    const { email } = req.body;
    const usuario = await Usuario.findOne({ email });
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado.' });

    const resetToken = jwt.sign({ id: usuario._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    usuario.contrasena_reset_token = resetToken;
    usuario.contrasena_reset_expiracion = Date.now() + 3600000;
    await usuario.save();

    res.json({ mensaje: 'Token de reseteo generado.' });
  } catch (err) {
    console.error('Error en solicitarResetContrasena:', err);
    res.status(500).json({ mensaje: 'Error al solicitar reseteo de contraseña.' });
  }
};

exports.resetearContrasena = async (req, res) => {
  try {
    const { token } = req.params;

    const usuario = await Usuario.findOne({
      contrasena_reset_token: token,
      contrasena_reset_expiracion: { $gt: Date.now() }
    });

    if (!usuario) return res.status(400).json({ mensaje: 'Token inválido o expirado.' });

    usuario.password = await bcrypt.hash(req.body.nuevaContrasena, 10);
    usuario.contrasena_reset_token = null;
    usuario.contrasena_reset_expiracion = null;

    await usuario.save();

    res.json({ mensaje: 'Contraseña actualizada exitosamente.' });
  } catch (err) {
    console.error('Error en resetearContrasena:', err);
    res.status(500).json({ mensaje: 'Error al resetear contraseña.' });
  }
};

// ===================== GOOGLE OAUTH ===================== //

exports.googleAuth = passport.authenticate('google', { scope: ['profile', 'email'] });

exports.googleCallback = async (req, res) => {
  if (req.user) {
    try { 
      req.user.ultima_conexion = Date.now();
      await req.user.save();

      emitirTokenYCookie(req.user, res);
      res.redirect(`${process.env.FRONTEND_URL}`);
    } catch (err) {
      console.error('Error en googleCallback:', err);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=server_error`);
    }
  } else {
    res.redirect(`${process.env.FRONTEND_URL}/login?error=google_auth_failed`);
  }
};

exports.googleAuthFailureHandler = (req, res) => {
  console.error('Autenticación con Google fallida.', req.query.message);
  res.redirect(`${process.env.FRONTEND_URL}/login?error=google_auth_failed`);
};

// ===================== LOGOUT ===================== //

exports.logoutUser = (req, res) => {
  res.clearCookie('token');
  res.json({ mensaje: 'Sesión cerrada exitosamente' });
};
