const mongoose = require('mongoose');
const { Videojuego } = require('../models');
require('dotenv').config();

const realGamesData = [
  // Juegos AAA populares
  {
    nombre: 'The Legend of Zelda: Breath of the Wild',
    descripcion: 'Un épico juego de aventuras en mundo abierto donde Link debe salvar Hyrule.',
    generos: ['Aventura', 'RPG'],
    desarrollador: 'Nintendo EPD',
    distribuidor: 'Nintendo',
    creador: 'Eiji Aonuma',
    fechaLanzamiento: '2017-03-03',
    plataformas: ['Nintendo Switch'],
    imagen: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1716740/header.jpg'
  },
  {
    nombre: 'God of War',
    descripcion: 'Kratos y su hijo Atreus embarcan en una épica aventura por los reinos nórdicos.',
    generos: ['Aventura'],
    desarrollador: 'Santa Monica Studio',
    distribuidor: 'Sony Interactive Entertainment',
    creador: 'Cory Barlog',
    fechaLanzamiento: '2018-04-20',
    plataformas: ['PlayStation'],
    imagen: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1593500/header.jpg'
  },
  {
    nombre: 'Red Dead Redemption 2',
    descripcion: 'Un western épico que sigue la historia de Arthur Morgan y la pandilla de Dutch van der Linde.',
    generos: ['Aventura', 'Simulacion'],
    desarrollador: 'Rockstar Studios',
    distribuidor: 'Rockstar Games',
    creador: 'Dan Houser',
    fechaLanzamiento: '2018-10-26',
    plataformas: ['PlayStation', 'Xbox', 'PC'],
    imagen: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1174180/header.jpg'
  },
  {
    nombre: 'Cyberpunk 2077',
    descripcion: 'Un RPG futurista ambientado en Night City donde juegas como V, un mercenario.',
    generos: ['RPG', 'FPS'],
    desarrollador: 'CD Projekt RED',
    distribuidor: 'CD Projekt',
    creador: 'Adam Badowski',
    fechaLanzamiento: '2020-12-10',
    plataformas: ['PC', 'PlayStation', 'Xbox'],
    imagen: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/header.jpg'
  },
  {
    nombre: 'The Witcher 3: Wild Hunt',
    descripcion: 'Geralt de Rivia busca a su hija adoptiva en este épico RPG de fantasía.',
    generos: ['RPG', 'Aventura'],
    desarrollador: 'CD Projekt RED',
    distribuidor: 'CD Projekt',
    creador: 'Konrad Tomaszkiewicz',
    fechaLanzamiento: '2015-05-19',
    plataformas: ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch'],
    imagen: 'https://cdn.cloudflare.steamstatic.com/steam/apps/292030/header.jpg'
  },
  {
    nombre: 'Minecraft',
    descripcion: 'Un juego de construcción y supervivencia en mundo abierto con infinitas posibilidades.',
    generos: ['Simulacion', 'Aventura'],
    desarrollador: 'Mojang Studios',
    distribuidor: 'Microsoft',
    creador: 'Markus Persson',
    fechaLanzamiento: '2011-11-18',
    plataformas: ['PC', 'Mobile', 'PlayStation', 'Xbox', 'Nintendo Switch'],
    imagen: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1888160/header.jpg'
  },
  {
    nombre: 'Grand Theft Auto V',
    descripcion: 'Un juego de acción en mundo abierto que sigue las vidas de tres criminales en Los Santos.',
    generos: ['Aventura', 'Racing'],
    desarrollador: 'Rockstar North',
    distribuidor: 'Rockstar Games',
    creador: 'Leslie Benzies',
    fechaLanzamiento: '2013-09-17',
    plataformas: ['PC', 'PlayStation', 'Xbox'],
    imagen: 'https://cdn.cloudflare.steamstatic.com/steam/apps/271590/header.jpg'
  },
  {
    nombre: 'Elden Ring',
    descripcion: 'Un RPG de acción en mundo abierto creado por FromSoftware y George R.R. Martin.',
    generos: ['RPG', 'Aventura'],
    desarrollador: 'FromSoftware',
    distribuidor: 'Bandai Namco',
    creador: 'Hidetaka Miyazaki',
    fechaLanzamiento: '2022-02-25',
    plataformas: ['PC', 'PlayStation', 'Xbox'],
    imagen: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/header.jpg'
  },
  {
    nombre: 'Counter-Strike 2',
    descripcion: 'El shooter competitivo más icónico, renovado con el motor Source 2.',
    generos: ['FPS'],
    desarrollador: 'Valve',
    distribuidor: 'Valve',
    creador: 'Minh Le',
    fechaLanzamiento: '2023-09-27',
    plataformas: ['PC'],
    imagen: 'https://cdn.cloudflare.steamstatic.com/steam/apps/730/header.jpg'
  },
  {
    nombre: 'Valorant',
    descripcion: 'Shooter táctico en primera persona con agentes únicos y habilidades especiales.',
    generos: ['FPS'],
    desarrollador: 'Riot Games',
    distribuidor: 'Riot Games',
    creador: 'Anna Donlon',
    fechaLanzamiento: '2020-06-02',
    plataformas: ['PC'],
    imagen: 'https://www.riotgames.com/darkroom/1440/8d5c497da1c2eeec8cffa99b01abc64b:8e5a7bf27ccc0d5bc2a08ab7ab3ef387/valorant-keyart.jpg'
  }
];

// Generar 200+ juegos reales adicionales
const generateMoreRealGames = () => {
  const moreGames = [
    // FPS Games
    {
      nombre: 'Apex Legends',
      descripcion: 'Battle royale de héroes con equipos de tres jugadores y leyendas únicas.',
      generos: ['FPS'],
      desarrollador: 'Respawn Entertainment',
      distribuidor: 'Electronic Arts',
      creador: 'Vince Zampella',
      fechaLanzamiento: '2019-02-04',
      plataformas: ['PC', 'PlayStation', 'Xbox'],
      imagen: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1172470/header.jpg'
    },
    {
      nombre: 'Call of Duty: Modern Warfare II',
      descripcion: 'Shooter en primera persona con campaña cinematográfica y multijugador competitivo.',
      generos: ['FPS'],
      desarrollador: 'Infinity Ward',
      distribuidor: 'Activision',
      creador: 'Jason West',
      fechaLanzamiento: '2022-10-28',
      plataformas: ['PC', 'PlayStation', 'Xbox'],
      imagen: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1938090/header.jpg'
    },
    {
      nombre: 'Overwatch 2',
      descripcion: 'Shooter de héroes en equipo con personajes únicos y habilidades especiales.',
      generos: ['FPS'],
      desarrollador: 'Blizzard Entertainment',
      distribuidor: 'Blizzard Entertainment',
      creador: 'Jeff Kaplan',
      fechaLanzamiento: '2022-10-04',
      plataformas: ['PC', 'PlayStation', 'Xbox'],
      imagen: 'https://cdn.cloudflare.steamstatic.com/steam/apps/2357570/header.jpg'
    },
    {
      nombre: 'Doom Eternal',
      descripcion: 'FPS frenético donde eres el Doom Slayer luchando contra demonios del infierno.',
      generos: ['FPS'],
      desarrollador: 'id Software',
      distribuidor: 'Bethesda',
      creador: 'Hugo Martin',
      fechaLanzamiento: '2020-03-20',
      plataformas: ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch'],
      imagen: 'https://cdn.cloudflare.steamstatic.com/steam/apps/782330/header.jpg'
    },
    {
      nombre: 'Battlefield 2042',
      descripcion: 'Shooter multijugador masivo con mapas dinámicos y eventos extremos.',
      generos: ['FPS'],
      desarrollador: 'DICE',
      distribuidor: 'Electronic Arts',
      creador: 'Oskar Gabrielson',
      fechaLanzamiento: '2021-11-19',
      plataformas: ['PC', 'PlayStation', 'Xbox'],
      imagen: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1517290/header.jpg'
    },
    // RPG Games
    {
      nombre: 'Dark Souls III',
      descripcion: 'RPG de acción desafiante con combate preciso y mundo interconectado.',
      generos: ['RPG'],
      desarrollador: 'FromSoftware',
      distribuidor: 'Bandai Namco',
      creador: 'Hidetaka Miyazaki',
      fechaLanzamiento: '2016-04-12',
      plataformas: ['PC', 'PlayStation', 'Xbox'],
      imagen: 'https://cdn.cloudflare.steamstatic.com/steam/apps/374320/header.jpg'
    },
    {
      nombre: 'Skyrim',
      descripcion: 'RPG épico en mundo abierto donde eres el Dragonborn destinado a salvar el mundo.',
      generos: ['RPG'],
      desarrollador: 'Bethesda Game Studios',
      distribuidor: 'Bethesda',
      creador: 'Todd Howard',
      fechaLanzamiento: '2011-11-11',
      plataformas: ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch'],
      imagen: 'https://cdn.cloudflare.steamstatic.com/steam/apps/489830/header.jpg'
    },
    {
      nombre: 'Fallout 4',
      descripcion: 'RPG post-apocalíptico en mundo abierto donde reconstruyes la civilización.',
      generos: ['RPG'],
      desarrollador: 'Bethesda Game Studios',
      distribuidor: 'Bethesda',
      creador: 'Todd Howard',
      fechaLanzamiento: '2015-11-10',
      plataformas: ['PC', 'PlayStation', 'Xbox'],
      imagen: 'https://cdn.cloudflare.steamstatic.com/steam/apps/377160/header.jpg'
    },
    {
      nombre: 'Mass Effect Legendary Edition',
      descripcion: 'Trilogía remasterizada de ciencia ficción con decisiones que afectan la galaxia.',
      generos: ['RPG'],
      desarrollador: 'BioWare',
      distribuidor: 'Electronic Arts',
      creador: 'Casey Hudson',
      fechaLanzamiento: '2021-05-14',
      plataformas: ['PC', 'PlayStation', 'Xbox'],
      imagen: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1328670/header.jpg'
    },
    // Strategy Games
    {
      nombre: 'Age of Empires IV',
      descripcion: 'Estrategia en tiempo real con civilizaciones históricas y batallas épicas.',
      generos: ['Estrategia'],
      desarrollador: 'Relic Entertainment',
      distribuidor: 'Microsoft',
      creador: 'Quinn Duffy',
      fechaLanzamiento: '2021-10-28',
      plataformas: ['PC'],
      imagen: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1466860/header.jpg'
    },
    {
      nombre: 'Civilization VI',
      descripcion: 'Construye un imperio que resista la prueba del tiempo en este juego de estrategia por turnos.',
      generos: ['Estrategia'],
      desarrollador: 'Firaxis Games',
      distribuidor: '2K Games',
      creador: 'Ed Beach',
      fechaLanzamiento: '2016-10-21',
      plataformas: ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch'],
      imagen: 'https://cdn.cloudflare.steamstatic.com/steam/apps/289070/header.jpg'
    },
    {
      nombre: 'Total War: Warhammer III',
      descripcion: 'Estrategia épica combinando gestión de imperio y batallas tácticas masivas.',
      generos: ['Estrategia'],
      desarrollador: 'Creative Assembly',
      distribuidor: 'Sega',
      creador: 'Ian Roxburgh',
      fechaLanzamiento: '2022-02-17',
      plataformas: ['PC'],
      imagen: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1142710/header.jpg'
    },
    // Sports Games
    {
      nombre: 'FIFA 24',
      descripcion: 'La simulación de fútbol más realista con equipos y jugadores licenciados.',
      generos: ['Deportes'],
      desarrollador: 'EA Sports',
      distribuidor: 'Electronic Arts',
      creador: 'Aaron McHardy',
      fechaLanzamiento: '2023-09-29',
      plataformas: ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch'],
      imagen: 'https://cdn.cloudflare.steamstatic.com/steam/apps/2195250/header.jpg'
    },
    {
      nombre: 'NBA 2K24',
      descripcion: 'Simulación de baloncesto con jugadores de la NBA y modos de juego variados.',
      generos: ['Deportes'],
      desarrollador: 'Visual Concepts',
      distribuidor: '2K Sports',
      creador: 'Greg Thomas',
      fechaLanzamiento: '2023-09-08',
      plataformas: ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch'],
      imagen: 'https://cdn.cloudflare.steamstatic.com/steam/apps/2338770/header.jpg'
    },
    // Racing Games
    {
      nombre: 'Forza Horizon 5',
      descripcion: 'Carreras en mundo abierto ambientado en México con cientos de coches.',
      generos: ['Racing'],
      desarrollador: 'Playground Games',
      distribuidor: 'Microsoft',
      creador: 'Mike Brown',
      fechaLanzamiento: '2021-11-09',
      plataformas: ['PC', 'Xbox'],
      imagen: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1551360/header.jpg'
    },
    {
      nombre: 'F1 23',
      descripcion: 'Simulación oficial de Fórmula 1 con todos los circuitos y pilotos de la temporada.',
      generos: ['Racing'],
      desarrollador: 'Codemasters',
      distribuidor: 'Electronic Arts',
      creador: 'Lee Mather',
      fechaLanzamiento: '2023-06-16',
      plataformas: ['PC', 'PlayStation', 'Xbox'],
      imagen: 'https://cdn.cloudflare.steamstatic.com/steam/apps/2108330/header.jpg'
    },
    // Indie Games
    {
      nombre: 'Hades',
      descripcion: 'Roguelike de acción donde juegas como el hijo de Hades escapando del inframundo.',
      generos: ['Indie', 'RPG'],
      desarrollador: 'Supergiant Games',
      distribuidor: 'Supergiant Games',
      creador: 'Greg Kasavin',
      fechaLanzamiento: '2020-09-17',
      plataformas: ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch'],
      imagen: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1145360/header.jpg'
    },
    {
      nombre: 'Celeste',
      descripcion: 'Platformer desafiante sobre superar obstáculos internos y externos.',
      generos: ['Indie', 'Plataformas'],
      desarrollador: 'Maddy Makes Games',
      distribuidor: 'Maddy Makes Games',
      creador: 'Maddy Thorson',
      fechaLanzamiento: '2018-01-25',
      plataformas: ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch'],
      imagen: 'https://cdn.cloudflare.steamstatic.com/steam/apps/504230/header.jpg'
    },
    {
      nombre: 'Hollow Knight',
      descripcion: 'Metroidvania atmosférico en un reino de insectos lleno de secretos.',
      generos: ['Indie', 'Plataformas'],
      desarrollador: 'Team Cherry',
      distribuidor: 'Team Cherry',
      creador: 'Ari Gibson',
      fechaLanzamiento: '2017-02-24',
      plataformas: ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch'],
      imagen: 'https://cdn.cloudflare.steamstatic.com/steam/apps/367520/header.jpg'
    },
    {
      nombre: 'Stardew Valley',
      descripcion: 'Simulación de granja relajante donde construyes tu nueva vida en el campo.',
      generos: ['Indie', 'Simulacion'],
      desarrollador: 'ConcernedApe',
      distribuidor: 'ConcernedApe',
      creador: 'Eric Barone',
      fechaLanzamiento: '2016-02-26',
      plataformas: ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch', 'Mobile'],
      imagen: 'https://cdn.cloudflare.steamstatic.com/steam/apps/413150/header.jpg'
    },
    // Continuar con más juegos hasta llegar a 200+...
    // Agregando más series populares
    {
      nombre: 'Assassin\'s Creed Valhalla',
      descripcion: 'Aventura vikinga épica en la Inglaterra medieval.',
      generos: ['Aventura', 'RPG'],
      desarrollador: 'Ubisoft Montreal',
      distribuidor: 'Ubisoft',
      creador: 'Ashraf Ismail',
      fechaLanzamiento: '2020-11-10',
      plataformas: ['PC', 'PlayStation', 'Xbox'],
      imagen: 'https://cdn.cloudflare.steamstatic.com/steam/apps/2208920/header.jpg'
    },
    {
      nombre: 'Spider-Man Remastered',
      descripcion: 'Acción de superhéroes balanceándote por Nueva York como Spider-Man.',
      generos: ['Aventura'],
      desarrollador: 'Insomniac Games',
      distribuidor: 'Sony Interactive Entertainment',
      creador: 'Bryan Intihar',
      fechaLanzamiento: '2022-08-12',
      plataformas: ['PC', 'PlayStation'],
      imagen: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1817070/header.jpg'
    },
    // Horror Games
    {
      nombre: 'Resident Evil 4',
      descripcion: 'Survival horror reimaginado con gráficos modernos y jugabilidad mejorada.',
      generos: ['Horror', 'Aventura'],
      desarrollador: 'Capcom',
      distribuidor: 'Capcom',
      creador: 'Yasuhiro Anpo',
      fechaLanzamiento: '2023-03-24',
      plataformas: ['PC', 'PlayStation', 'Xbox'],
      imagen: 'https://cdn.cloudflare.steamstatic.com/steam/apps/2050650/header.jpg'
    },
    {
      nombre: 'Dead by Daylight',
      descripcion: 'Multijugador asimétrico donde supervivientes escapan de asesinos icónicos.',
      generos: ['Horror', 'Multijugador'],
      desarrollador: 'Behaviour Interactive',
      distribuidor: 'Behaviour Interactive',
      creador: 'Mathieu Cote',
      fechaLanzamiento: '2016-06-14',
      plataformas: ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch'],
      imagen: 'https://cdn.cloudflare.steamstatic.com/steam/apps/381210/header.jpg'
    },
    {
      nombre: 'Phasmophobia',
      descripcion: 'Investigación paranormal cooperativa con fantasmas terroríficos.',
      generos: ['Horror', 'Indie'],
      desarrollador: 'Kinetic Games',
      distribuidor: 'Kinetic Games',
      creador: 'DknightDA',
      fechaLanzamiento: '2020-09-18',
      plataformas: ['PC'],
      imagen: 'https://cdn.cloudflare.steamstatic.com/steam/apps/739630/header.jpg'
    },
    {
      nombre: 'Silent Hill 2',
      descripcion: 'Remake del clásico horror psicológico más aclamado de todos los tiempos.',
      generos: ['Horror'],
      desarrollador: 'Bloober Team',
      distribuidor: 'Konami',
      creador: 'Masahiro Ito',
      fechaLanzamiento: '2024-10-08',
      plataformas: ['PC', 'PlayStation'],
      imagen: 'https://cdn.cloudflare.steamstatic.com/steam/apps/2124490/header.jpg'
    },
    {
      nombre: 'The Dark Pictures Anthology: House of Ashes',
      descripcion: 'Horror cinematográfico con decisiones que determinan quién sobrevive.',
      generos: ['Horror', 'Aventura'],
      desarrollador: 'Supermassive Games',
      distribuidor: 'Bandai Namco',
      creador: 'Pete Samuels',
      fechaLanzamiento: '2021-10-22',
      plataformas: ['PC', 'PlayStation', 'Xbox'],
      imagen: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1281590/header.jpg'
    },
    
    // Fighting Games
    {
      nombre: 'Street Fighter 6',
      descripcion: 'El regreso de la legendaria serie de lucha con nuevos luchadores y mecánicas.',
      generos: ['Fighting'],
      desarrollador: 'Capcom',
      distribuidor: 'Capcom',
      creador: 'Takayuki Nakayama',
      fechaLanzamiento: '2023-06-02',
      plataformas: ['PC', 'PlayStation', 'Xbox'],
      imagen: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1364780/header.jpg'
    },
    {
      nombre: 'Tekken 8',
      descripcion: 'Combates 3D intensos con la saga Mishima llegando a su clímax.',
      generos: ['Fighting'],
      desarrollador: 'Bandai Namco',
      distribuidor: 'Bandai Namco',
      creador: 'Katsuhiro Harada',
      fechaLanzamiento: '2024-01-26',
      plataformas: ['PC', 'PlayStation', 'Xbox'],
      imagen: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1778820/header.jpg'
    },
    {
      nombre: 'Mortal Kombat 1',
      descripcion: 'Reinvención brutal de la serie con Fatalities más sangrientos que nunca.',
      generos: ['Fighting'],
      desarrollador: 'NetherRealm Studios',
      distribuidor: 'Warner Bros',
      creador: 'Ed Boon',
      fechaLanzamiento: '2023-09-19',
      plataformas: ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch'],
      imagen: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1971870/header.jpg'
    },
    {
      nombre: 'Guilty Gear Strive',
      descripcion: 'Combates de anime frenéticos con gráficos 2.5D espectaculares.',
      generos: ['Fighting'],
      desarrollador: 'Arc System Works',
      distribuidor: 'Arc System Works',
      creador: 'Daisuke Ishiwatari',
      fechaLanzamiento: '2021-06-11',
      plataformas: ['PC', 'PlayStation'],
      imagen: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1384160/header.jpg'
    },
    
    // Puzzle Games
    {
      nombre: 'Portal 2',
      descripcion: 'Puzzle en primera persona con mecánicas de portales y humor inteligente.',
      generos: ['Puzzle', 'Aventura'],
      desarrollador: 'Valve',
      distribuidor: 'Valve',
      creador: 'Erik Wolpaw',
      fechaLanzamiento: '2011-04-18',
      plataformas: ['PC', 'PlayStation', 'Xbox'],
      imagen: 'https://cdn.cloudflare.steamstatic.com/steam/apps/620/header.jpg'
    },
    {
      nombre: 'Tetris Effect: Connected',
      descripcion: 'Tetris reimaginado con efectos visuales y musicales hipnóticos.',
      generos: ['Puzzle'],
      desarrollador: 'Monstars',
      distribuidor: 'Enhance',
      creador: 'Tetsuya Mizuguchi',
      fechaLanzamiento: '2020-08-18',
      plataformas: ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch'],
      imagen: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1003590/header.jpg'
    },
    {
      nombre: 'The Witness',
      descripcion: 'Isla misteriosa llena de puzzles interconectados y secretos filosóficos.',
      generos: ['Puzzle', 'Indie'],
      desarrollador: 'Thekla',
      distribuidor: 'Thekla',
      creador: 'Jonathan Blow',
      fechaLanzamiento: '2016-01-26',
      plataformas: ['PC', 'PlayStation', 'Xbox'],
      imagen: 'https://cdn.cloudflare.steamstatic.com/steam/apps/210970/header.jpg'
    },
    
    // Simulation Games
    {
      nombre: 'Cities: Skylines',
      descripcion: 'Constructor de ciudades moderno con gestión detallada y modding extenso.',
      generos: ['Simulacion', 'Estrategia'],
      desarrollador: 'Colossal Order',
      distribuidor: 'Paradox Interactive',
      creador: 'Mariina Hallikainen',
      fechaLanzamiento: '2015-03-10',
      plataformas: ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch'],
      imagen: 'https://cdn.cloudflare.steamstatic.com/steam/apps/255710/header.jpg'
    },
    {
      nombre: 'Microsoft Flight Simulator',
      descripcion: 'Simulación de vuelo ultra-realista con el mundo entero recreado.',
      generos: ['Simulacion'],
      desarrollador: 'Asobo Studio',
      distribuidor: 'Microsoft',
      creador: 'Jorg Neumann',
      fechaLanzamiento: '2020-08-18',
      plataformas: ['PC', 'Xbox'],
      imagen: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1250410/header.jpg'
    },
    {
      nombre: 'Euro Truck Simulator 2',
      descripcion: 'Conduce camiones por Europa en la simulación de transporte más realista.',
      generos: ['Simulacion'],
      desarrollador: 'SCS Software',
      distribuidor: 'SCS Software',
      creador: 'Pavel Sebor',
      fechaLanzamiento: '2012-10-19',
      plataformas: ['PC'],
      imagen: 'https://cdn.cloudflare.steamstatic.com/steam/apps/227300/header.jpg'
    },
    {
      nombre: 'Two Point Hospital',
      descripcion: 'Gestión hospitalaria con humor británico y situaciones absurdas.',
      generos: ['Simulacion', 'Estrategia'],
      desarrollador: 'Two Point Studios',
      distribuidor: 'Sega',
      creador: 'Gary Carr',
      fechaLanzamiento: '2018-08-30',
      plataformas: ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch'],
      imagen: 'https://cdn.cloudflare.steamstatic.com/steam/apps/535930/header.jpg'
    },
    
    // Platform Games
    {
      nombre: 'Super Mario Odyssey',
      descripcion: 'Aventura 3D de Mario explorando reinos únicos con su compañero Cappy.',
      generos: ['Plataformas', 'Aventura'],
      desarrollador: 'Nintendo EPD',
      distribuidor: 'Nintendo',
      creador: 'Kenta Motokura',
      fechaLanzamiento: '2017-10-27',
      plataformas: ['Nintendo Switch'],
      imagen: 'https://assets.nintendo.com/image/upload/c_fill,w_1200/q_auto:best/f_auto/dpr_2.0/ncom/software/switch/70010000000588/c0b8df4dbe50fe8b21eb1f71b3a09b9afc3e9c95e90a70b4d2a946e03f4fb86c'
    },
    {
      nombre: 'Ori and the Will of the Wisps',
      descripcion: 'Metroidvania emotivo con arte hermoso y banda sonora conmovedora.',
      generos: ['Plataformas', 'Indie'],
      desarrollador: 'Moon Studios',
      distribuidor: 'Microsoft',
      creador: 'Thomas Mahler',
      fechaLanzamiento: '2020-03-11',
      plataformas: ['PC', 'Xbox', 'Nintendo Switch'],
      imagen: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1057090/header.jpg'
    },
    {
      nombre: 'A Hat in Time',
      descripcion: 'Platformer 3D colorido inspirado en los clásicos de Nintendo 64.',
      generos: ['Plataformas', 'Indie'],
      desarrollador: 'Gears for Breakfast',
      distribuidor: 'Gears for Breakfast',
      creador: 'Jonas Kærlev',
      fechaLanzamiento: '2017-10-05',
      plataformas: ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch'],
      imagen: 'https://cdn.cloudflare.steamstatic.com/steam/apps/253230/header.jpg'
    },
    
    // MMO Games
    {
      nombre: 'Final Fantasy XIV',
      descripcion: 'MMORPG con historia épica, raids desafiantes y comunidad apasionada.',
      generos: ['MMO', 'RPG'],
      desarrollador: 'Square Enix',
      distribuidor: 'Square Enix',
      creador: 'Naoki Yoshida',
      fechaLanzamiento: '2013-08-27',
      plataformas: ['PC', 'PlayStation'],
      imagen: 'https://cdn.cloudflare.steamstatic.com/steam/apps/39210/header.jpg'
    },
    {
      nombre: 'World of Warcraft',
      descripcion: 'El MMORPG más icónico donde exploras Azeroth con millones de jugadores.',
      generos: ['MMO', 'RPG'],
      desarrollador: 'Blizzard Entertainment',
      distribuidor: 'Blizzard Entertainment',
      creador: 'Tom Chilton',
      fechaLanzamiento: '2004-11-23',
      plataformas: ['PC'],
      imagen: 'https://bnetcmsus-a.akamaihd.net/cms/page_media/8V3OMYZKXV0N1634917886813.jpg'
    },
    {
      nombre: 'Guild Wars 2',
      descripcion: 'MMORPG sin suscripción con eventos dinámicos y PvP competitivo.',
      generos: ['MMO', 'RPG'],
      desarrollador: 'ArenaNet',
      distribuidor: 'NCSoft',
      creador: 'Mike O\'Brien',
      fechaLanzamiento: '2012-08-28',
      plataformas: ['PC'],
      imagen: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1284210/header.jpg'
    },
    
    // Continuar agregando hasta llegar a 200+ juegos...
    {
      nombre: 'Baldur\'s Gate 3',
      descripcion: 'RPG por turnos basado en D&D con narrativa profunda y elecciones significativas.',
      generos: ['RPG'],
      desarrollador: 'Larian Studios',
      distribuidor: 'Larian Studios',
      creador: 'Swen Vincke',
      fechaLanzamiento: '2023-08-03',
      plataformas: ['PC', 'PlayStation'],
      imagen: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1086940/header.jpg'
    },
    {
      nombre: 'Disco Elysium',
      descripcion: 'RPG narrativo revolucionario donde las conversaciones son el combate.',
      generos: ['RPG', 'Indie'],
      desarrollador: 'ZA/UM',
      distribuidor: 'ZA/UM',
      creador: 'Robert Kurvitz',
      fechaLanzamiento: '2019-10-15',
      plataformas: ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch'],
      imagen: 'https://cdn.cloudflare.steamstatic.com/steam/apps/632470/header.jpg'
    },
    {
      nombre: 'Divinity: Original Sin 2',
      descripcion: 'RPG por turnos cooperativo con sistemas mágicos creativos y libertad total.',
      generos: ['RPG'],
      desarrollador: 'Larian Studios',
      distribuidor: 'Larian Studios',
      creador: 'Swen Vincke',
      fechaLanzamiento: '2017-09-14',
      plataformas: ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch'],
      imagen: 'https://cdn.cloudflare.steamstatic.com/steam/apps/435150/header.jpg'
    },
    // Survival Games
    {
      nombre: 'Subnautica',
      descripcion: 'Exploración submarina y supervivencia en un océano alienígena lleno de criaturas.',
      generos: ['Aventura', 'Supervivencia'],
      desarrollador: 'Unknown Worlds Entertainment',
      distribuidor: 'Unknown Worlds Entertainment',
      creador: 'Charlie Cleveland',
      fechaLanzamiento: '2018-01-23',
      plataformas: ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch'],
      imagen: 'https://cdn.cloudflare.steamstatic.com/steam/apps/264710/header.jpg'
    },
    {
      nombre: 'The Forest',
      descripcion: 'Supervivencia en bosque con construcción de bases y caníbales hostiles.',
      generos: ['Supervivencia', 'Horror'],
      desarrollador: 'Endnight Games',
      distribuidor: 'Endnight Games',
      creador: 'Ben Falcone',
      fechaLanzamiento: '2018-04-30',
      plataformas: ['PC', 'PlayStation'],
      imagen: 'https://cdn.cloudflare.steamstatic.com/steam/apps/242760/header.jpg'
    },
    {
      nombre: 'Valheim',
      descripcion: 'Supervivencia cooperativa vikinga con construcción y exploración épica.',
      generos: ['Supervivencia', 'Indie'],
      desarrollador: 'Iron Gate AB',
      distribuidor: 'Coffee Stain Publishing',
      creador: 'Henrik Törnqvist',
      fechaLanzamiento: '2021-02-02',
      plataformas: ['PC', 'Xbox'],
      imagen: 'https://cdn.cloudflare.steamstatic.com/steam/apps/892970/header.jpg'
    },
    {
      nombre: 'Rust',
      descripcion: 'Supervivencia multijugador brutal donde solo los más fuertes sobreviven.',
      generos: ['Supervivencia', 'Multijugador'],
      desarrollador: 'Facepunch Studios',
      distribuidor: 'Facepunch Studios',
      creador: 'Garry Newman',
      fechaLanzamiento: '2018-02-08',
      plataformas: ['PC', 'PlayStation', 'Xbox'],
      imagen: 'https://cdn.cloudflare.steamstatic.com/steam/apps/252490/header.jpg'
    },
    {
      nombre: 'Green Hell',
      descripcion: 'Supervivencia realista en la selva amazónica con elementos psicológicos.',
      generos: ['Supervivencia'],
      desarrollador: 'Creepy Jar',
      distribuidor: 'Creepy Jar',
      creador: 'Krzysztof Kwiatek',
      fechaLanzamiento: '2019-09-05',
      plataformas: ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch'],
      imagen: 'https://cdn.cloudflare.steamstatic.com/steam/apps/815370/header.jpg'
    },

    // Action Adventure
    {
      nombre: 'Horizon Zero Dawn',
      descripcion: 'Mundo post-apocalíptico dominado por máquinas donde cazas dinosaurios robóticos.',
      generos: ['Aventura', 'RPG'],
      desarrollador: 'Guerrilla Games',
      distribuidor: 'Sony Interactive Entertainment',
      creador: 'Mathijs de Jonge',
      fechaLanzamiento: '2020-08-07',
      plataformas: ['PC', 'PlayStation'],
      imagen: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1151640/header.jpg'
    },
    {
      nombre: 'Control',
      descripcion: 'Thriller sobrenatural con poderes telekinéticos en un edificio paranormal.',
      generos: ['Aventura', 'FPS'],
      desarrollador: 'Remedy Entertainment',
      distribuidor: '505 Games',
      creador: 'Sam Lake',
      fechaLanzamiento: '2019-08-27',
      plataformas: ['PC', 'PlayStation', 'Xbox'],
      imagen: 'https://cdn.cloudflare.steamstatic.com/steam/apps/870780/header.jpg'
    },
    {
      nombre: 'Death Stranding',
      descripcion: 'Experiencia única de Hideo Kojima sobre conexión y entrega en mundo post-apocalíptico.',
      generos: ['Aventura'],
      desarrollador: 'Kojima Productions',
      distribuidor: '505 Games',
      creador: 'Hideo Kojima',
      fechaLanzamiento: '2020-07-14',
      plataformas: ['PC', 'PlayStation'],
      imagen: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1190460/header.jpg'
    },
    {
      nombre: 'Ghost of Tsushima',
      descripcion: 'Aventura de samurai en Japón feudal con combate cinematográfico.',
      generos: ['Aventura'],
      desarrollador: 'Sucker Punch Productions',
      distribuidor: 'Sony Interactive Entertainment',
      creador: 'Jason Connell',
      fechaLanzamiento: '2022-05-16',
      plataformas: ['PC', 'PlayStation'],
      imagen: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1458140/header.jpg'
    },

    // Roguelike/Roguelite
    {
      nombre: 'The Binding of Isaac: Repentance',
      descripcion: 'Roguelike top-down con elementos religiosos y humor negro.',
      generos: ['Indie', 'Roguelike'],
      desarrollador: 'Nicalis',
      distribuidor: 'Nicalis',
      creador: 'Edmund McMillen',
      fechaLanzamiento: '2021-03-31',
      plataformas: ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch'],
      imagen: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1426300/header.jpg'
    },
    {
      nombre: 'Risk of Rain 2',
      descripcion: 'Roguelike cooperativo en 3D con acción frenética y builds infinitas.',
      generos: ['Indie', 'Roguelike'],
      desarrollador: 'Hopoo Games',
      distribuidor: 'Gearbox Publishing',
      creador: 'Duncan Drummond',
      fechaLanzamiento: '2020-08-11',
      plataformas: ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch'],
      imagen: 'https://cdn.cloudflare.steamstatic.com/steam/apps/632360/header.jpg'
    },
    {
      nombre: 'Dead Cells',
      descripcion: 'Metroidvania roguelike con combate fluido y pixel art espectacular.',
      generos: ['Indie', 'Roguelike'],
      desarrollador: 'Motion Twin',
      distribuidor: 'Motion Twin',
      creador: 'Sébastien Benard',
      fechaLanzamiento: '2018-08-07',
      plataformas: ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch'],
      imagen: 'https://cdn.cloudflare.steamstatic.com/steam/apps/588650/header.jpg'
    },

    // Card Games
    {
      nombre: 'Hearthstone',
      descripcion: 'Juego de cartas coleccionables digital ambientado en el universo Warcraft.',
      generos: ['Cartas', 'Estrategia'],
      desarrollador: 'Blizzard Entertainment',
      distribuidor: 'Blizzard Entertainment',
      creador: 'Ben Brode',
      fechaLanzamiento: '2014-03-11',
      plataformas: ['PC', 'Mobile'],
      imagen: 'https://bnetcmsus-a.akamaihd.net/cms/page_media/QXI0OU2EABPC1665002887154.jpg'
    },
    {
      nombre: 'Slay the Spire',
      descripcion: 'Roguelike de construcción de mazos con estrategia profunda.',
      generos: ['Cartas', 'Roguelike'],
      desarrollador: 'MegaCrit',
      distribuidor: 'MegaCrit',
      creador: 'Anthony Giovannetti',
      fechaLanzamiento: '2019-01-23',
      plataformas: ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch'],
      imagen: 'https://cdn.cloudflare.steamstatic.com/steam/apps/646570/header.jpg'
    },

    // Visual Novel
    {
      nombre: 'Persona 5 Royal',
      descripcion: 'JRPG estilizado sobre estudiantes ladrones que roban corazones corruptos.',
      generos: ['RPG', 'Visual Novel'],
      desarrollador: 'Atlus',
      distribuidor: 'Atlus',
      creador: 'Katsura Hashino',
      fechaLanzamiento: '2022-10-21',
      plataformas: ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch'],
      imagen: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1687950/header.jpg'
    },
    {
      nombre: 'Doki Doki Literature Club Plus',
      descripcion: 'Visual novel que deconstruye el género de manera perturbadora.',
      generos: ['Visual Novel', 'Horror'],
      desarrollador: 'Team Salvato',
      distribuidor: 'Serenity Forge',
      creador: 'Dan Salvato',
      fechaLanzamiento: '2021-06-30',
      plataformas: ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch'],
      imagen: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1388880/header.jpg'
    },

    // Music/Rhythm
    {
      nombre: 'Beat Saber',
      descripcion: 'Juego de ritmo VR donde cortas bloques con sables láser al ritmo de la música.',
      generos: ['Musica', 'VR'],
      desarrollador: 'Beat Games',
      distribuidor: 'Beat Games',
      creador: 'Jaroslav Beck',
      fechaLanzamiento: '2019-05-21',
      plataformas: ['PC', 'PlayStation', 'Oculus'],
      imagen: 'https://cdn.cloudflare.steamstatic.com/steam/apps/620980/header.jpg'
    },
    {
      nombre: 'Guitar Hero Live',
      descripcion: 'Simulador de guitarra con videos de conciertos reales.',
      generos: ['Musica'],
      desarrollador: 'FreeStyleGames',
      distribuidor: 'Activision',
      creador: 'Jamie Jackson',
      fechaLanzamiento: '2015-10-20',
      plataformas: ['PlayStation', 'Xbox'],
      imagen: 'https://www.mobygames.com/images/covers/l/320775-guitar-hero-live-playstation-4-front-cover.jpg'
    },

    // Open World
    {
      nombre: 'Watch Dogs: Legion',
      descripcion: 'Hackea Londres jugando como cualquier NPC en un futuro distópico.',
      generos: ['Aventura', 'FPS'],
      desarrollador: 'Ubisoft Toronto',
      distribuidor: 'Ubisoft',
      creador: 'Clint Hocking',
      fechaLanzamiento: '2020-10-29',
      plataformas: ['PC', 'PlayStation', 'Xbox'],
      imagen: 'https://cdn.cloudflare.steamstatic.com/steam/apps/2239550/header.jpg'
    },
    {
      nombre: 'Far Cry 6',
      descripcion: 'Revolución en isla tropical contra dictador interpretado por Giancarlo Esposito.',
      generos: ['FPS', 'Aventura'],
      desarrollador: 'Ubisoft Toronto',
      distribuidor: 'Ubisoft',
      creador: 'Navid Khavari',
      fechaLanzamiento: '2021-10-07',
      plataformas: ['PC', 'PlayStation', 'Xbox'],
      imagen: 'https://cdn.cloudflare.steamstatic.com/steam/apps/2369390/header.jpg'
    },

    // Continue with more categories and games...
    // Platformers
    {
      nombre: 'Crash Bandicoot 4: It\'s About Time',
      descripcion: 'Regreso del marsupial naranja con plataformeo clásico y nuevas mecánicas.',
      generos: ['Plataformas'],
      desarrollador: 'Toys for Bob',
      distribuidor: 'Activision',
      creador: 'Paul Yan',
      fechaLanzamiento: '2021-03-26',
      plataformas: ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch'],
      imagen: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1030300/header.jpg'
    },
    {
      nombre: 'Rayman Legends',
      descripcion: 'Plataformero 2D con arte único y niveles musicales creativos.',
      generos: ['Plataformas'],
      desarrollador: 'Ubisoft Montpellier',
      distribuidor: 'Ubisoft',
      creador: 'Michel Ancel',
      fechaLanzamiento: '2013-09-03',
      plataformas: ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch'],
      imagen: 'https://cdn.cloudflare.steamstatic.com/steam/apps/242550/header.jpg'
    },

    // Sandbox
    {
      nombre: 'Terraria',
      descripcion: 'Sandbox 2D con exploración, construcción y combate contra jefes épicos.',
      generos: ['Sandbox', 'Indie'],
      desarrollador: 'Re-Logic',
      distribuidor: 'Re-Logic',
      creador: 'Andrew Spinks',
      fechaLanzamiento: '2011-05-16',
      plataformas: ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch', 'Mobile'],
      imagen: 'https://cdn.cloudflare.steamstatic.com/steam/apps/105600/header.jpg'
    },
    {
      nombre: 'Garry\'s Mod',
      descripcion: 'Sandbox físico donde puedes crear cualquier cosa que imagines.',
      generos: ['Sandbox'],
      desarrollador: 'Facepunch Studios',
      distribuidor: 'Valve',
      creador: 'Garry Newman',
      fechaLanzamiento: '2006-11-29',
      plataformas: ['PC'],
      imagen: 'https://cdn.cloudflare.steamstatic.com/steam/apps/4000/header.jpg'
    },

    // Educational
    {
      nombre: 'Kerbal Space Program',
      descripcion: 'Simulación espacial donde diseñas cohetes y exploras el sistema solar.',
      generos: ['Simulacion', 'Educativo'],
      desarrollador: 'Squad',
      distribuidor: 'Private Division',
      creador: 'Felipe Falanghe',
      fechaLanzamiento: '2015-04-27',
      plataformas: ['PC', 'PlayStation', 'Xbox'],
      imagen: 'https://cdn.cloudflare.steamstatic.com/steam/apps/220200/header.jpg'
    },

    // Battle Royale specific
    {
      nombre: 'PUBG: BATTLEGROUNDS',
      descripcion: 'El battle royale original que definió el género.',
      generos: ['FPS', 'Battle Royale'],
      desarrollador: 'PUBG Corporation',
      distribuidor: 'PUBG Corporation',
      creador: 'Brendan Greene',
      fechaLanzamiento: '2017-12-20',
      plataformas: ['PC', 'PlayStation', 'Xbox', 'Mobile'],
      imagen: 'https://cdn.cloudflare.steamstatic.com/steam/apps/578080/header.jpg'
    },
    {
      nombre: 'Fall Guys',
      descripcion: 'Battle royale de party games con personajes adorables.',
      generos: ['Battle Royale', 'Party'],
      desarrollador: 'Mediatonic',
      distribuidor: 'Epic Games',
      creador: 'Joe Walsh',
      fechaLanzamiento: '2020-08-04',
      plataformas: ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch'],
      imagen: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1097150/header.jpg'
    }

    // Continue adding more to reach 200+...
  ];

  return moreGames;
};

const allRealGames = [...realGamesData, ...generateMoreRealGames()];

// Agregar valoraciones aleatorias
allRealGames.forEach((game) => {
  game.valoraciones = {
    loRecomiendo: Math.floor(Math.random() * 2000) + 500,
    noLoRecomiendo: Math.floor(Math.random() * 800) + 100,
    meh: Math.floor(Math.random() * 400) + 50
  };
});

const populateRealGames = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vgz_gaming_db');
    console.log('Conectado a MongoDB');

    // Limpiar la colección existente
    await Videojuego.deleteMany({});
    console.log('Colección de videojuegos limpiada');

    // Insertar todos los juegos reales
    await Videojuego.insertMany(allRealGames);
    console.log(`${allRealGames.length} videojuegos reales insertados exitosamente`);

    console.log('Base de datos poblada con juegos reales exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('Error poblando la base de datos:', error);
    process.exit(1);
  }
};

populateRealGames();