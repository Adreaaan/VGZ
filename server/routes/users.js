const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const { auth } = require('../middleware');
const upload = require('../middleware/upload');

// Rutas de usuarios
router.get('/buscar', auth, usuarioController.buscarUsuarios);
router.get('/sugeridos', auth, usuarioController.obtenerUsuariosSugeridos);
router.get('/:id', auth, usuarioController.obtenerPerfil);
router.post('/:usuarioId/seguir', auth, usuarioController.seguirUsuario);
router.delete('/:usuarioId/seguir', auth, usuarioController.dejarDeSeguir);
router.put('/perfil', auth, usuarioController.actualizarPerfil);
router.post('/upload-avatar', auth, upload.single('avatar'), usuarioController.uploadAvatar);

module.exports = router;
