require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const { errorHandler, notFound } = require('./middleware');

// Importar controladores individualmente para debug
const usuarioController = require('./controllers/usuarioController');
const postController = require('./controllers/postController');
const videojuegoController = require('./controllers/videojuegoController');
const misNotasController = require('./controllers/misNotasController');

// Importar middleware de autenticación
const { auth } = require('./middleware');

const app = express();
const PORT = process.env.PORT || 5000;

// Conectar a la base de datos
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Middleware de logging para debug
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Rutas básicas de prueba
app.get('/', (req, res) => {
  res.json({ mensaje: 'VGZ API funcionando' });
});

// Verificar que las funciones existen antes de usarlas
console.log('usuarioController.googleLogin:', typeof usuarioController.googleLogin);
console.log('postController.obtenerExplorar:', typeof postController.obtenerExplorar);

// Rutas de autenticación
app.post('/api/auth/register', usuarioController.registrar);
app.post('/api/auth/login', usuarioController.login);
if (usuarioController.googleLogin) {
  app.post('/api/auth/google', usuarioController.googleLogin);
}

// Rutas de posts
app.get('/api/posts/feed', auth, postController.obtenerFeed);
if (postController.obtenerExplorar) {
  app.get('/api/posts/explore', auth, postController.obtenerExplorar);
} else {
  app.get('/api/posts/explore', auth, postController.obtenerFeed);
}
app.post('/api/posts', auth, postController.crearPost);
app.post('/api/posts/:id/like', auth, postController.toggleLike);

// Rutas de videojuegos
app.get('/api/videojuegos', auth, videojuegoController.obtenerVideojuegos);
app.get('/api/videojuegos/buscar', auth, videojuegoController.buscarVideojuegos);

console.log('Rutas configuradas correctamente');

// Middleware de manejo de errores
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en puerto ${PORT}`);
});

