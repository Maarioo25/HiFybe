const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

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

app.get('/', (req, res) => {
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
