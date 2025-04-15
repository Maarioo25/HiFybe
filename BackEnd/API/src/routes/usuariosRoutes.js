const express = require('express');
const router = express.Router();
const {
  registrarUsuario,
  loginUsuario,
  obtenerUsuarios,
  obtenerUsuarioPorId,
  actualizarUsuario,
  eliminarUsuario,
  solicitarResetContrasena,
  resetearContrasena
} = require('../controllers/usuariosController');

/**
 * @swagger
 * tags:
 *   name: Usuarios
 *   description: Operaciones relacionadas con la gestión de usuarios en la aplicación
 */

/**
 * @swagger
 * /usuarios/register:
 *   post:
 *     summary: Registro de un nuevo usuario
 *     description: Endpoint para crear un nuevo usuario en la plataforma.
 *     tags: [Usuarios]
 *     requestBody:
 *       description: Datos necesarios para registrar el usuario.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nombre completo del usuario.
 *               apodo:
 *                 type: string
 *                 description: Apodo del usuario.
 *               email:
 *                 type: string
 *                 description: Dirección de correo electrónico del usuario.
 *               password:
 *                 type: string
 *                 description: Contraseña para acceder a la cuenta.
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente.
 */
router.post('/register', registrarUsuario);

/**
 * @swagger
 * /usuarios/login:
 *   post:
 *     summary: Autenticación de usuario
 *     description: Endpoint para iniciar sesión con las credenciales del usuario.
 *     tags: [Usuarios]
 *     requestBody:
 *       description: Credenciales de acceso del usuario.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: Correo electrónico del usuario.
 *               password:
 *                 type: string
 *                 description: Contraseña del usuario.
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso.
 */
router.post('/login', loginUsuario);

/**
 * @swagger
 * /usuarios:
 *   get:
 *     summary: Listado de usuarios
 *     description: Endpoint para obtener la lista de todos los usuarios registrados.
 *     tags: [Usuarios]
 *     responses:
 *       200:
 *         description: Se devuelve la lista de todos los usuarios.
 */
router.get('/', obtenerUsuarios);

/**
 * @swagger
 * /usuarios/{id}:
 *   get:
 *     summary: Obtener información de un usuario por su ID
 *     description: Recupera los datos completos de un usuario a partir del identificador proporcionado.
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID único del usuario.
 *     responses:
 *       200:
 *         description: Se retornan los datos del usuario.
 *       400:
 *         description: ID inválido.
 *       404:
 *         description: No se encontró un usuario con ese ID.
 */
router.get('/:id', obtenerUsuarioPorId);

/**
 * @swagger
 * /usuarios/{id}:
 *   put:
 *     summary: Actualización de datos de usuario
 *     description: Actualiza la información de un usuario existente identificándolo por su ID.
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Identificador único del usuario.
 *     requestBody:
 *       description: Objeto JSON con la información actualizada del usuario.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               apodo:
 *                 type: string
 *               biografia:
 *                 type: string
 *               foto_perfil:
 *                 type: string
 *             example:
 *               nombre: "Nuevo Nombre"
 *               apodo: "NuevoApodo"
 *               biografia: "Nueva biografía"
 *               foto_perfil: "https://imagen.jpg"
 *     responses:
 *       200:
 *         description: Usuario actualizado correctamente.
 *       404:
 *         description: No se encontró un usuario con ese ID.
 */

router.put('/:id', actualizarUsuario);

/**
 * @swagger
 * /usuarios/{id}:
 *   delete:
 *     summary: Eliminación de usuario
 *     description: Elimina el usuario identificado por su ID.
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario a eliminar.
 *     responses:
 *       200:
 *         description: Usuario eliminado satisfactoriamente.
 *       404:
 *         description: Usuario no encontrado.
 */
router.delete('/:id', eliminarUsuario);

/**
 * @swagger
 * /usuarios/solicitar-reset:
 *   post:
 *     summary: Solicitar reseteo de contraseña
 *     description: Genera un token para realizar el reseteo de contraseña del usuario.
 *     tags: [Usuarios]
 *     requestBody:
 *       description: Correo electrónico asociado a la cuenta del usuario para solicitar el reseteo.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: Correo electrónico del usuario.
 *     responses:
 *       200:
 *         description: Se generó y envió el token para reseteo de contraseña.
 */
router.post('/solicitar-reset', solicitarResetContrasena);

/**
 * @swagger
 * /usuarios/resetear-contrasena/{token}:
 *   post:
 *     summary: Reseteo de contraseña
 *     description: Permite al usuario actualizar su contraseña utilizando el token previamente generado.
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Token único para el reseteo de contraseña.
 *     requestBody:
 *       description: Nueva contraseña que se asignará al usuario.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nuevaContrasena:
 *                 type: string
 *                 description: Nueva contraseña deseada.
 *     responses:
 *       200:
 *         description: Contraseña actualizada correctamente.
 */
router.post('/resetear-contrasena/:token', resetearContrasena);

module.exports = router;
