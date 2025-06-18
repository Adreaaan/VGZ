const errorHandler = (err, req, res, next) => {
  console.error('Error Stack:', err.stack);
  
  // Error de validación de Mongoose
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(error => ({
      field: error.path,
      message: error.message
    }));
    
    return res.status(400).json({
      mensaje: 'Error de validación',
      errores: errors
    });
  }
  
  // Error de duplicado (clave única)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      mensaje: `Ya existe un registro con este ${field}`,
      campo: field
    });
  }
  
  // Error de cast (ObjectId inválido)
  if (err.name === 'CastError') {
    return res.status(400).json({
      mensaje: 'ID inválido',
      campo: err.path
    });
  }
  
  // Error de JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      mensaje: 'Token de acceso inválido'
    });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      mensaje: 'Token de acceso expirado'
    });
  }
  
  // Error por defecto
  res.status(err.statusCode || 500).json({
    mensaje: err.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// Middleware para rutas no encontradas
const notFound = (req, res, next) => {
  const error = new Error(`Ruta no encontrada - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

module.exports = { errorHandler, notFound };
