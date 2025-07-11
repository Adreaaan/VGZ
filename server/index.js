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
const notificationController = require('./controllers/notificationController');

// Importar middleware de autenticación
const { auth } = require('./middleware');

const app = express();
const PORT = 5002; // Cambiar a puerto libre

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
app.get('/api/posts/game/:gameId', auth, postController.obtenerPostsPorJuego);
app.get('/api/posts/:id', auth, postController.obtenerPost);
app.post('/api/posts', auth, postController.crearPost);
app.post('/api/posts/:id/like', auth, postController.toggleLike);
app.delete('/api/posts/:id', auth, postController.eliminarPost);

// Rutas de videojuegos
app.get('/api/videojuegos', auth, videojuegoController.obtenerVideojuegos);
app.get('/api/videojuegos/buscar', auth, videojuegoController.buscarVideojuegos);
app.get('/api/videojuegos/genres', auth, videojuegoController.obtenerGeneros);
app.get('/api/videojuegos/developers', auth, videojuegoController.obtenerDesarrolladores);
app.get('/api/videojuegos/:id', auth, videojuegoController.obtenerVideojuegoPorId);

// Rutas de usuarios
app.get('/api/usuarios/buscar', auth, usuarioController.buscarUsuarios);
app.get('/api/usuarios/sugeridos', auth, usuarioController.obtenerUsuariosSugeridos);
app.get('/api/usuarios/:id', auth, usuarioController.obtenerPerfil);
app.post('/api/usuarios/:usuarioId/seguir', auth, usuarioController.seguirUsuario);
app.delete('/api/usuarios/:usuarioId/seguir', auth, usuarioController.dejarDeSeguir);
app.put('/api/usuarios/perfil', auth, usuarioController.actualizarPerfil);

// Rutas de notificaciones
app.get('/api/notifications', auth, notificationController.obtenerNotificaciones);
app.get('/api/notifications/unread-count', auth, notificationController.obtenerContadorNoLeidas);
app.put('/api/notifications/:notificationId/read', auth, notificationController.marcarComoLeida);
app.put('/api/notifications/mark-all-read', auth, notificationController.marcarTodasComoLeidas);

// Servir archivos estáticos
app.use(express.static('public'));

// Middleware para manejar imagen placeholder
app.get('/placeholder-game.jpg', (req, res) => {
  // Enviar una imagen SVG simple como placeholder
  const svgPlaceholder = `
    <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="300" height="200" fill="#2d3748"/>
      <text x="150" y="100" text-anchor="middle" fill="#a0aec0" font-family="Arial" font-size="16">
        Imagen no disponible
      </text>
    </svg>
  `;
  
  res.setHeader('Content-Type', 'image/svg+xml');
  res.send(svgPlaceholder);
});

console.log('Rutas configuradas correctamente');

// Middleware de manejo de errores
app.use(notFound);
app.use(errorHandler);

const server = app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose exitosamente en puerto ${PORT}`);
  console.log(`📍 URL: http://localhost:${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`❌ Puerto ${PORT} ocupado. Cerrando proceso existente...`);
    
    // Kill any process using port 5002
    const { exec } = require('child_process');
    exec(`netstat -ano | findstr :${PORT}`, (error, stdout) => {
      if (stdout) {
        const lines = stdout.split('\n');
        lines.forEach(line => {
          const parts = line.trim().split(/\s+/);
          if (parts.length > 4) {
            const pid = parts[parts.length - 1];
            if (pid && pid !== '0') {
              exec(`taskkill /PID ${pid} /F`, () => {
                console.log(`🔄 Proceso ${pid} terminado. Reintentando...`);
                setTimeout(() => {
                  app.listen(PORT, () => {
                    console.log(`🚀 Servidor ejecutándose exitosamente en puerto ${PORT}`);
                    console.log(`📍 URL: http://localhost:${PORT}`);
                  });
                }, 1000);
              });
            }
          }
        });
      }
    });
  } else {
    console.error('❌ Error del servidor:', err);
  }
});

