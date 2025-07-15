const { MisNotas, Videojuego } = require('../models');

const misNotasController = {
  // Crear nota
  crearNota: async (req, res) => {
    try {
      console.log('Datos recibidos:', JSON.stringify(req.body, null, 2));
      console.log('Usuario ID:', req.userId);
      
      const { titulo, tipo, videojuego, contenido, esPrivada } = req.body;
      
      if (!titulo || !tipo || !videojuego) {
        console.log('Faltan campos requeridos:', { titulo, tipo, videojuego });
        return res.status(400).json({ mensaje: 'Título, tipo y videojuego son requeridos' });
      }

      // Mapear los tipos del frontend a los valores correctos del enum
      const tipoMap = {
        'text': 'bloc_notas',
        'todo': 'todo_list', 
        'build': 'build_rpg'
      };

      const tipoNota = tipoMap[tipo];
      console.log('Tipo mapeado:', tipo, '->', tipoNota);
      
      if (!tipoNota) {
        console.log('Tipo no válido:', tipo);
        return res.status(400).json({ mensaje: 'Tipo de nota no válido' });
      }

      const datosNota = {
        titulo,
        tipoNota: tipoNota,
        videojuego,
        esPublica: !esPrivada, // Convert esPrivada to esPublica
        usuario: req.userId
      };

      console.log('Procesando contenido para tipo:', tipoNota);
      console.log('Contenido recibido:', JSON.stringify(contenido, null, 2));

      // Mapear el contenido según el tipo de nota
      if (tipoNota === 'bloc_notas' && contenido?.texto) {
        datosNota.contenidoTexto = contenido.texto;
        console.log('Contenido texto asignado:', datosNota.contenidoTexto);
      } else if (tipoNota === 'todo_list' && contenido?.todos) {
        console.log('Procesando todos:', contenido.todos);
        const tareas = [];
        let orden = 0;
        
        try {
          Object.entries(contenido.todos).forEach(([estado, todosArray]) => {
            console.log(`Procesando estado ${estado}:`, todosArray);
            
            if (Array.isArray(todosArray)) {
              todosArray.forEach((todo, index) => {
                console.log(`Procesando todo ${index}:`, todo);
                if (todo && todo.text) {
                  tareas.push({
                    texto: todo.text,
                    categoria: estado, // Usar categoria para guardar el estado
                    completada: estado === 'done',
                    orden: orden++,
                    fechaCreacion: new Date()
                  });
                }
              });
            }
          });
          
          datosNota.tareas = tareas;
          console.log('Tareas procesadas:', tareas);
        } catch (todoError) {
          console.error('Error procesando todos:', todoError);
          throw todoError;
        }
      } else if (tipoNota === 'build_rpg' && contenido) {
        console.log('Procesando build RPG:', contenido);
        
        const buildData = {
          nombre: contenido.characterName || '',
          clase: contenido.characterClass || '',
          nivel: parseInt(contenido.level) || 1,
          estadisticas: {
            fuerza: parseInt(contenido.stats?.fuerza) || 0,
            destreza: parseInt(contenido.stats?.destreza) || 0,
            inteligencia: parseInt(contenido.stats?.inteligencia) || 0,
            sabiduria: parseInt(contenido.stats?.sabiduria) || 0,
            constitucion: parseInt(contenido.stats?.constitucion) || 0,
            carisma: parseInt(contenido.stats?.carisma) || 0
          },
          equipamiento: [],
          estrategia: contenido.notes || '',
          habilidades: [],
          objetivos: [],
          arma: contenido.equipment?.weapon || '',
          armadura: contenido.equipment?.armor || '',
          escudo: contenido.equipment?.shield || '',
          accesorios: contenido.equipment?.accessories || ''
        };
        
        console.log('Equipment recibido:', contenido.equipment); // Debug adicional
        console.log('Shield value:', contenido.equipment?.shield); // Debug específico
        console.log('Accessories value:', contenido.equipment?.accessories); // Debug específico
        
        datosNota.buildRPG = buildData;
        console.log('Build RPG procesado:', datosNota.buildRPG);
      }
      
      console.log('Datos finales para crear nota:', JSON.stringify(datosNota, null, 2));

      const nuevaNota = new MisNotas(datosNota);
      await nuevaNota.save();
      
      console.log('Nota creada exitosamente:', nuevaNota._id);
      
      await nuevaNota.populate('videojuego', 'nombre imagen desarrollador');

      res.status(201).json(nuevaNota);
    } catch (error) {
      console.error('Error completo creando nota:', error);
      console.error('Stack trace:', error.stack);
      res.status(500).json({ mensaje: 'Error del servidor', error: error.message });
    }
  },

  // Obtener notas del usuario
  obtenerNotas: async (req, res) => {
    try {
      const notas = await MisNotas.find({ usuario: req.userId })
        .populate('videojuego', 'nombre imagen desarrollador')
        .sort({ createdAt: -1 });

      res.json(notas);
    } catch (error) {
      console.error('Error obteniendo notas:', error);
      res.status(500).json({ mensaje: 'Error del servidor', error: error.message });
    }
  },

  // Obtener nota por ID
  obtenerNotaPorId: async (req, res) => {
    try {
      const nota = await MisNotas.findOne({
        _id: req.params.id,
        usuario: req.userId
      }).populate('videojuego', 'nombre imagen desarrollador');

      if (!nota) {
        return res.status(404).json({ mensaje: 'Nota no encontrada' });
      }

      res.json(nota);
    } catch (error) {
      console.error('Error obteniendo nota:', error);
      res.status(500).json({ mensaje: 'Error del servidor', error: error.message });
    }
  },

  // Actualizar nota
  actualizarNota: async (req, res) => {
    try {
      const { titulo, contenido, esPrivada } = req.body;

      const nota = await MisNotas.findOne({
        _id: req.params.id, 
        usuario: req.userId
      });

      if (!nota) {
        return res.status(404).json({ mensaje: 'Nota no encontrada' });
      }

      // Actualizar campos básicos
      if (titulo) nota.titulo = titulo;
      if (esPrivada !== undefined) nota.esPublica = !esPrivada; // Convert esPrivada to esPublica

      // Actualizar contenido según el tipo
      if (nota.tipoNota === 'bloc_notas' && contenido?.texto) {
        nota.contenidoTexto = contenido.texto;
      } else if (nota.tipoNota === 'todo_list' && contenido?.todos) {
        const tareas = [];
        let orden = 0;
        Object.entries(contenido.todos).forEach(([estado, todosArray]) => {
          if (Array.isArray(todosArray)) {
            todosArray.forEach(todo => {
              if (todo && todo.text) {
                tareas.push({
                  texto: todo.text,
                  categoria: estado, // Usar categoria para guardar el estado
                  completada: estado === 'done',
                  orden: orden++,
                  fechaCreacion: new Date()
                });
              }
            });
          }
        });
        nota.tareas = tareas;
      } else if (nota.tipoNota === 'build_rpg' && contenido) {
        console.log('Actualizando build RPG:', contenido);
        
        const buildData = {
          nombre: contenido.characterName || '', // Volver a usar nombre
          clase: contenido.characterClass || '',
          nivel: parseInt(contenido.level) || 1,
          estadisticas: {
            fuerza: parseInt(contenido.stats?.fuerza) || 0,
            destreza: parseInt(contenido.stats?.destreza) || 0,
            inteligencia: parseInt(contenido.stats?.inteligencia) || 0,
            sabiduria: parseInt(contenido.stats?.sabiduria) || 0,
            constitucion: parseInt(contenido.stats?.constitucion) || 0,
            carisma: parseInt(contenido.stats?.carisma) || 0
          },
          equipamiento: [],
          estrategia: contenido.notes || '',
          habilidades: nota.buildRPG?.habilidades || [],
          objetivos: nota.buildRPG?.objetivos || [],
          arma: contenido.equipment?.weapon || '',
          armadura: contenido.equipment?.armor || '',
          escudo: contenido.equipment?.shield || '',
          accesorios: contenido.equipment?.accessories || ''
        };
        
        nota.buildRPG = buildData;
        console.log('Build RPG actualizado:', nota.buildRPG);
      }

      nota.updatedAt = new Date();
      await nota.save();
      await nota.populate('videojuego', 'nombre imagen desarrollador');

      res.json(nota);
    } catch (error) {
      console.error('Error actualizando nota:', error);
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
      console.error('Error eliminando nota:', error);
      res.status(500).json({ mensaje: 'Error del servidor', error: error.message });
    }
  },

  // Obtener notas públicas de un usuario
  obtenerNotasPublicas: async (req, res) => {
    try {
      const { usuarioId } = req.params;
      
      const notas = await MisNotas.find({ 
        usuario: usuarioId,
        esPublica: true  // Changed from esPrivada: false to esPublica: true
      })
        .populate('videojuego', 'nombre imagen desarrollador')
        .sort({ createdAt: -1 });

      res.json(notas);
    } catch (error) {
      console.error('Error obteniendo notas públicas:', error);
      res.status(500).json({ mensaje: 'Error del servidor', error: error.message });
    }
  }
};

module.exports = misNotasController;
