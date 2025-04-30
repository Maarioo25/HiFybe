const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const session = require('express-session');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const bcrypt = require('bcryptjs');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

dotenv.config();

const app = express();

// Middleware básico
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Session para Passport
app.use(session({
  secret: process.env.SESSION_SECRET || 'default_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  },
}));

// Inicialización de Passport
app.use(passport.initialize());
app.use(passport.session());

// Serialización y deserialización de usuario
passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const User = require('./src/models/usuario');
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Configurar estrategia de Google
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/usuarios/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const User = require('./src/models/usuario');
    const email = profile.emails[0].value;

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        googleId: profile.id,
        nombre: profile.name.givenName,
        apellidos: profile.name.familyName || '',
        email: email,
        foto_perfil: profile.photos?.[0]?.value || '',
        password: await bcrypt.hash(Math.random().toString(36), 10),
        auth_proveedor: 'google'
      });
      await user.save();
    }

    done(null, user);
  } catch (err) {
    done(err, null);
  }
}));

// Swagger
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'API de HiFybe',
      version: '1.0.0',
      description: 'Documentación de la API con Swagger'
    },
    servers: [{ url: 'http://localhost:5000', description: 'API Local' }]
  },
  apis: ['./src/routes/*.js']
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Rutas
app.use('/usuarios', require('./src/routes/usuariosRoutes'));
app.use('/canciones', require('./src/routes/cancionesRoutes'));
app.use('/playlists', require('./src/routes/playlistsRoutes'));
app.use('/reproducciones', require('./src/routes/reproduccionesRoutes'));
app.use('/amistades', require('./src/routes/amistadesRoutes'));
app.use('/conversaciones', require('./src/routes/conversacionesRoutes'));
app.use('/notificaciones', require('./src/routes/notificacionesRoutes'));

// Conexión a MongoDB y arranque del servidor
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log('✅ Conexión a MongoDB realizada');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
      console.log(`📚 Swagger disponible en http://localhost:${PORT}/docs`);
    });
  })
  .catch(err => {
    console.error('❌ Error conectando a MongoDB:', err);
  });
