const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  receptor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  emisor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  tipo: {
    type: String,
    enum: ['follow', 'post', 'like', 'comment'],
    required: true
  },
  mensaje: {
    type: String,
    required: true
  },
  leida: {
    type: Boolean,
    default: false
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Índices para optimizar consultas
notificationSchema.index({ receptor: 1, createdAt: -1 });
notificationSchema.index({ receptor: 1, leida: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
