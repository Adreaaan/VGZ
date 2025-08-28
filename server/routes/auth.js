const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const { validateUserRegistration, validateUserLogin } = require('../middleware');

// Rutas de autenticación
router.post('/register', validateUserRegistration, usuarioController.registrar);
router.post('/login', validateUserLogin, usuarioController.login);

module.exports = router;
