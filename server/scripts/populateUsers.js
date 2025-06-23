const mongoose = require('mongoose');
const { Usuario } = require('../models');
require('dotenv').config();

const userData = [
  {
    username: 'gamer_pro_2024',
    email: 'gamer.pro@email.com',
    password: 'password123',
    bio: '🎮 Gaming enthusiast | RPG lover | Streamer',
    esPrivado: false
  },
  {
    username: 'rpg_master',
    email: 'rpgmaster@email.com',
    password: 'password123',
    bio: 'Master of RPGs and fantasy worlds ⚔️',
    esPrivado: false
  },
  {
    username: 'fps_legend',
    email: 'fpslegend@email.com',
    password: 'password123',
    bio: 'FPS champion 🎯 | Competitive player',
    esPrivado: false
  },
  {
    username: 'indie_explorer',
    email: 'indie.explorer@email.com',
    password: 'password123',
    bio: 'Discovering hidden indie gems 💎',
    esPrivado: false
  },
  {
    username: 'retro_gamer',
    email: 'retro.gamer@email.com',
    password: 'password123',
    bio: 'Old school gaming forever 👾',
    esPrivado: false
  },
  {
    username: 'speedrunner_elite',
    email: 'speedrun@email.com',
    password: 'password123',
    bio: 'Breaking records one run at a time ⚡',
    esPrivado: false
  },
  {
    username: 'strategy_mind',
    email: 'strategy@email.com',
    password: 'password123',
    bio: 'Strategic thinking in every game 🧠',
    esPrivado: false
  },
  {
    username: 'casual_player',
    email: 'casual@email.com',
    password: 'password123',
    bio: 'Gaming for fun and relaxation 😊',
    esPrivado: false
  },
  {
    username: 'horror_fan',
    email: 'horror.fan@email.com',
    password: 'password123',
    bio: 'Love being scared by great horror games 👻',
    esPrivado: true
  },
  {
    username: 'puzzle_solver',
    email: 'puzzle@email.com',
    password: 'password123',
    bio: 'Mind-bending puzzles are my specialty 🧩',
    esPrivado: false
  }
];

// Generar más usuarios proceduralmente
const generateMoreUsers = () => {
  const moreUsers = [];
  const usernames = [
    'ninja_gamer', 'pixel_warrior', 'game_crusher', 'digital_hero', 'cyber_knight',
    'arcade_master', 'console_king', 'pc_overlord', 'mobile_champion', 'vr_pioneer',
    'esports_star', 'stream_legend', 'content_creator', 'game_reviewer', 'beta_tester',
    'achievement_hunter', 'trophy_collector', 'leaderboard_topper', 'guild_leader', 'raid_master'
  ];
  
  const bios = [
    'Passionate gamer exploring new worlds',
    'Always looking for the next great adventure',
    'Competitive player with a love for challenges',
    'Casual gaming enthusiast',
    'Streaming my favorite games',
    'Building the ultimate gaming setup',
    'Collecting achievements and trophies',
    'Part-time streamer, full-time gamer',
    'Gaming is life, everything else is just details',
    'Exploring virtual worlds since childhood'
  ];

  for (let i = 1; i <= 40; i++) {
    const baseUsername = usernames[Math.floor(Math.random() * usernames.length)];
    const username = `${baseUsername}_${i}`;
    const bio = bios[Math.floor(Math.random() * bios.length)];
    const isPrivate = Math.random() < 0.2; // 20% private accounts

    moreUsers.push({
      username,
      email: `${username.toLowerCase()}@email.com`,
      password: 'password123',
      bio,
      esPrivado: isPrivate
    });
  }

  return moreUsers;
};

const allUsers = [...userData, ...generateMoreUsers()];

const populateUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vgz_gaming_db');
    console.log('Conectado a MongoDB');

    // Limpiar la colección existente de usuarios
    await Usuario.deleteMany({});
    console.log('Colección de usuarios limpiada');

    // Insertar todos los usuarios
    await Usuario.insertMany(allUsers);
    console.log(`${allUsers.length} usuarios insertados exitosamente`);

    // Crear algunas relaciones de seguimiento aleatorias
    const usuarios = await Usuario.find({});
    
    for (let i = 0; i < usuarios.length; i++) {
      const usuario = usuarios[i];
      const numSeguir = Math.floor(Math.random() * 10) + 1; // Entre 1 y 10 usuarios a seguir
      
      for (let j = 0; j < numSeguir; j++) {
        const randomUser = usuarios[Math.floor(Math.random() * usuarios.length)];
        
        // No seguirse a sí mismo y no duplicar seguimientos
        if (randomUser._id.toString() !== usuario._id.toString() && 
            !usuario.siguiendo.includes(randomUser._id)) {
          
          usuario.siguiendo.push(randomUser._id);
          randomUser.seguidores.push(usuario._id);
        }
      }
      
      await usuario.save();
    }

    // Actualizar todos los usuarios con sus nuevos seguidores
    for (let usuario of usuarios) {
      await usuario.save();
    }

    console.log('Relaciones de seguimiento creadas');
    console.log('Base de datos de usuarios poblada exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('Error poblando la base de datos de usuarios:', error);
    process.exit(1);
  }
};

populateUsers();
