require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const { errorHandler, notFound } = require('./middleware');

// Importar controladores
const usuarioController = require('./controllers/usuarioController');
const postController = require('./controllers/postController');
const videojuegoController = require('./controllers/videojuegoController');
const misNotasController = require('./controllers/misNotasController');

// Importar middleware de autenticación
const { auth } = require('./middleware');

const app = express();
const PORT = 5002; // Forzar puerto 5002

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

// Rutas de autenticación
app.post('/api/auth/register', usuarioController.registrar);
app.post('/api/auth/login', usuarioController.login);

// Rutas de posts
app.get('/api/posts/feed', auth, postController.obtenerFeed);
app.get('/api/posts/explore', auth, postController.obtenerExplorar);
app.post('/api/posts', auth, postController.crearPost);
app.post('/api/posts/:id/like', auth, postController.toggleLike);
app.delete('/api/posts/:id', auth, postController.eliminarPost);

// Rutas de videojuegos
app.get('/api/videojuegos', auth, videojuegoController.obtenerVideojuegos);
app.get('/api/videojuegos/buscar', auth, videojuegoController.buscarVideojuegos);

// Rutas de usuarios
app.get('/api/usuarios/buscar', auth, usuarioController.buscarUsuarios);
app.get('/api/usuarios/sugeridos', auth, usuarioController.obtenerUsuariosSugeridos);
app.get('/api/usuarios/:id', auth, usuarioController.obtenerPerfil);
app.post('/api/usuarios/:id/seguir', auth, usuarioController.seguirUsuario);
app.delete('/api/usuarios/:id/seguir', auth, usuarioController.dejarDeSeguir);
app.put('/api/usuarios/perfil', auth, usuarioController.actualizarPerfil);

console.log('Rutas configuradas correctamente');

// Middleware de manejo de errores
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose exitosamente en puerto ${PORT}`);
  console.log(`📍 URL: http://localhost:${PORT}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`❌ Puerto ${PORT} ocupado, intentando puerto ${PORT + 1}`);
    app.listen(PORT + 1, () => {
      console.log(`🚀 Servidor ejecutándose exitosamente en puerto ${PORT + 1}`);
      console.log(`📍 URL: http://localhost:${PORT + 1}`);
    });
  } else {
    console.error('❌ Error del servidor:', err);
  }
});

