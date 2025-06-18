const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  autor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  contenido: {
    type: String,
    required: true,
    maxlength: 500
  },
  videojuego: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Videojuego',
    required: true
  },
  esPublico: {
    type: Boolean,
    default: true
  },
  imagenes: [{
    type: String
  }],
  likes: [{
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario'
    },
    fecha: {
      type: Date,
      default: Date.now
    }
  }],
  // Sistema de comentarios tipo Twitter
  esComentario: {
    type: Boolean,
    default: false
  },
  postPadre: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    default: null
  },
  comentarios: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  }],
  // Valoración del videojuego en este post
  valoracionJuego: {
    type: String,
    enum: ['lo_recomiendo', 'no_lo_recomiendo', 'meh', null],
    default: null
  },
  // Hashtags y menciones
  hashtags: [{
    type: String
  }],
  menciones: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario'
  }]
}, {
  timestamps: true
});

// Middleware para heredar videojuego del post padre en comentarios
postSchema.pre('save', async function(next) {
  if (this.esComentario && this.postPadre && !this.videojuego) {
    const postPadre = await mongoose.model('Post').findById(this.postPadre);
    if (postPadre) {
      this.videojuego = postPadre.videojuego;
    }
  }
  next();
});

postSchema.index({ autor: 1, createdAt: -1 });
postSchema.index({ videojuego: 1, createdAt: -1 });
postSchema.index({ postPadre: 1 });
postSchema.index({ esPublico: 1, createdAt: -1 });

module.exports = mongoose.model('Post', postSchema);
