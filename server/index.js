require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const { errorHandler, notFound } = require('./middleware');
const fs = require('fs');
const path = require('path');

// Importar rutas organizadas
const apiRoutes = require('./routes');

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

// Usar rutas organizadas
app.use('/api', apiRoutes);

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

// Crear directorio de uploads si no existe
const uploadsDir = path.join(__dirname, 'public', 'uploads', 'avatars');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

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

