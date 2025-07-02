const { Post, Usuario, Videojuego } = require('../models');

const postController = {
  // Crear nuevo post
  crearPost: async (req, res) => {
    try {
      const { contenido, videojuego, esPublico, imagenes, valoracionJuego } = req.body;
      
      const videojuegoExiste = await Videojuego.findById(videojuego);
      if (!videojuegoExiste) {
        return res.status(404).json({ mensaje: 'Videojuego no encontrado' });
      }
      
      const nuevoPost = new Post({
        autor: req.userId,
        contenido,
        videojuego,
        esPublico,
        imagenes: imagenes || [],
        valoracionJuego
      });
      
      await nuevoPost.save();
      
      // Actualizar valoraciones del videojuego si hay valoración
      if (valoracionJuego) {
        if (valoracionJuego === 'lo_recomiendo') {
          videojuegoExiste.valoraciones.loRecomiendo += 1;
        } else if (valoracionJuego === 'no_lo_recomiendo') {
          videojuegoExiste.valoraciones.noLoRecomiendo += 1;
        } else if (valoracionJuego === 'meh') {
          videojuegoExiste.valoraciones.meh += 1;
        }
        await videojuegoExiste.save();
      }
      
      const postPopulado = await Post.findById(nuevoPost._id)
        .populate('autor', 'username avatar')
        .populate('videojuego', 'nombre imagen');
      
      res.status(201).json(postPopulado);
    } catch (error) {
      res.status(500).json({ mensaje: 'Error del servidor', error: error.message });
    }
  },

  // Crear comentario
  crearComentario: async (req, res) => {
    try {
      const { contenido, postPadre } = req.body;
      
      const postPadreDoc = await Post.findById(postPadre);
      if (!postPadreDoc) {
        return res.status(404).json({ mensaje: 'Post padre no encontrado' });
      }
      
      const comentario = new Post({
        autor: req.userId,
        contenido,
        videojuego: postPadreDoc.videojuego, // Hereda el videojuego
        esComentario: true,
        postPadre,
        esPublico: postPadreDoc.esPublico
      });
      
      await comentario.save();
      
      // Agregar comentario al post padre
      postPadreDoc.comentarios.push(comentario._id);
      await postPadreDoc.save();
      
      const comentarioPopulado = await Post.findById(comentario._id)
        .populate('autor', 'username avatar')
        .populate('videojuego', 'nombre imagen');
      
      res.status(201).json(comentarioPopulado);
    } catch (error) {
      res.status(500).json({ mensaje: 'Error del servidor', error: error.message });
    }
  },
  // Obtener posts del feed
  obtenerFeed: async (req, res) => {
    try {
      console.log('obtenerFeed - userId:', req.userId); // Debug
      
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;
      
      const usuario = await Usuario.findById(req.userId);
      console.log('Usuario encontrado:', usuario ? usuario.username : 'No encontrado'); // Debug
      
      if (!usuario) {
        return res.status(404).json({ mensaje: 'Usuario no encontrado' });
      }
      
      const usuariosSeguidos = [...usuario.siguiendo];
      usuariosSeguidos.push(req.userId); // Incluir posts propios
      
      console.log('Usuarios seguidos:', usuariosSeguidos.length); // Debug
      
      const posts = await Post.find({
        autor: { $in: usuariosSeguidos },
        esPublico: true,
        esComentario: false
      })
      .populate('autor', 'username avatar')
      .populate('videojuego', 'nombre imagen')
      .populate({
        path: 'comentarios',
        populate: {
          path: 'autor',
          select: 'username avatar'
        }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
      
      console.log('Posts encontrados:', posts.length); // Debug
      res.json(posts);
    } catch (error) {
      console.error('Error en obtenerFeed:', error); // Debug
      res.status(500).json({ mensaje: 'Error del servidor', error: error.message });
    }
  },

  // Obtener posts para explorar (todos los posts públicos)
  obtenerExplorar: async (req, res) => {
    try {
      console.log('obtenerExplorar llamado'); // Debug
      
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;
      
      const posts = await Post.find({
        esPublico: true,
        esComentario: false
      })
      .populate('autor', 'username avatar')
      .populate('videojuego', 'nombre imagen')
      .populate({
        path: 'comentarios',
        populate: {
          path: 'autor',
          select: 'username avatar'
        }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
      
      console.log('Posts explorar encontrados:', posts.length); // Debug
      res.json(posts);
    } catch (error) {
      console.error('Error en obtenerExplorar:', error); // Debug
      res.status(500).json({ mensaje: 'Error del servidor', error: error.message });
    }
  },

  // Dar/quitar like
  toggleLike: async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
      if (!post) {
        return res.status(404).json({ mensaje: 'Post no encontrado' });
      }
      
      const likeIndex = post.likes.findIndex(
        like => like.usuario.toString() === req.userId
      );
      
      if (likeIndex > -1) {
        // Quitar like
        post.likes.splice(likeIndex, 1);
      } else {
        // Agregar like
        post.likes.push({ usuario: req.userId });
      }
      
      await post.save();
      res.json({ likes: post.likes.length });
    } catch (error) {
      res.status(500).json({ mensaje: 'Error del servidor', error: error.message });
    }
  },

  // Obtener posts por videojuego
  obtenerPostsPorVideojuego: async (req, res) => {
    try {
      const { videojuegoId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;
      
      const posts = await Post.find({
        videojuego: videojuegoId,
        esPublico: true,
        esComentario: false
      })
      .populate('autor', 'username avatar')
      .populate('videojuego', 'nombre imagen')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
      
      res.json(posts);
    } catch (error) {
      res.status(500).json({ mensaje: 'Error del servidor', error: error.message });
    }
  },

  // Eliminar post
  eliminarPost: async (req, res) => {
    try {
      console.log('Eliminando post ID:', req.params.id); // Debug
      console.log('Usuario ID:', req.userId); // Debug
      
      const post = await Post.findById(req.params.id);
      if (!post) {
        return res.status(404).json({ mensaje: 'Post no encontrado' });
      }
      
      console.log('Post autor:', post.autor.toString()); // Debug
      console.log('Usuario actual:', req.userId); // Debug
      
      if (post.autor.toString() !== req.userId) {
        return res.status(403).json({ mensaje: 'No tienes permisos para eliminar este post' });
      }
      
      await Post.findByIdAndDelete(req.params.id);
      console.log('Post eliminado exitosamente'); // Debug
      res.json({ mensaje: 'Post eliminado exitosamente' });
    } catch (error) {
      console.error('Error eliminando post:', error); // Debug
      res.status(500).json({ mensaje: 'Error del servidor', error: error.message });
    }
  }
};

module.exports = postController;
