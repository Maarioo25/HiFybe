const Usuario = require('../models/usuario');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');


const limpiarUsuario = (usuario) => {
  const { password, contrasena_reset_token, contrasena_reset_expiracion, email, ubicacion_lat, ubicacion_lon, ultima_conexion, __v, ...resto } = usuario._doc;
  return resto;
};

exports.registrarUsuario = async (req, res) => {
  const { nombre, apodo, email, password } = req.body;

  const usuarioExiste = await Usuario.findOne({ $or: [{ email }, { apodo }] });
  if (usuarioExiste) return res.status(400).json({ mensaje: 'Email o apodo ya registrados.' });

  const hashedPassword = await bcrypt.hash(password, 10);
  const usuario = await Usuario.create({ nombre, apodo, email, password: hashedPassword });

  res.status(201).json({ mensaje: 'Usuario registrado exitosamente.' });
};

exports.loginUsuario = async (req, res) => {
  const { email, password } = req.body;

  const usuario = await Usuario.findOne({ email });
  if (!usuario) return res.status(400).json({ mensaje: 'Credenciales inválidas.' });

  const valido = await bcrypt.compare(password, usuario.password);
  if (!valido) return res.status(400).json({ mensaje: 'Credenciales inválidas.' });

  const token = jwt.sign({ id: usuario._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

  res.json({ mensaje: 'Login exitoso.', token });
};

exports.obtenerUsuarios = async (req, res) => {
  const usuarios = await Usuario.find();
  const usuariosLimpios = usuarios.map(u => limpiarUsuario(u));
  res.json(usuariosLimpios);
};

exports.obtenerUsuarioPorId = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ mensaje: 'ID inválido.' });
  }

  const usuario = await Usuario.findById(req.params.id);
  if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
  res.json(limpiarUsuario(usuario));
};

exports.actualizarUsuario = async (req, res) => {
  if (req.body.password) {
    req.body.password = await bcrypt.hash(req.body.password, 10);
  }

  const usuario = await Usuario.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado.' });

  res.json({ mensaje: 'Usuario actualizado.', usuario: limpiarUsuario(usuario) });
};

exports.eliminarUsuario = async (req, res) => {
  const usuario = await Usuario.findByIdAndDelete(req.params.id);
  if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado.' });

  res.json({ mensaje: 'Usuario eliminado.' });
};

exports.solicitarResetContrasena = async (req, res) => {
  const usuario = await Usuario.findOne({ email: req.body.email });
  if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado.' });

  const resetToken = jwt.sign({ id: usuario._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  usuario.contrasena_reset_token = resetToken;
  usuario.contrasena_reset_expiracion = Date.now() + 3600000;
  await usuario.save();

  res.json({ mensaje: 'Token de reseteo generado.' });
};

exports.resetearContrasena = async (req, res) => {
  const usuario = await Usuario.findOne({
    contrasena_reset_token: req.params.token,
    contrasena_reset_expiracion: { $gt: Date.now() },
  });

  if (!usuario) return res.status(400).json({ mensaje: 'Token inválido o expirado.' });

  usuario.password = await bcrypt.hash(req.body.nuevaContrasena, 10);
  usuario.contrasena_reset_token = null;
  usuario.contrasena_reset_expiracion = null;
  await usuario.save();

  res.json({ mensaje: 'Contraseña actualizada exitosamente.' });
};
