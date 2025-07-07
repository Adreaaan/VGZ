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
      
      // Obtener una muestra para ver la estructura
      const sampleVideojuego = await Videojuego.findOne();
      console.log('Sample videojuego structure:', JSON.stringify(sampleVideojuego, null, 2));
      
      // Intentar usar agregación para extraer géneros
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
      const { page = 1, limit = 20, sortBy = 'fechaLanzamiento', order = 'desc', genre, developer } = req.query;
      
      console.log('Query params:', { page, limit, sortBy, order, genre, developer });
      
      const query = {};
      if (genre && genre !== '') {
        query.generos = { $in: [new RegExp(genre, 'i')] };
      }
      if (developer && developer !== '') {
        query.desarrollador = { $regex: new RegExp(developer, 'i') };
      }
      
      console.log('MongoDB query:', query);
      
      const videojuegos = await Videojuego.find(query)
        .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);
      
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
            
            return {
              ...videojuego.toObject(),
              valoraciones
            };
          } catch (aggregationError) {
            console.error('Error en agregación para videojuego:', videojuego._id, aggregationError);
            // Si falla la agregación, devolver el videojuego con valoraciones vacías
            return {
              ...videojuego.toObject(),
              valoraciones: { loRecomiendo: 0, noLoRecomiendo: 0, meh: 0 }
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

  // Obtener estadísticas de valoraciones
  obtenerEstadisticas: async (req, res) => {
    try {
      const videojuego = await Videojuego.findById(req.params.id);
      if (!videojuego) {
        return res.status(404).json({ mensaje: 'Videojuego no encontrado' });
      }
      
      const estadisticas = {
        valoraciones: videojuego.valoraciones,
        porcentajes: videojuego.porcentajesValoracion,
        totalValoraciones: videojuego.valoraciones.loRecomiendo + 
                          videojuego.valoraciones.noLoRecomiendo + 
                          videojuego.valoraciones.meh
      };
      
      res.json(estadisticas);
    } catch (error) {
      res.status(500).json({ mensaje: 'Error del servidor', error: error.message });
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
  }
};

module.exports = videojuegoController;
