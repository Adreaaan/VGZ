const express = require('express');
const router = express.Router();
const misNotasController = require('../controllers/misNotasController');
const { auth } = require('../middleware');

// Rutas de notas
router.get('/', auth, misNotasController.obtenerNotas);
router.get('/publicas/:usuarioId', auth, misNotasController.obtenerNotasPublicas);
router.get('/:id', auth, misNotasController.obtenerNotaPorId);
router.post('/', auth, misNotasController.crearNota);
router.put('/:id', auth, misNotasController.actualizarNota);
router.delete('/:id', auth, misNotasController.eliminarNota);

module.exports = router;
