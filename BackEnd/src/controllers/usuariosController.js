// controllers/authController.js
const Usuario = require('../models/usuario');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { OAuth2Client } = require('google-auth-library');

// Configura cliente OAuth2 de Google
const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.API_URL}/auth/google/callback`
);

// Helpers
const limpiarUsuario = (usuario) => {
  const {
    password,
    contrasena_reset_token,
    contrasena_reset_expiracion,
    __v,
    ...resto
  } = usuario._doc;
  return resto;
};

// Registro manual
exports.registrarUsuario = async (req, res) => {
  try {
    const { nombre, apellidos, email, password } = req.body;
    const usuarioExiste = await Usuario.findOne({ email });
    if (usuarioExiste) return res.status(400).json({ mensaje: 'Email ya registrado.' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const usuario = await Usuario.create({ nombre, apellidos, email, password: hashedPassword });

    const token = jwt.sign({ id: usuario._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ mensaje: 'Usuario registrado exitosamente.', usuario: limpiarUsuario(usuario), token });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al registrar usuario.' });
  }
};

// Login manual
exports.loginUsuario = async (req, res) => {
  try {
    const { email, password } = req.body;
    const usuario = await Usuario.findOne({ email });
    if (!usuario) return res.status(400).json({ mensaje: 'Credenciales inválidas.' });

    const valido = await bcrypt.compare(password, usuario.password);
    if (!valido) return res.status(400).json({ mensaje: 'Credenciales inválidas.' });

    const token = jwt.sign({ id: usuario._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
    });

    res.json({ mensaje: 'Login exitoso.', usuario: limpiarUsuario(usuario), token });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al iniciar sesión.' });
  }
};

// Obtener todos los usuarios
exports.obtenerUsuarios = async (_req, res) => {
  const usuarios = await Usuario.find();
  res.json(usuarios.map(u => limpiarUsuario(u)));
};

// Obtener usuario por ID
exports.obtenerUsuarioPorId = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ mensaje: 'ID inválido.' });
  }
  const usuario = await Usuario.findById(id);
  if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
  res.json(limpiarUsuario(usuario));
};

// Actualizar usuario
exports.actualizarUsuario = async (req, res) => {
  try {
    if (req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password, 10);
    }
    const usuario = await Usuario.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
    res.json({ mensaje: 'Usuario actualizado.', usuario: limpiarUsuario(usuario) });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al actualizar usuario.' });
  }
};

// Eliminar usuario
exports.eliminarUsuario = async (req, res) => {
  const usuario = await Usuario.findByIdAndDelete(req.params.id);
  if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
  res.json({ mensaje: 'Usuario eliminado.' });
};

// Solicitar reset de contraseña
exports.solicitarResetContrasena = async (req, res) => {
  const { email } = req.body;
  const usuario = await Usuario.findOne({ email });
  if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado.' });

  const resetToken = jwt.sign({ id: usuario._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  usuario.contrasena_reset_token = resetToken;
  usuario.contrasena_reset_expiracion = Date.now() + 3600000;
  await usuario.save();

  res.json({ mensaje: 'Token de reseteo generado.' });
};

// Resetear contraseña
exports.resetearContrasena = async (req, res) => {
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
};

// Iniciar OAuth con Google
exports.googleAuth = (_req, res) => {
  const url = googleClient.generateAuthUrl({
    access_type: 'offline',
    scope: ['profile', 'email']
  });
  res.redirect(url);
};

// Callback de Google
exports.googleCallback = async (req, res) => {
  try {
    const { code } = req.query;
    const { tokens } = await googleClient.getToken(code);
    googleClient.setCredentials(tokens);

    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();

    let usuario = await Usuario.findOne({ googleId: payload.sub });
    if (!usuario) usuario = await Usuario.findOne({ email: payload.email });

    if (!usuario) {
      const [nombre, ...apellidosArr] = payload.name.split(' ');
      usuario = await Usuario.create({
        nombre:      nombre,
        apellidos:   apellidosArr.join(' '),
        email:       payload.email,
        password:    await bcrypt.hash(Math.random().toString(36), 10),
        googleId:    payload.sub,
        foto_perfil: payload.picture
      });
    } else if (!usuario.googleId) {
      usuario.googleId = payload.sub;
      await usuario.save();
    }

    const token = jwt.sign({ id: usuario._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.redirect(`${process.env.FRONTEND_URL}/dashboard?token=${token}`);
  } catch (err) {
    res.status(500).json({ error: 'Error en autenticación con Google' });
  }
};