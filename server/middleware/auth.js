const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    console.log('Auth middleware - Token recibido:', token ? 'Sí' : 'No'); // Debug
    
    if (!token) {
      return res.status(401).json({ mensaje: 'Acceso denegado. Token no proporcionado.' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu_jwt_secret_muy_seguro_aqui');
    console.log('Token decodificado - userId:', decoded.userId); // Debug
    
    const usuario = await Usuario.findById(decoded.userId).select('-password');
    
    if (!usuario) {
      return res.status(401).json({ mensaje: 'Token inválido. Usuario no encontrado.' });
    }
    
    if (!usuario.activo) {
      return res.status(401).json({ mensaje: 'Cuenta desactivada.' });
    }
    
    req.userId = decoded.userId;
    req.usuario = usuario;
    console.log('Auth exitoso para usuario:', usuario.username); // Debug
    next();
  } catch (error) {
    console.error('Error en auth middleware:', error); // Debug
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ mensaje: 'Token inválido.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ mensaje: 'Token expirado.' });
    }
    res.status(500).json({ mensaje: 'Error del servidor en autenticación.' });
  }
};

// Middleware opcional - no requiere autenticación pero agrega info del usuario si está logueado
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      const usuario = await Usuario.findById(decoded.userId).select('-password');
      
      if (usuario && usuario.activo) {
        req.userId = decoded.userId;
        req.usuario = usuario;
      }
    }
    
    next();
  } catch (error) {
    // En auth opcional, continuamos sin autenticación si hay error
    next();
  }
};

module.exports = { auth, optionalAuth };
