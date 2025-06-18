const mongoose = require('mongoose');

const videojuegoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  descripcion: {
    type: String,
    required: true
  },
  generos: [{
    type: String,
    enum: ['RPG', 'FPS', 'Estrategia', 'Aventura', 'Deportes', 'Simulacion', 
           'Puzzle', 'Plataformas', 'Racing', 'Fighting', 'Horror', 'Indie', 'MMO']
  }],
  fechaLanzamiento: {
    type: Date,
    required: true
  },
  desarrollador: {
    type: String,
    required: true
  },
  distribuidor: {
    type: String,
    required: true
  },
  creador: {
    type: String,
    required: true
  },
  plataformas: [{
    type: String,
    enum: ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch', 'Mobile', 'VR']
  }],
  imagen: {
    type: String,
    default: null
  },
  trailer: {
    type: String,
    default: null
  },
  sitioWeb: {
    type: String,
    default: null
  },
  valoraciones: {
    loRecomiendo: {
      type: Number,
      default: 0,
      min: 0
    },
    noLoRecomiendo: {
      type: Number,
      default: 0,
      min: 0
    },
    meh: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  esRPG: {
    type: Boolean,
    default: function() {
      return this.generos.includes('RPG');
    }
  },
  precio: {
    type: Number,
    default: 0
  },
  clasificacionEdad: {
    type: String,
    enum: ['E', 'E10+', 'T', 'M', 'AO', 'RP'],
    default: 'RP'
  }
}, {
  timestamps: true
});

videojuegoSchema.virtual('porcentajesValoracion').get(function() {
  const total = this.valoraciones.loRecomiendo + this.valoraciones.noLoRecomiendo + this.valoraciones.meh;
  if (total === 0) return { loRecomiendo: 0, noLoRecomiendo: 0, meh: 0 };
  
  return {
    loRecomiendo: Math.round((this.valoraciones.loRecomiendo / total) * 100),
    noLoRecomiendo: Math.round((this.valoraciones.noLoRecomiendo / total) * 100),
    meh: Math.round((this.valoraciones.meh / total) * 100)
  };
});

videojuegoSchema.index({ nombre: 1 });
videojuegoSchema.index({ generos: 1 });
videojuegoSchema.index({ fechaLanzamiento: -1 });

module.exports = mongoose.model('Videojuego', videojuegoSchema);
