const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { auth } = require('../middleware');

// Rutas de notificaciones
router.get('/', auth, notificationController.obtenerNotificaciones);
router.get('/unread-count', auth, notificationController.obtenerContadorNoLeidas);
router.put('/:notificationId/read', auth, notificationController.marcarComoLeida);
router.put('/mark-all-read', auth, notificationController.marcarTodasComoLeidas);

module.exports = router;
