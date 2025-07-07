const mongoose = require('mongoose');
const Videojuego = require('../models/Videojuego');

const videojuegos = [
  {
    nombre: 'The Legend of Zelda: Breath of the Wild',
    descripcion: 'Aventura épica en un mundo abierto',
    genero: 'Aventura',
    desarrollador: 'Nintendo',
    fechaLanzamiento: new Date('2017-03-03'),
    imagen: 'https://example.com/zelda.jpg',
    valoraciones: { loRecomiendo: 150, noLoRecomiendo: 5, meh: 10 }
  },
  {
    nombre: 'The Witcher 3: Wild Hunt',
    descripcion: 'RPG de fantasía con mundo abierto',
    genero: 'RPG',
    desarrollador: 'CD Projekt Red',
    fechaLanzamiento: new Date('2015-05-19'),
    imagen: 'https://example.com/witcher3.jpg',
    valoraciones: { loRecomiendo: 200, noLoRecomiendo: 8, meh: 15 }
  },
  {
    nombre: 'God of War',
    descripcion: 'Aventura de acción en la mitología nórdica',
    genero: 'Acción',
    desarrollador: 'Santa Monica Studio',
    fechaLanzamiento: new Date('2018-04-20'),
    imagen: 'https://example.com/gow.jpg',
    valoraciones: { loRecomiendo: 180, noLoRecomiendo: 3, meh: 12 }
  },
  {
    nombre: 'Cyberpunk 2077',
    descripcion: 'RPG futurista en Night City',
    genero: 'RPG',
    desarrollador: 'CD Projekt Red',
    fechaLanzamiento: new Date('2020-12-10'),
    imagen: 'https://example.com/cyberpunk.jpg',
    valoraciones: { loRecomiendo: 90, noLoRecomiendo: 45, meh: 30 }
  },
  {
    nombre: 'Call of Duty: Modern Warfare',
    descripcion: 'Shooter en primera persona',
    genero: 'Shooter',
    desarrollador: 'Infinity Ward',
    fechaLanzamiento: new Date('2019-10-25'),
    imagen: 'https://example.com/cod.jpg',
    valoraciones: { loRecomiendo: 120, noLoRecomiendo: 20, meh: 25 }
  },
  {
    nombre: 'Minecraft',
    descripcion: 'Juego de construcción y supervivencia',
    genero: 'Sandbox',
    desarrollador: 'Mojang Studios',
    fechaLanzamiento: new Date('2011-11-18'),
    imagen: 'https://example.com/minecraft.jpg',
    valoraciones: { loRecomiendo: 300, noLoRecomiendo: 5, meh: 8 }
  },
  {
    nombre: 'Grand Theft Auto V',
    descripcion: 'Mundo abierto de crimen y acción',
    genero: 'Acción',
    desarrollador: 'Rockstar Games',
    fechaLanzamiento: new Date('2013-09-17'),
    imagen: 'https://example.com/gta5.jpg',
    valoraciones: { loRecomiendo: 250, noLoRecomiendo: 15, meh: 20 }
  },
  {
    nombre: 'Among Us',
    descripcion: 'Juego multijugador de deducción social',
    genero: 'Multijugador',
    desarrollador: 'InnerSloth',
    fechaLanzamiento: new Date('2018-06-15'),
    imagen: 'https://example.com/amongus.jpg',
    valoraciones: { loRecomiendo: 100, noLoRecomiendo: 10, meh: 15 }
  },
  {
    nombre: 'Fortnite',
    descripcion: 'Battle Royale con construcción',
    genero: 'Battle Royale',
    desarrollador: 'Epic Games',
    fechaLanzamiento: new Date('2017-07-25'),
    imagen: 'https://example.com/fortnite.jpg',
    valoraciones: { loRecomiendo: 160, noLoRecomiendo: 40, meh: 35 }
  },
  {
    nombre: 'Dark Souls III',
    descripcion: 'RPG de acción desafiante',
    genero: 'RPG',
    desarrollador: 'FromSoftware',
    fechaLanzamiento: new Date('2016-04-12'),
    imagen: 'https://example.com/darksouls3.jpg',
    valoraciones: { loRecomiendo: 140, noLoRecomiendo: 25, meh: 18 }
  },
  {
    nombre: 'Super Mario Odyssey',
    descripcion: 'Plataformas 3D con Mario',
    genero: 'Plataformas',
    desarrollador: 'Nintendo',
    fechaLanzamiento: new Date('2017-10-27'),
    imagen: 'https://example.com/mario.jpg',
    valoraciones: { loRecomiendo: 170, noLoRecomiendo: 2, meh: 8 }
  },
  {
    nombre: 'Overwatch',
    descripcion: 'Shooter por equipos en primera persona',
    genero: 'Shooter',
    desarrollador: 'Blizzard Entertainment',
    fechaLanzamiento: new Date('2016-05-24'),
    imagen: 'https://example.com/overwatch.jpg',
    valoraciones: { loRecomiendo: 130, noLoRecomiendo: 18, meh: 22 }
  }
];

const seedVideojuegos = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vgz');
    
    await Videojuego.deleteMany({});
    await Videojuego.insertMany(videojuegos);
    
    console.log('Videojuegos seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding videojuegos:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  seedVideojuegos();
}

module.exports = { videojuegos, seedVideojuegos };
