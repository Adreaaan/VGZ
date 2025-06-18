const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  avatar: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    maxlength: 200,
    default: ''
  },
  fechaRegistro: {
    type: Date,
    default: Date.now
  },
  siguiendo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario'
  }],
  seguidores: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario'
  }],
  esPrivado: {
    type: Boolean,
    default: false
  },
  activo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

usuarioSchema.index({ username: 1 });
usuarioSchema.index({ email: 1 });

module.exports = mongoose.model('Usuario', usuarioSchema);
