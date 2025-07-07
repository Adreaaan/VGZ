const { Post, Usuario, Videojuego } = require('../models');

const postController = {
  // Crear post o comentario
  crearPost: async (req, res) => {
    try {
      const { contenido, videojuego, valoracionJuego, esPublico, esComentario, postPadre } = req.body;
      
      console.log('Datos recibidos:', { contenido, videojuego, valoracionJuego, esPublico, esComentario, postPadre });
      
      if (!contenido) {
        return res.status(400).json({ mensaje: 'El contenido es requerido' });
      }

      let nuevoPost;

      if (esComentario && postPadre) {
        // Crear comentario
        nuevoPost = new Post({
          contenido,
          autor: req.userId,
          videojuego: videojuego || null,
          valoracionJuego: valoracionJuego || null,
          esPublico: esPublico !== false,
          esComentario: true
        });

        await nuevoPost.save();

        // Agregar comentario al post padre
        await Post.findByIdAndUpdate(postPadre, {
          $push: { comentarios: nuevoPost._id }
        });

      } else {
        // Crear post normal
        if (!videojuego) {
          return res.status(400).json({ mensaje: 'El videojuego es requerido para posts' });
        }

        nuevoPost = new Post({
          contenido,
          videojuego,
          valoracionJuego: valoracionJuego || null,
          autor: req.userId,
          esPublico: esPublico !== false,
          esComentario: false
        });

        await nuevoPost.save();

        // Ya no necesitamos actualizar las valoraciones en el videojuego
        // porque ahora se calculan dinámicamente desde los posts
      }

      await nuevoPost.populate('autor', 'username avatar');
      if (videojuego) {
        await nuevoPost.populate('videojuego', 'nombre imagen');
      }

      res.status(201).json(nuevoPost);
    } catch (error) {
      console.error('Error completo:', error);
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
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;
      
      const usuario = await Usuario.findById(req.userId);
      if (!usuario) {
        return res.status(404).json({ mensaje: 'Usuario no encontrado' });
      }
      
      const usuariosSeguidos = [...usuario.siguiendo];
      usuariosSeguidos.push(req.userId);
      
      const posts = await Post.find({
        autor: { $in: usuariosSeguidos },
        esPublico: true,
        esComentario: false
      })
      .populate('autor', 'username avatar')
      .populate('videojuego', 'nombre imagen')
      .populate({
        path: 'comentarios',
        populate: [
          {
            path: 'autor',
            select: 'username avatar'
          },
          {
            path: 'videojuego',
            select: 'nombre imagen'
          }
        ]
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
      
      res.json(posts);
    } catch (error) {
      res.status(500).json({ mensaje: 'Error del servidor', error: error.message });
    }
  },

  // Obtener posts para explorar
  obtenerExplorar: async (req, res) => {
    try {
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
        populate: [
          {
            path: 'autor',
            select: 'username avatar'
          },
          {
            path: 'videojuego',
            select: 'nombre imagen'
          }
        ]
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
      
      res.json(posts);
    } catch (error) {
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
  obtenerPostsPorJuego: async (req, res) => {
    try {
      const { gameId } = req.params;
      const { page = 1, limit = 5 } = req.query;
      const skip = (page - 1) * limit;
      
      const posts = await Post.find({
        videojuego: gameId,
        esPublico: true,
        esComentario: false,
        valoracionJuego: { $exists: true, $ne: null }
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
      .limit(parseInt(limit));
      
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
  },

  // Obtener comentarios de un post
  obtenerComentarios: async (req, res) => {
    try {
      const { id } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const comentarios = await Post.find({
        postPadre: id,
        esComentario: true,
        esPublico: true
      })
      .populate('autor', 'username avatar')
      .populate('videojuego', 'nombre imagen')
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit);

      res.json(comentarios);
    } catch (error) {
      res.status(500).json({ mensaje: 'Error del servidor', error: error.message });
    }
  },

  // Obtener post individual
  obtenerPost: async (req, res) => {
    try {
      const post = await Post.findById(req.params.id)
        .populate('autor', 'username avatar')
        .populate('videojuego', 'nombre imagen')
        .populate({
          path: 'comentarios',
          populate: [
            {
              path: 'autor',
              select: 'username avatar'
            },
            {
              path: 'videojuego',
              select: 'nombre imagen'
            }
          ]
        });

      if (!post) {
        return res.status(404).json({ mensaje: 'Post no encontrado' });
      }

      res.json(post);
    } catch (error) {
      res.status(500).json({ mensaje: 'Error del servidor', error: error.message });
    }
  },
};

module.exports = postController;
