const { Usuario } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const usuarioController = {
  // Registrar nuevo usuario
  registrar: async (req, res) => {
    try {
      const { username, email, password } = req.body;
      
      const usuarioExistente = await Usuario.findOne({
        $or: [{ email }, { username }]
      });
      
      if (usuarioExistente) {
        return res.status(400).json({ mensaje: 'Usuario o email ya existe' });
      }
      
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const nuevoUsuario = new Usuario({
        username,
        email,
        password: hashedPassword
      });
      
      await nuevoUsuario.save();
      
      const token = jwt.sign(
        { userId: nuevoUsuario._id }, 
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '7d' }
      );
      
      res.status(201).json({
        mensaje: 'Usuario creado exitosamente',
        token,
        usuario: {
          id: nuevoUsuario._id,
          username: nuevoUsuario.username,
          email: nuevoUsuario.email,
          avatar: nuevoUsuario.avatar,
          bio: nuevoUsuario.bio
        }
      });
    } catch (error) {
      res.status(500).json({ mensaje: 'Error del servidor', error: error.message });
    }
  },

  // Login
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const usuario = await Usuario.findOne({ email });
      if (!usuario) {
        return res.status(400).json({ mensaje: 'Credenciales inválidas' });
      }
      
      const passwordValido = await bcrypt.compare(password, usuario.password);
      if (!passwordValido) {
        return res.status(400).json({ mensaje: 'Credenciales inválidas' });
      }
      
      const token = jwt.sign(
        { userId: usuario._id },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '7d' }
      );
      
      res.json({
        token,
        usuario: {
          id: usuario._id,
          username: usuario.username,
          email: usuario.email,
          avatar: usuario.avatar,
          bio: usuario.bio
        }
      });
    } catch (error) {
      res.status(500).json({ mensaje: 'Error del servidor', error: error.message });
    }
  },

  // Obtener perfil de usuario
  obtenerPerfil: async (req, res) => {
    try {
      const usuario = await Usuario.findById(req.params.id)
        .populate('siguiendo', 'username avatar')
        .populate('seguidores', 'username avatar')
        .select('-password');
      
      if (!usuario) {
        return res.status(404).json({ mensaje: 'Usuario no encontrado' });
      }
      
      res.json(usuario);
    } catch (error) {
      res.status(500).json({ mensaje: 'Error del servidor', error: error.message });
    }
  },

  // Seguir usuario
  seguirUsuario: async (req, res) => {
    try {
      const { usuarioId } = req.params;
      
      if (usuarioId === req.userId) {
        return res.status(400).json({ mensaje: 'No puedes seguirte a ti mismo' });
      }

      const usuario = await Usuario.findById(req.userId);
      const usuarioASeguir = await Usuario.findById(usuarioId);

      if (!usuarioASeguir) {
        return res.status(404).json({ mensaje: 'Usuario no encontrado' });
      }

      if (usuario.siguiendo.includes(usuarioId)) {
        return res.status(400).json({ mensaje: 'Ya sigues a este usuario' });
      }

      usuario.siguiendo.push(usuarioId);
      usuarioASeguir.seguidores.push(req.userId);

      await usuario.save();
      await usuarioASeguir.save();

      // Crear notificación
      const { crearNotificacion } = require('./notificationController');
      await crearNotificacion(
        usuarioId,
        req.userId,
        'follow',
        `${usuario.username} te ha empezado a seguir`
      );

      res.json({ mensaje: 'Usuario seguido exitosamente' });
    } catch (error) {
      console.error('Error siguiendo usuario:', error);
      res.status(500).json({ mensaje: 'Error del servidor' });
    }
  },

  // Dejar de seguir usuario
  dejarDeSeguir: async (req, res) => {
    try {
      const { usuarioId } = req.params;
      const usuarioActual = await Usuario.findById(req.userId);
      const usuarioADejarDeSeguir = await Usuario.findById(usuarioId);
      
      if (!usuarioADejarDeSeguir) {
        return res.status(404).json({ mensaje: 'Usuario no encontrado' });
      }
      
      usuarioActual.siguiendo = usuarioActual.siguiendo.filter(
        id => id.toString() !== usuarioADejarDeSeguir._id.toString()
      );
      usuarioADejarDeSeguir.seguidores = usuarioADejarDeSeguir.seguidores.filter(
        id => id.toString() !== usuarioActual._id.toString()
      );
      
      await usuarioActual.save();
      await usuarioADejarDeSeguir.save();
      
      res.json({ mensaje: 'Dejaste de seguir al usuario' });
    } catch (error) {
      res.status(500).json({ mensaje: 'Error del servidor', error: error.message });
    }
  },

  // Actualizar perfil
  actualizarPerfil: async (req, res) => {
    try {
      const { bio, avatar, esPrivado, username } = req.body;
      
      // Validar username si se está actualizando
      if (username) {
        const existingUser = await Usuario.findOne({ 
          username, 
          _id: { $ne: req.userId } 
        });
        
        if (existingUser) {
          return res.status(400).json({ mensaje: 'El nombre de usuario ya está en uso' });
        }
        
        // Validar formato del username
        const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
        if (!usernameRegex.test(username)) {
          return res.status(400).json({ 
            mensaje: 'El nombre de usuario debe tener entre 3-30 caracteres y solo puede contener letras, números y guiones bajos' 
          });
        }
      }
      
      const updateData = {};
      if (bio !== undefined) updateData.bio = bio;
      if (avatar !== undefined) updateData.avatar = avatar;
      if (esPrivado !== undefined) updateData.esPrivado = esPrivado;
      if (username !== undefined) updateData.username = username;
      
      const usuario = await Usuario.findByIdAndUpdate(
        req.userId,
        updateData,
        { new: true }
      ).select('-password');
      
      res.json(usuario);
    } catch (error) {
      res.status(500).json({ mensaje: 'Error del servidor', error: error.message });
    }
  },

  // Buscar usuarios
  buscarUsuarios: async (req, res) => {
    try {
      const { q } = req.query;
      
      if (!q || q.trim().length === 0) {
        return res.json({ usuarios: [] });
      }
      
      const searchTerm = q.trim();
      
      const usuarios = await Usuario.find({
        $or: [
          { username: { $regex: searchTerm, $options: 'i' } },
          { email: { $regex: searchTerm, $options: 'i' } },
          { bio: { $regex: searchTerm, $options: 'i' } }
        ]
      })
      .select('username avatar bio email')
      .limit(10);
      
      res.json({ usuarios });
    } catch (error) {
      res.status(500).json({ mensaje: 'Error del servidor', error: error.message });
    }
  },

  // Obtener usuarios sugeridos
  obtenerUsuariosSugeridos: async (req, res) => {
    try {
      const usuarioActual = await Usuario.findById(req.userId);
      
      const usuarios = await Usuario.find({
        _id: { 
          $nin: [...usuarioActual.siguiendo, req.userId] 
        },
        activo: true
      })
      .select('username avatar bio')
      .limit(5);
      
      res.json({ usuarios });
    } catch (error) {
      res.status(500).json({ mensaje: 'Error del servidor', error: error.message });
    }
  },

  // Upload avatar
  uploadAvatar: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ mensaje: 'No se ha subido ningún archivo' });
      }

      // Construir URL del avatar
      const avatarUrl = `/uploads/avatars/${req.file.filename}`;
      
      // Actualizar usuario con nueva URL de avatar
      const usuario = await Usuario.findByIdAndUpdate(
        req.userId,
        { avatar: avatarUrl },
        { new: true }
      ).select('-password');

      res.json({
        mensaje: 'Avatar actualizado correctamente',
        avatarUrl: avatarUrl,
        usuario: usuario
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      res.status(500).json({ mensaje: 'Error del servidor', error: error.message });
    }
  },
};

module.exports = usuarioController;
