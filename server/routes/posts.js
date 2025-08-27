const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { auth } = require('../middleware');

// Rutas de posts
router.get('/feed', auth, postController.obtenerFeed);
router.get('/explore', auth, postController.obtenerExplorar);
router.get('/game/:gameId', auth, postController.obtenerPostsPorJuego);
router.get('/usuario/:usuarioId', auth, postController.obtenerPostsUsuario);
router.get('/liked/:usuarioId', auth, postController.obtenerPostsLikeados);
router.get('/:id', auth, postController.obtenerPost);
router.post('/', auth, postController.crearPost);
router.post('/:id/like', auth, postController.toggleLike);
router.delete('/:id', auth, postController.eliminarPost);

module.exports = router;
