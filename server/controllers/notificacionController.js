const Notification = require('../models/Notificacion');

const notificationController = {
  // Obtener notificaciones del usuario
  obtenerNotificaciones: async (req, res) => {
    try {
      const { page = 1, limit = 20 } = req.query;
      const skip = (page - 1) * limit;

      const notificaciones = await Notification.find({ receptor: req.userId })
        .populate('emisor', 'username avatar')
        .populate('post', 'contenido videojuego')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      res.json(notificaciones);
    } catch (error) {
      console.error('Error obteniendo notificaciones:', error);
      res.status(500).json({ mensaje: 'Error del servidor' });
    }
  },

  // Obtener contador de notificaciones no leídas
  obtenerContadorNoLeidas: async (req, res) => {
    try {
      const count = await Notification.countDocuments({
        receptor: req.userId,
        leida: false
      });

      res.json({ count });
    } catch (error) {
      console.error('Error obteniendo contador:', error);
      res.status(500).json({ mensaje: 'Error del servidor' });
    }
  },

  // Marcar notificación como leída
  marcarComoLeida: async (req, res) => {
    try {
      const { notificationId } = req.params;

      await Notification.findByIdAndUpdate(
        notificationId,
        { leida: true },
        { new: true }
      );

      res.json({ mensaje: 'Notificación marcada como leída' });
    } catch (error) {
      console.error('Error marcando notificación:', error);
      res.status(500).json({ mensaje: 'Error del servidor' });
    }
  },

  // Marcar todas como leídas
  marcarTodasComoLeidas: async (req, res) => {
    try {
      await Notification.updateMany(
        { receptor: req.userId, leida: false },
        { leida: true }
      );

      res.json({ mensaje: 'Todas las notificaciones marcadas como leídas' });
    } catch (error) {
      console.error('Error marcando todas como leídas:', error);
      res.status(500).json({ mensaje: 'Error del servidor' });
    }
  },

  // Crear notificación (para uso interno)
  crearNotificacion: async (receptor, emisor, tipo, mensaje, post = null) => {
    try {
      // No crear notificación si el receptor es el mismo que el emisor
      if (receptor.toString() === emisor.toString()) {
        return;
      }

      const nuevaNotificacion = new Notification({
        receptor,
        emisor,
        tipo,
        mensaje,
        post
      });

      await nuevaNotificacion.save();
      return nuevaNotificacion;
    } catch (error) {
      console.error('Error creando notificación:', error);
    }
  }
};

module.exports = notificationController;
