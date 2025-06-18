require('dotenv').config();
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const connectDB = require('./config/database');
const { errorHandler, notFound } = require('./middleware');

// Importar controladores con los nombres correctos
const { usuarioController, postController, videojuegoController, misNotasController } = require('./controllers');

const app = express();
const PORT = process.env.PORT || 5000;

// Conectar a la base de datos
connectDB();

// Middleware
app.use(cors());
app.use(compression());
app.use(express.json())

app.get('*', (req, res) => {
  res.json({ message: "Un saludo desde el servidor!" })
})

// Rutas básicas de prueba
app.get('/', (req, res) => {
  res.json({ mensaje: 'VGZ API funcionando' });
});

// Rutas de autenticación
app.post('/api/auth/register', usuarioController.registrar);
app.post('/api/auth/login', usuarioController.login);

// Rutas de posts
app.get('/api/posts/feed', postController.obtenerFeed);
app.get('/api/posts/explore', postController.obtenerFeed);
app.post('/api/posts', postController.crearPost);
app.post('/api/posts/:id/like', postController.toggleLike);

// Rutas de videojuegos
app.get('/api/videojuegos', videojuegoController.obtenerVideojuegos);
app.get('/api/videojuegos/buscar', videojuegoController.buscarVideojuegos);

// Middleware de manejo de errores
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en puerto ${PORT}`)
})

