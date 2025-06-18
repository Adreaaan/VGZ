// Middleware de validación básico sin express-validator

const handleValidationErrors = (req, res, next) => {
  // Por ahora, solo pasamos al siguiente middleware
  next();
};

// Validaciones básicas para Usuario
const validateUserRegistration = [
  (req, res, next) => {
    const { username, email, password } = req.body;
    const errors = [];

    if (!username || username.length < 3 || username.length > 30) {
      errors.push({ 
        field: 'username', 
        message: 'El username debe tener entre 3 y 30 caracteres' 
      });
    }

    if (!email || !email.includes('@')) {
      errors.push({ 
        field: 'email', 
        message: 'Debe ser un email válido' 
      });
    }

    if (!password || password.length < 6) {
      errors.push({ 
        field: 'password', 
        message: 'La contraseña debe tener al menos 6 caracteres' 
      });
    }

    if (errors.length > 0) {
      return res.status(400).json({ 
        mensaje: 'Errores de validación', 
        errores: errors 
      });
    }

    next();
  }
];

const validateUserLogin = [
  (req, res, next) => {
    const { email, password } = req.body;
    const errors = [];

    if (!email || !email.includes('@')) {
      errors.push({ 
        field: 'email', 
        message: 'Debe ser un email válido' 
      });
    }

    if (!password) {
      errors.push({ 
        field: 'password', 
        message: 'La contraseña es requerida' 
      });
    }

    if (errors.length > 0) {
      return res.status(400).json({ 
        mensaje: 'Errores de validación', 
        errores: errors 
      });
    }

    next();
  }
];

const validatePost = [(req, res, next) => next()];
const validateComment = [(req, res, next) => next()];
const validateVideojuego = [(req, res, next) => next()];
const validateNota = [(req, res, next) => next()];

const validateMongoId = [
  (req, res, next) => {
    const { id } = req.params;
    if (!id || id.length !== 24) {
      return res.status(400).json({ mensaje: 'ID inválido' });
    }
    next();
  }
];

const validatePagination = [
  (req, res, next) => {
    const { page, limit } = req.query;
    
    if (page && (isNaN(page) || page < 1)) {
      return res.status(400).json({ mensaje: 'La página debe ser un número mayor a 0' });
    }
    
    if (limit && (isNaN(limit) || limit < 1 || limit > 50)) {
      return res.status(400).json({ mensaje: 'El límite debe ser un número entre 1 y 50' });
    }
    
    next();
  }
];

module.exports = {
  validateUserRegistration,
  validateUserLogin,
  validatePost,
  validateComment,
  validateVideojuego,
  validateNota,
  validateMongoId,
  validatePagination,
  handleValidationErrors
};
