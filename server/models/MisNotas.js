const mongoose = require('mongoose');

const misNotasSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  videojuego: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Videojuego',
    required: true
  },
  tipoNota: {
    type: String,
    enum: ['bloc_notas', 'todo_list', 'build_rpg'],
    required: true
  },
  titulo: {
    type: String,
    required: true,
    maxlength: 100
  },
  esPublica: {
    type: Boolean,
    default: false
  },
  
  // Para bloc de notas normal
  contenidoTexto: {
    type: String,
    default: ''
  },
  
  // Para ToDo List con drag and drop
  tareas: [{
    texto: {
      type: String,
      required: true
    },
    completada: {
      type: Boolean,
      default: false
    },
    orden: {
      type: Number,
      required: true
    },
    prioridad: {
      type: String,
      enum: ['baja', 'media', 'alta'],
      default: 'media'
    },
    fechaCreacion: {
      type: Date,
      default: Date.now
    },
    fechaCompletada: {
      type: Date,
      default: null
    },
    categoria: {
      type: String,
      default: ''
    }
  }],
  
  // Para Build RPG (solo disponible si el juego es RPG)
  buildRPG: {
    clase: {
      type: String,
      default: ''
    },
    estiloJuego: {
      type: String,
      enum: ['Agresivo', 'Defensivo', 'Equilibrado', 'Stealth', 'Support', ''],
      default: ''
    },
    comportamiento: {
      type: String,
      enum: ['PvP', 'PvE', 'Solo', 'Cooperativo', 'Mixto', ''],
      default: ''
    },
    nivel: {
      type: Number,
      default: 1,
      min: 1
    },
    estadisticas: {
      fuerza: { type: Number, default: 0 },
      destreza: { type: Number, default: 0 },
      inteligencia: { type: Number, default: 0 },
      constitucion: { type: Number, default: 0 },
      carisma: { type: Number, default: 0 },
      sabiduria: { type: Number, default: 0 }
    },
    equipamiento: [{
      tipo: {
        type: String,
        enum: ['Arma', 'Armadura', 'Accesorio', 'Consumible']
      },
      nombre: String,
      descripcion: String,
      estadisticas: Object,
      equipado: {
        type: Boolean,
        default: false
      }
    }],
    habilidades: [{
      nombre: String,
      descripcion: String,
      nivel: { type: Number, default: 1 },
      puntosSinAsignar: { type: Number, default: 0 }
    }],
    estrategia: {
      type: String,
      default: ''
    },
    objetivos: [{
      descripcion: String,
      completado: {
        type: Boolean,
        default: false
      }
    }]
  },
  
  // Metadatos comunes
  tags: [{
    type: String
  }],
  favorita: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Validación para builds RPG solo en juegos RPG
misNotasSchema.pre('save', async function(next) {
  if (this.tipoNota === 'build_rpg') {
    const videojuego = await mongoose.model('Videojuego').findById(this.videojuego);
    if (!videojuego || !videojuego.esRPG) {
      const error = new Error('Las notas de build RPG solo están disponibles para juegos de género RPG');
      return next(error);
    }
  }
  next();
});

misNotasSchema.index({ usuario: 1, videojuego: 1 });
misNotasSchema.index({ videojuego: 1, esPublica: 1 });
misNotasSchema.index({ usuario: 1, tipoNota: 1 });
misNotasSchema.index({ usuario: 1, favorita: 1 });

module.exports = mongoose.model('MisNotas', misNotasSchema);
