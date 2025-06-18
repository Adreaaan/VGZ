const { Post, MisNotas, Usuario } = require('../models');

// Verificar si el usuario es dueño del post
const checkPostOwnership = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ mensaje: 'Post no encontrado' });
    }
    
    if (post.autor.toString() !== req.userId) {
      return res.status(403).json({ mensaje: 'No tienes permisos para realizar esta acción' });
    }
    
    req.post = post;
    next();
  } catch (error) {
    res.status(500).json({ mensaje: 'Error del servidor', error: error.message });
  }
};

// Verificar si el usuario es dueño de la nota
const checkNotaOwnership = async (req, res, next) => {
  try {
    const nota = await MisNotas.findById(req.params.id);
    
    if (!nota) {
      return res.status(404).json({ mensaje: 'Nota no encontrada' });
    }
    
    if (nota.usuario.toString() !== req.userId) {
      return res.status(403).json({ mensaje: 'No tienes permisos para realizar esta acción' });
    }
    
    req.nota = nota;
    next();
  } catch (error) {
    res.status(500).json({ mensaje: 'Error del servidor', error: error.message });
  }
};

// Verificar acceso a perfil (público vs privado)
const checkProfileAccess = async (req, res, next) => {
  try {
    const usuario = await Usuario.findById(req.params.id);
    
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }
    
    // Si es el propio usuario, siempre tiene acceso
    if (req.userId && usuario._id.toString() === req.userId) {
      req.perfilUsuario = usuario;
      return next();
    }
    
    // Si el perfil es privado y no lo sigue, denegar acceso
    if (usuario.esPrivado) {
      if (!req.userId) {
        return res.status(403).json({ mensaje: 'Perfil privado. Inicia sesión para ver más.' });
      }
      
      const usuarioActual = await Usuario.findById(req.userId);
      const siguiendo = usuarioActual.siguiendo.includes(usuario._id);
      
      if (!siguiendo) {
        return res.status(403).json({ mensaje: 'Este perfil es privado' });
      }
    }
    
    req.perfilUsuario = usuario;
    next();
  } catch (error) {
    res.status(500).json({ mensaje: 'Error del servidor', error: error.message });
  }
};

// Verificar si puede ver posts privados
const checkPostAccess = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id).populate('autor');
    
    if (!post) {
      return res.status(404).json({ mensaje: 'Post no encontrado' });
    }
    
    // Si el post es público, permitir acceso
    if (post.esPublico) {
      req.post = post;
      return next();
    }
    
    // Si el post es privado, verificar permisos
    if (!req.userId) {
      return res.status(403).json({ mensaje: 'Este post es privado' });
    }
    
    // Si es el autor del post
    if (post.autor._id.toString() === req.userId) {
      req.post = post;
      return next();
    }
    
    // Si sigue al autor del post
    const usuarioActual = await Usuario.findById(req.userId);
    const siguiendo = usuarioActual.siguiendo.includes(post.autor._id);
    
    if (!siguiendo) {
      return res.status(403).json({ mensaje: 'No tienes permisos para ver este post' });
    }
    
    req.post = post;
    next();
  } catch (error) {
    res.status(500).json({ mensaje: 'Error del servidor', error: error.message });
  }
};

module.exports = {
  checkPostOwnership,
  checkNotaOwnership,
  checkProfileAccess,
  checkPostAccess
};
