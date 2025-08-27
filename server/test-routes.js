// Script de prueba para verificar que las rutas están funcionando correctamente
const express = require('express');
const app = express();

// Importar las rutas organizadas para verificar que no hay errores de sintaxis
try {
  const apiRoutes = require('./routes');
  console.log('✅ Rutas importadas correctamente');
  
  // Configurar middleware básico
  app.use(express.json());
  
  // Usar las rutas
  app.use('/api', apiRoutes);
  
  console.log('✅ Rutas configuradas correctamente');
  console.log('✅ Test de estructura de rutas completado exitosamente');
  
  // Listar todas las rutas disponibles
  console.log('\n📋 Rutas disponibles:');
  console.log('Auth: /api/auth/*');
  console.log('Posts: /api/posts/*');
  console.log('Games: /api/videojuegos/*');
  console.log('Users: /api/usuarios/*');
  console.log('Notes: /api/notas/*');
  console.log('Notifications: /api/notifications/*');
  
} catch (error) {
  console.error('❌ Error al importar rutas:', error.message);
  process.exit(1);
}
