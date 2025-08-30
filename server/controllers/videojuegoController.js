const Videojuego = require('../models/Videojuego');
const Post = require('../models/Post');

const videojuegoController = {
  // Crear nuevo videojuego
  crearVideojuego: async (req, res) => {
    try {
      const {
        nombre, descripcion, generos, fechaLanzamiento,
        desarrollador, distribuidor, creador, plataformas,
        imagen, trailer, sitioWeb, precio, clasificacionEdad
      } = req.body;
      
      const videojuegoExistente = await Videojuego.findOne({ nombre });
      if (videojuegoExistente) {
        return res.status(400).json({ mensaje: 'Ya existe un videojuego con este nombre' });
      }
      
      const nuevoVideojuego = new Videojuego({
        nombre, descripcion, generos, fechaLanzamiento,
        desarrollador, distribuidor, creador, plataformas,
        imagen, trailer, sitioWeb, precio, clasificacionEdad
      });
      
      await nuevoVideojuego.save();
      res.status(201).json(nuevoVideojuego);
    } catch (error) {
      res.status(500).json({ mensaje: 'Error del servidor', error: error.message });
    }
  },

  // Obtener géneros únicos
  obtenerGeneros: async (req, res) => {
    try {
      console.log('Fetching genres...'); // Debug
      
      // Primero verificar si hay videojuegos
      const totalVideojuegos = await Videojuego.countDocuments();
      console.log('Total videojuegos:', totalVideojuegos);
      
      if (totalVideojuegos === 0) {
        return res.json([]);
      }
      
      // Obtener géneros únicos usando agregación
      const genresAggregation = await Videojuego.aggregate([
        { $unwind: "$generos" },
        { $group: { _id: "$generos" } },
        { $sort: { _id: 1 } }
      ]);
      
      console.log('Genres aggregation result:', genresAggregation);
      
      const uniqueGenres = genresAggregation.map(item => item._id).filter(genre => genre && genre.trim() !== '');
      console.log('Final unique genres:', uniqueGenres);
      
      res.json(uniqueGenres);
    } catch (error) {
      console.error('Error fetching genres:', error);
      res.status(500).json({ mensaje: 'Error del servidor', error: error.message });
    }
  },

  // Obtener desarrolladores únicos
  obtenerDesarrolladores: async (req, res) => {
    try {
      console.log('Fetching developers...'); // Debug
      const developers = await Videojuego.distinct('desarrollador');
      console.log('Raw developers:', developers); // Debug
      const filteredDevelopers = developers.filter(dev => dev && dev.trim() !== '');
      console.log('Filtered developers:', filteredDevelopers); // Debug
      res.json(filteredDevelopers.sort());
    } catch (error) {
      console.error('Error fetching developers:', error);
      res.status(500).json({ mensaje: 'Error del servidor', error: error.message });
    }
  },

  // Obtener videojuegos con filtros
  obtenerVideojuegos: async (req, res) => {
    try {
      const { page = 1, limit = 20, sortBy = 'fechaLanzamiento', order = 'desc', genre, developer, trending = false } = req.query;
      
      console.log('Query params:', { page, limit, sortBy, order, genre, developer, trending });
      
      const query = {};
      if (genre && genre !== '') {
        query.generos = { $in: [new RegExp(genre, 'i')] };
      }
      if (developer && developer !== '') {
        query.desarrollador = { $regex: new RegExp(developer, 'i') };
      }
      
      console.log('MongoDB query:', query);
      
      let videojuegos;
      
      // Si se solicita trending, usar agregación para ordenar por popularidad
      if (trending === 'true') {
        console.log('Fetching trending games with aggregation...');
        try {
          // Primero intentar obtener algunos posts para verificar la conexión
          const Post = require('../models/Post');
          const samplePosts = await Post.find().limit(1);
          console.log('Sample posts found:', samplePosts.length);
          
          videojuegos = await Videojuego.aggregate([
            { $match: query },
            {
              $lookup: {
                from: 'posts', // Nombre de la colección en minúscula
                localField: '_id',
                foreignField: 'videojuego',
                as: 'postCount'
              }
            },
            {
              $addFields: {
                // Calcular score de popularidad simple
                popularityScore: { $size: '$postCount' }
              }
            },
            { $sort: { popularityScore: -1, fechaLanzamiento: -1 } },
            { $skip: (page - 1) * limit },
            { $limit: parseInt(limit) },
            { $project: { postCount: 0 } } // Remover posts del resultado final
          ]);
          console.log('Trending games found:', videojuegos.length);
          
          // Si no hay resultados con la agregación, intentar query simple
          if (videojuegos.length === 0) {
            console.log('No trending results, falling back to normal query');
            videojuegos = await Videojuego.find(query)
              .sort({ fechaLanzamiento: -1 })
              .limit(parseInt(limit))
              .skip((page - 1) * limit);
          }
        } catch (aggregationError) {
          console.error('Aggregation failed, falling back to normal query:', aggregationError);
          // Si la agregación falla, usar query normal
          videojuegos = await Videojuego.find(query)
            .sort({ fechaLanzamiento: -1 })
            .limit(parseInt(limit))
            .skip((page - 1) * limit);
        }
      } else {
        videojuegos = await Videojuego.find(query)
          .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
          .limit(limit * 1)
          .skip((page - 1) * limit);
      }
      
      console.log('Found videojuegos:', videojuegos.length);
      
      if (videojuegos.length === 0) {
        // Si no hay videojuegos, devolver respuesta vacía pero válida
        return res.json({
          videojuegos: [],
          totalPages: 0,
          currentPage: page,
          total: 0
        });
      }
      
      // Calcular valoraciones reales basadas en posts
      const videojuegosConValoraciones = await Promise.all(
        videojuegos.map(async (videojuego) => {
          try {
            const valoracionesReales = await Post.aggregate([
              {
                $match: {
                  videojuego: videojuego._id,
                  valoracionJuego: { $exists: true, $ne: null }
                }
              },
              {
                $group: {
                  _id: '$valoracionJuego',
                  count: { $sum: 1 }
                }
              }
            ]);
            
            const valoraciones = {
              loRecomiendo: 0,
              noLoRecomiendo: 0,
              meh: 0
            };
            
            valoracionesReales.forEach(valoracion => {
              if (valoracion._id === 'lo_recomiendo') {
                valoraciones.loRecomiendo = valoracion.count;
              } else if (valoracion._id === 'no_lo_recomiendo') {
                valoraciones.noLoRecomiendo = valoracion.count;
              } else if (valoracion._id === 'meh') {
                valoraciones.meh = valoracion.count;
              }
            });
            
            // Verificar si es un documento de Mongoose o un objeto plano de agregación
            const videojuegoObj = videojuego.toObject ? videojuego.toObject() : videojuego;
            
            return {
              ...videojuegoObj,
              valoraciones
            };
          } catch (aggregationError) {
            console.error('Error en agregación para videojuego:', videojuego._id, aggregationError);
            // Si falla la agregación, devolver el videojuego con valoraciones vacías
            const videojuegoObj = videojuego.toObject ? videojuego.toObject() : videojuego;
            return {
              ...videojuegoObj,
              valoraciones: { loRecomiendo: 0, noRecomiendo: 0, meh: 0 }
            };
          }
        })
      );
      
      const total = await Videojuego.countDocuments(query);
      
      console.log('Returning videojuegos:', videojuegosConValoraciones.length);
      
      res.json({
        videojuegos: videojuegosConValoraciones,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      });
    } catch (error) {
      console.error('Error in obtenerVideojuegos:', error);
      res.status(500).json({ mensaje: 'Error del servidor', error: error.message });
    }
  },

  // Obtener videojuego por ID
  obtenerVideojuegoPorId: async (req, res) => {
    try {
      const videojuego = await Videojuego.findById(req.params.id);
      
      if (!videojuego) {
        return res.status(404).json({ mensaje: 'Videojuego no encontrado' });
      }

      // Calcular valoraciones reales basadas en posts
      const valoracionesReales = await Post.aggregate([
        {
          $match: {
            videojuego: videojuego._id,
            valoracionJuego: { $exists: true, $ne: null }
          }
        },
        {
          $group: {
            _id: '$valoracionJuego',
            count: { $sum: 1 }
          }
        }
      ]);
      
      const valoraciones = {
        loRecomiendo: 0,
        noLoRecomiendo: 0,
        meh: 0
      };
      
      valoracionesReales.forEach(valoracion => {
        if (valoracion._id === 'lo_recomiendo') {
          valoraciones.loRecomiendo = valoracion.count;
        } else if (valoracion._id === 'no_lo_recomiendo') {
          valoraciones.noLoRecomiendo = valoracion.count;
        } else if (valoracion._id === 'meh') {
          valoraciones.meh = valoracion.count;
        }
      });
      
      res.json({
        ...videojuego.toObject(),
        valoraciones
      });
    } catch (error) {
      res.status(500).json({ mensaje: 'Error del servidor', error: error.message });
    }
  },

  // Buscar videojuegos
  buscarVideojuegos: async (req, res) => {
    try {
      const { q } = req.query;
      if (!q) {
        return res.status(400).json({ mensaje: 'Parámetro de búsqueda requerido' });
      }
      
      const videojuegos = await Videojuego.find({
        $or: [
          { nombre: { $regex: q, $options: 'i' } },
          { desarrollador: { $regex: q, $options: 'i' } },
          { generos: { $regex: q, $options: 'i' } }
        ]
      })
      .sort({ fechaLanzamiento: -1 })
      .limit(10);
      
      res.json(videojuegos);
    } catch (error) {
      res.status(500).json({ mensaje: 'Error del servidor', error: error.message });
    }
  },

  // Obtener videojuegos por género
  obtenerPorGenero: async (req, res) => {
    try {
      const { genero } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 12;
      const skip = (page - 1) * limit;
      
      const videojuegos = await Videojuego.find({ generos: genero })
        .sort({ fechaLanzamiento: -1 })
        .skip(skip)
        .limit(limit);
      
      res.json(videojuegos);
    } catch (error) {
      res.status(500).json({ mensaje: 'Error del servidor', error: error.message });
    }
  },

  // Obtener estadísticas de un videojuego
  obtenerEstadisticas: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Obtener valoraciones de posts
      const posts = await Post.find({
        videojuego: id,
        valoracionJuego: { $exists: true, $ne: null }
      });

      const valoraciones = {
        loRecomiendo: 0,
        noLoRecomiendo: 0,
        meh: 0
      };

      posts.forEach(post => {
        if (post.valoracionJuego === 'lo_recomiendo') {
          valoraciones.loRecomiendo++;
        } else if (post.valoracionJuego === 'no_lo_recomiendo') {
          valoraciones.noLoRecomiendo++;
        } else if (post.valoracionJuego === 'meh') {
          valoraciones.meh++;
        }
      });

      res.json({ valoraciones });
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      res.status(500).json({ mensaje: 'Error del servidor' });
    }
  },

  // Actualizar videojuego
  actualizarVideojuego: async (req, res) => {
    try {
      const videojuego = await Videojuego.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      
      if (!videojuego) {
        return res.status(404).json({ mensaje: 'Videojuego no encontrado' });
      }
      
      res.json(videojuego);
    } catch (error) {
      res.status(500).json({ mensaje: 'Error del servidor', error: error.message });
    }
  },

  // Nueva ruta para obtener solo géneros
  obtenerSoloGeneros: async (req, res) => {
    try {
      console.log('Fetching genres for filters...'); // Debug
      
      const totalVideojuegos = await Videojuego.countDocuments();
      console.log('Total videojuegos:', totalVideojuegos);
      
      if (totalVideojuegos === 0) {
        return res.json([]);
      }
      
      const genresAggregation = await Videojuego.aggregate([
        { $unwind: "$generos" },
        { $group: { _id: "$generos" } },
        { $sort: { _id: 1 } }
      ]);
      
      const uniqueGenres = genresAggregation.map(item => item._id).filter(genre => genre && genre.trim() !== '');
      console.log('Unique genres for filters:', uniqueGenres);
      
      res.json(uniqueGenres);
    } catch (error) {
      console.error('Error fetching genres for filters:', error);
      res.status(500).json({ mensaje: 'Error del servidor', error: error.message });
    }
  },

  // Nueva ruta para obtener solo desarrolladores
  obtenerSoloDesarrolladores: async (req, res) => {
    try {
      console.log('Fetching developers for filters...'); // Debug
      const developers = await Videojuego.distinct('desarrollador');
      const filteredDevelopers = developers.filter(dev => dev && dev.trim() !== '');
      console.log('Filtered developers for filters:', filteredDevelopers);
      res.json(filteredDevelopers.sort());
    } catch (error) {
      console.error('Error fetching developers for filters:', error);
      res.status(500).json({ mensaje: 'Error del servidor', error: error.message });
    }
  }
};

module.exports = videojuegoController;
