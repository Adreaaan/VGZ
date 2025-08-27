const express = require('express');
const router = express.Router();

// Importar rutas individuales
const authRoutes = require('./auth');
const postsRoutes = require('./posts');
const gamesRoutes = require('./games');
const usersRoutes = require('./users');
const notesRoutes = require('./notes');
const notificationsRoutes = require('./notifications');

// Configurar rutas con sus prefijos
router.use('/auth', authRoutes);
router.use('/posts', postsRoutes);
router.use('/videojuegos', gamesRoutes);
router.use('/usuarios', usersRoutes);
router.use('/notas', notesRoutes);
router.use('/notifications', notificationsRoutes);

module.exports = router;
