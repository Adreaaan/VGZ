const express = require('express');
const router = express.Router();
const videojuegoController = require('../controllers/videojuegoController');
const { auth } = require('../middleware');

// Rutas de videojuegos
router.get('/', videojuegoController.obtenerVideojuegos);
router.get('/buscar', videojuegoController.buscarVideojuegos);
router.get('/genres', videojuegoController.obtenerSoloGeneros);
router.get('/developers', videojuegoController.obtenerSoloDesarrolladores);
router.get('/:id/estadisticas', auth, videojuegoController.obtenerEstadisticas);
router.get('/:id', videojuegoController.obtenerVideojuegoPorId);
router.post('/', auth, videojuegoController.crearVideojuego);
router.put('/:id', auth, videojuegoController.actualizarVideojuego);

module.exports = router;
