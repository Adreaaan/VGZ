const { MisNotas, Videojuego } = require('../models');

const misNotasController = {
  // Crear nueva nota
  crearNota: async (req, res) => {
    try {
      const { videojuego, tipoNota, titulo, esPublica } = req.body;
      
      const videojuegoDoc = await Videojuego.findById(videojuego);
      if (!videojuegoDoc) {
        return res.status(404).json({ mensaje: 'Videojuego no encontrado' });
      }
      
      // Validar si es build RPG y el juego no es RPG
      if (tipoNota === 'build_rpg' && !videojuegoDoc.esRPG) {
        return res.status(400).json({ 
          mensaje: 'Las notas de build RPG solo están disponibles para juegos de género RPG' 
        });
      }
      
      const nuevaNota = new MisNotas({
        usuario: req.userId,
        videojuego,
        tipoNota,
        titulo,
        esPublica
      });
      
      await nuevaNota.save();
      
      const notaPopulada = await MisNotas.findById(nuevaNota._id)
        .populate('videojuego', 'nombre imagen generos');
      
      res.status(201).json(notaPopulada);
    } catch (error) {
      res.status(500).json({ mensaje: 'Error del servidor', error: error.message });
    }
  },

  // Obtener notas del usuario
  obtenerNotasUsuario: async (req, res) => {
    try {
      const { videojuegoId, tipoNota } = req.query;
      let filtro = { usuario: req.userId };
      
      if (videojuegoId) filtro.videojuego = videojuegoId;
      if (tipoNota) filtro.tipoNota = tipoNota;
      
      const notas = await MisNotas.find(filtro)
        .populate('videojuego', 'nombre imagen generos')
        .sort({ updatedAt: -1 });
      
      res.json(notas);
    } catch (error) {
      res.status(500).json({ mensaje: 'Error del servidor', error: error.message });
    }
  },

  // Actualizar nota
  actualizarNota: async (req, res) => {
    try {
      const nota = await MisNotas.findOne({
        _id: req.params.id,
        usuario: req.userId
      });
      
      if (!nota) {
        return res.status(404).json({ mensaje: 'Nota no encontrada' });
      }
      
      // Actualizar según el tipo de nota
      if (req.body.contenidoTexto !== undefined) {
        nota.contenidoTexto = req.body.contenidoTexto;
      }
      
      if (req.body.tareas) {
        nota.tareas = req.body.tareas;
      }
      
      if (req.body.buildRPG) {
        nota.buildRPG = { ...nota.buildRPG, ...req.body.buildRPG };
      }
      
      if (req.body.titulo) nota.titulo = req.body.titulo;
      if (req.body.esPublica !== undefined) nota.esPublica = req.body.esPublica;
      if (req.body.tags) nota.tags = req.body.tags;
      if (req.body.favorita !== undefined) nota.favorita = req.body.favorita;
      
      await nota.save();
      
      const notaPopulada = await MisNotas.findById(nota._id)
        .populate('videojuego', 'nombre imagen generos');
      
      res.json(notaPopulada);
    } catch (error) {
      res.status(500).json({ mensaje: 'Error del servidor', error: error.message });
    }
  },

  // Actualizar tareas de todo-list
  actualizarTareas: async (req, res) => {
    try {
      const { tareas } = req.body;
      
      const nota = await MisNotas.findOne({
        _id: req.params.id,
        usuario: req.userId,
        tipoNota: 'todo_list'
      });
      
      if (!nota) {
        return res.status(404).json({ mensaje: 'Nota todo-list no encontrada' });
      }
      
      nota.tareas = tareas;
      await nota.save();
      
      res.json(nota);
    } catch (error) {
      res.status(500).json({ mensaje: 'Error del servidor', error: error.message });
    }
  },

  // Marcar tarea como completada
  toggleTarea: async (req, res) => {
    try {
      const { tareaId } = req.params;
      
      const nota = await MisNotas.findOne({
        _id: req.params.id,
        usuario: req.userId,
        tipoNota: 'todo_list'
      });
      
      if (!nota) {
        return res.status(404).json({ mensaje: 'Nota todo-list no encontrada' });
      }
      
      const tarea = nota.tareas.id(tareaId);
      if (!tarea) {
        return res.status(404).json({ mensaje: 'Tarea no encontrada' });
      }
      
      tarea.completada = !tarea.completada;
      tarea.fechaCompletada = tarea.completada ? new Date() : null;
      
      await nota.save();
      res.json(nota);
    } catch (error) {
      res.status(500).json({ mensaje: 'Error del servidor', error: error.message });
    }
  },

  // Obtener notas públicas
  obtenerNotasPublicas: async (req, res) => {
    try {
      const { videojuegoId, tipoNota } = req.query;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;
      
      let filtro = { esPublica: true };
      if (videojuegoId) filtro.videojuego = videojuegoId;
      if (tipoNota) filtro.tipoNota = tipoNota;
      
      const notas = await MisNotas.find(filtro)
        .populate('usuario', 'username avatar')
        .populate('videojuego', 'nombre imagen generos')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit);
      
      res.json(notas);
    } catch (error) {
      res.status(500).json({ mensaje: 'Error del servidor', error: error.message });
    }
  },

  // Eliminar nota
  eliminarNota: async (req, res) => {
    try {
      const nota = await MisNotas.findOneAndDelete({
        _id: req.params.id,
        usuario: req.userId
      });
      
      if (!nota) {
        return res.status(404).json({ mensaje: 'Nota no encontrada' });
      }
      
      res.json({ mensaje: 'Nota eliminada exitosamente' });
    } catch (error) {
      res.status(500).json({ mensaje: 'Error del servidor', error: error.message });
    }
  }
};

module.exports = misNotasController;
