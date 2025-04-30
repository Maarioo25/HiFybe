const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

dotenv.config();

const app = express();

app.use(cookieParser());
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Inicialización de Passport
app.use(passport.initialize());

// Configuración de la estrategia de Google para Passport
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/usuarios/google/callback", // Ruta de callback en tu backend
    scope: ['profile', 'email'] // Información que solicitas a Google
  },
  async (accessToken, refreshToken, profile, done) => {
    // Esta función se llama cuando Google responde
    try {
        const User = require('./src/models/usuario'); // Asegúrate de la ruta correcta

        // Buscar usuario por email (Google ID también es una opción)
        let user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
            // Usuario existente, autenticarlo
            done(null, user);
        } else {
            // Nuevo usuario, crearlo en la base de datos
            const newUser = new User({
                googleId: profile.id,
                nombre: profile.name.givenName,
                apellidos: profile.name.familyName || '',
                email: profile.emails[0].value,
                foto_perfil: profile.photos?.[0]?.value || '',
                foto_perfil: profile.photos[0].value,
                password: await bcrypt.hash(Math.random().toString(36), 10)
            });
            const savedUser = await newUser.save();
            done(null, savedUser);
        }
    } catch (err) {
        done(err, null);
    }
  }
));


const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'API de HiFybe',
      version: '1.0.0',
      description: 'Documentación de la API con Swagger'
    },
    servers: [
      { url: 'http://localhost:5000', description: 'API Local'}
    ]
  },
  apis: ['./src/routes/*.js']
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

const requireAuth = require('./src/middleware/auth');
app.get('/', requireAuth, (req, res) => {
  res.send('La API Funciona');
});

app.use('/usuarios', require('./src/routes/usuariosRoutes'));
app.use('/canciones', require('./src/routes/cancionesRoutes'));
app.use('/playlists', require('./src/routes/playlistsRoutes'));
app.use('/reproducciones', require('./src/routes/reproduccionesRoutes'));
app.use('/amistades', require('./src/routes/amistadesRoutes'));
app.use('/conversaciones', require('./src/routes/conversacionesRoutes'));
app.use('/notificaciones', require('./src/routes/notificacionesRoutes'));

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('Conexión a MongoDB realizada');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
      console.log(`Swagger disponible en http://localhost:${PORT}/docs`);
    });
})
.catch(err => {
    console.error('Error conectando a MongoDB:', err);
});
