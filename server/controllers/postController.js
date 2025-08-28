const { Post, Usuario, Videojuego } = require('../models');
const { crearNotificacion } = require('./notificacionController');

const postController = {
  // Crear post o comentario
  crearPost: async (req, res) => {
    try {
      const { contenido, videojuego, valoracionJuego, esPublico, esComentario, postPadre, actualizarValoracion } = req.body;
      
      console.log('Datos recibidos:', { contenido, videojuego, valoracionJuego, esPublico, esComentario, postPadre, actualizarValoracion });
      
      if (!contenido) {
        return res.status(400).json({ mensaje: 'El contenido es requerido' });
      }

      let nuevoPost;

      if (esComentario && postPadre) {
        // Crear comentario - sin verificación de valoración
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

        // Si hay valoración, verificar si ya existe una valoración previa
        if (valoracionJuego) {
          const valoracionExistente = await Post.findOne({
            autor: req.userId,
            videojuego: videojuego,
            valoracionJuego: { $exists: true, $ne: null },
            esComentario: false
          });

          if (valoracionExistente) {
            // Si se confirma actualizar valoración, eliminar la anterior
            if (actualizarValoracion) {
              valoracionExistente.valoracionJuego = null;
              await valoracionExistente.save();
            } else {
              return res.status(409).json({ 
                mensaje: 'Ya has valorado este juego',
                valoracionAnterior: valoracionExistente.valoracionJuego,
                postAnterior: valoracionExistente._id
              });
            }
          }
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

        // Crear notificaciones para seguidores cuando se crea un post
        if (!esComentario) {
          const usuario = await Usuario.findById(req.userId).populate('seguidores');
          
          if (usuario && usuario.seguidores.length > 0) {
            for (const seguidor of usuario.seguidores) {
              await crearNotificacion(
                seguidor._id,
                req.userId,
                'post',
                `${usuario.username} ha publicado algo nuevo`,
                nuevoPost._id
              );
            }
          }
        }
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

  // Actualizar valoración de un post existente
  actualizarValoracion: async (req, res) => {
    try {
      const { postId, nuevaValoracion } = req.body;
      
      const post = await Post.findOne({
        _id: postId,
        autor: req.userId,
        esComentario: false
      });

      if (!post) {
        return res.status(404).json({ mensaje: 'Post no encontrado o no tienes permisos' });
      }

      // Actualizar la valoración
      post.valoracionJuego = nuevaValoracion;
      await post.save();

      await post.populate('autor', 'username avatar');
      await post.populate('videojuego', 'nombre imagen');

      res.json({ 
        mensaje: 'Valoración actualizada exitosamente',
        post: post
      });
    } catch (error) {
      console.error('Error actualizando valoración:', error);
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
      
      let liked = false;
      if (likeIndex > -1) {
        // Quitar like
        post.likes.splice(likeIndex, 1);
      } else {
        // Agregar like
        post.likes.push({ usuario: req.userId });
        liked = true;
      }
      
      await post.save();

      // Si se dio like (no se quitó), crear notificación
      if (liked && post.autor.toString() !== req.userId) {
        const usuario = await Usuario.findById(req.userId);
        const { crearNotificacion } = require('./notificacionController');
        await crearNotificacion(
          post.autor,
          req.userId,
          'like',
          `A ${usuario.username} le gustó tu post`,
          post._id
        );
      }
      
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
      
      // Si es una solicitud para eliminar valoración
      if (req.body.eliminarValoracion) {
        post.valoracionJuego = null;
        await post.save();
        return res.json({ mensaje: 'Valoración eliminada exitosamente' });
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

  // Actualizar post (incluyendo eliminar valoración)
  actualizarPost: async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
      if (!post) {
        return res.status(404).json({ mensaje: 'Post no encontrado' });
      }
      
      if (post.autor.toString() !== req.userId) {
        return res.status(403).json({ mensaje: 'No tienes permisos para actualizar este post' });
      }
      
      // Si es una solicitud para eliminar valoración
      if (req.body.eliminarValoracion) {
        post.valoracionJuego = null;
        await post.save();
        return res.json({ mensaje: 'Valoración eliminada exitosamente' });
      }
      
      // Aquí se pueden agregar otras actualizaciones del post
      
      res.json({ mensaje: 'Post actualizado exitosamente' });
    } catch (error) {
      console.error('Error actualizando post:', error);
      res.status(500).json({ mensaje: 'Error del servidor', error: error.message });
    }
  },

  // Obtener posts de un usuario específico
  obtenerPostsUsuario: async (req, res) => {
    try {
      const { usuarioId } = req.params;
      
      const posts = await Post.find({ 
        autor: usuarioId,
        esComentario: false  // Solo posts principales, no comentarios
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
        .sort({ createdAt: -1 });

      res.json(posts);
    } catch (error) {
      console.error('Error obteniendo posts del usuario:', error);
      res.status(500).json({ mensaje: 'Error del servidor' });
    }
  },

  // Obtener posts que le gustaron a un usuario
  obtenerPostsLikeados: async (req, res) => {
    try {
      const { usuarioId } = req.params;
      
      const posts = await Post.find({ 
        'likes.usuario': usuarioId,
        esComentario: false  // Solo posts principales, no comentarios
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
        .sort({ createdAt: -1 });

      res.json(posts);
    } catch (error) {
      console.error('Error obteniendo posts likeados:', error);
      res.status(500).json({ mensaje: 'Error del servidor' });
    }
  },

  // Obtener comentarios de un usuario específico
  obtenerComentariosUsuario: async (req, res) => {
    try {
      const { usuarioId } = req.params;
      
      const comments = await Post.find({ 
        autor: usuarioId,
        esComentario: true  // Solo comentarios
      })
        .populate('autor', 'username avatar')
        .populate('videojuego', 'nombre imagen')
        .populate({
          path: 'postPadre',
          select: 'contenido autor videojuego',
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
        .sort({ createdAt: -1 });

      res.json(comments);
    } catch (error) {
      console.error('Error obteniendo comentarios del usuario:', error);
      res.status(500).json({ mensaje: 'Error del servidor' });
    }
  }
};

module.exports = postController;
