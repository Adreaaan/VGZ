const { Videojuego } = require('../models');

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

  // Obtener todos los videojuegos
  obtenerVideojuegos: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 12;
      const skip = (page - 1) * limit;
      const { genero, busqueda, sortBy = 'fechaLanzamiento', order = 'desc' } = req.query;
      
      let filtro = {};
      let sortObj = {};
      
      if (genero) {
        filtro.generos = genero;
      }
      
      if (busqueda) {
        filtro.$or = [
          { nombre: { $regex: busqueda, $options: 'i' } },
          { desarrollador: { $regex: busqueda, $options: 'i' } },
          { generos: { $regex: busqueda, $options: 'i' } }
        ];
      }
      
      // Configurar ordenamiento
      sortObj[sortBy] = order === 'desc' ? -1 : 1;
      
      const videojuegos = await Videojuego.find(filtro)
        .sort(sortObj)
        .skip(skip)
        .limit(limit);
      
      const total = await Videojuego.countDocuments(filtro);
      
      res.json({
        videojuegos,
        totalPaginas: Math.ceil(total / limit),
        paginaActual: page,
        total
      });
    } catch (error) {
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
      
      res.json(videojuego);
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
