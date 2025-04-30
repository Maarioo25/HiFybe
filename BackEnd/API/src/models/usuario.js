const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
  nombre:              { type: String,  required: true, trim: true },
  apodo:               { type: String,  required: true, trim: true },
  email:               { type: String,  required: true, unique: true, trim: true },
  password:            { type: String,  required: true },
  googleId:            { type: String,  unique: true, sparse: true, trim: true },
  biografia:           { type: String,  default: '' },
  ubicacion_lat:       { type: Number,  default: null },
  ubicacion_lon:       { type: Number,  default: null },
  foto_perfil:         { type: String,  default: '' },
  fecha_registro:      { type: Date,    default: Date.now },
  ultima_conexion:     { type: Date,    default: Date.now },
  contrasena_reset_token:      { type: String, default: null },
  contrasena_reset_expiracion: { type: Date,   default: null }
}, {
  collection: 'usuarios',
  collation: { locale: 'es', strength: 2 }
});

usuarioSchema.index({ apodo: 1 }, { unique: true });
usuarioSchema.index({ googleId: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Usuario', usuarioSchema);
