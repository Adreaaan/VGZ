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
          email: nuevoUsuario.email
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
          email: usuario.email
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
      const usuarioActual = await Usuario.findById(req.userId);
      const usuarioASeguir = await Usuario.findById(req.params.id);
      
      if (!usuarioASeguir) {
        return res.status(404).json({ mensaje: 'Usuario no encontrado' });
      }
      
      if (usuarioActual.siguiendo.includes(usuarioASeguir._id)) {
        return res.status(400).json({ mensaje: 'Ya sigues a este usuario' });
      }
      
      usuarioActual.siguiendo.push(usuarioASeguir._id);
      usuarioASeguir.seguidores.push(usuarioActual._id);
      
      await usuarioActual.save();
      await usuarioASeguir.save();
      
      res.json({ mensaje: 'Usuario seguido exitosamente' });
    } catch (error) {
      res.status(500).json({ mensaje: 'Error del servidor', error: error.message });
    }
  },

  // Dejar de seguir usuario
  dejarDeSeguir: async (req, res) => {
    try {
      const usuarioActual = await Usuario.findById(req.userId);
      const usuarioADejarDeSeguir = await Usuario.findById(req.params.id);
      
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
      const { bio, avatar, esPrivado } = req.body;
      
      const usuario = await Usuario.findByIdAndUpdate(
        req.userId,
        { bio, avatar, esPrivado },
        { new: true }
      ).select('-password');
      
      res.json(usuario);
    } catch (error) {
      res.status(500).json({ mensaje: 'Error del servidor', error: error.message });
    }
  }
};

module.exports = usuarioController;
