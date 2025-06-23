const mongoose = require('mongoose');
const { Post, Usuario, Videojuego } = require('../models');
require('dotenv').config();

const postContents = [
  "¡Acabo de terminar este juego y me ha encantado! Una experiencia increíble 🎮",
  "Después de 50 horas jugando, finalmente completé todos los logros 🏆",
  "Los gráficos de este juego son impresionantes, especialmente en PC",
  "¿Alguien más está jugando esto? Necesito compañeros para el modo cooperativo",
  "Este boss me está dando muchos problemas... ¿algún consejo? 😅",
  "La historia de este juego me tiene completamente enganchado",
  "¡Nuevo récord personal en speedrun! 🚀",
  "Este juego indie merece mucho más reconocimiento",
  "¿Vale la pena comprarlo en oferta? He oído cosas mixtas",
  "La banda sonora de este juego es obra de arte 🎵",
  "¡Por fin salió la actualización que estábamos esperando!",
  "Este juego me recuerda mucho a los clásicos de mi infancia",
  "El multijugador está un poco roto, esperemos que lo arreglen pronto",
  "¿Cuál es la mejor build para este personaje?",
  "Este juego me ha hecho llorar... qué historia tan emotiva 😢",
  "¡Stream en vivo ahora mismo! Vengan a verme jugar",
  "Este DLC añade mucho contenido nuevo, totalmente recomendado",
  "Los controles en consola se sienten mucho mejor que en PC",
  "¿Hay algún easter egg que me haya perdido?",
  "La comunidad de este juego es súper tóxica últimamente",
  "¡Finalmente llegué al nivel máximo! Ha sido un viaje increíble",
  "Este juego está en Game Pass, perfecta oportunidad para probarlo",
  "Los bugs de lanzamiento ya están arreglados, ahora sí vale la pena",
  "¿Mejor en single player o multijugador?",
  "Este mod cambia completamente la experiencia del juego"
];

const gameSpecificPosts = {
  // Posts específicos para diferentes tipos de juegos
  fps: [
    "¡Acabo de conseguir mi primera victoria en {game}! Los nervios del final estaban a tope 🎯",
    "La nueva temporada de {game} está increíble, las armas están muy balanceadas",
    "¿Alguien más piensa que {game} necesita un nerf a esa arma? Es demasiado OP",
    "Llevo 200 horas en {game} y sigo siendo un noob, pero me divierte mucho 😅",
    "El nuevo mapa de {game} es una obra de arte, los detalles son impresionantes",
    "¿Tips para mejorar la puntería en {game}? Estoy estancado en mi rango actual",
    "¡Clutch 1v5 en {game}! Mis manos temblaban, pero lo logré 🔥"
  ],
  rpg: [
    "Después de 100 horas en {game}, finalmente completé la historia principal. Qué viaje tan increíble",
    "La cantidad de opciones de personalización en {game} es abrumadora, llevo 2 horas creando mi personaje",
    "¿Cuál es la mejor build para {game}? Estoy perdido con tantas opciones",
    "La historia de {game} me hizo llorar. No esperaba esos plot twists 😭",
    "Los side quests en {game} son mejores que la historia principal de muchos otros juegos",
    "¿Vale la pena hacer New Game+ en {game}? ¿Qué cambia exactamente?",
    "La banda sonora de {game} es perfecta, la escucho incluso cuando no juego"
  ],
  horror: [
    "No puedo jugar {game} de noche, me da demasiado miedo. ¿Soy el único? 👻",
    "Jugué {game} con auriculares y casi tiro el control cuando apareció ese jumpscare",
    "La atmósfera de {game} es perfecta, cada sonido me pone nervioso",
    "¿Cómo hacen algunos streamers para no asustarse jugando {game}? Yo grito cada 5 minutos",
    "{game} logra ser aterrador sin depender solo de jumpscares, eso es talento"
  ],
  estrategia: [
    "Mi civilización en {game} acaba de descubrir la pólvora. ¡A conquistar el mundo! ⚔️",
    "Llevo 8 horas seguidas jugando {game} y apenas es el año 1200. ¡Una partida más!",
    "La IA en {game} es muy inteligente, siempre me sorprende con sus estrategias",
    "¿Cuál es vuestra estrategia favorita en {game}? Yo siempre voy por la victoria científica"
  ],
  racing: [
    "¡Nuevo récord personal en {game}! Bajé mi tiempo por 0.2 segundos 🏁",
    "Los gráficos de {game} son tan realistas que siento que estoy conduciendo de verdad",
    "¿Cuál es vuestro coche favorito en {game}? Yo no puedo parar de usar el McLaren",
    "La física de conducción en {game} es perfecta, cada coche se siente único"
  ],
  simulacion: [
    "Mi ciudad en {game} acaba de llegar a 100.000 habitantes. ¡Estoy tan orgulloso! 🏙️",
    "Llevo construyendo mi base en {game} durante días y aún no estoy satisfecho",
    "La atención al detalle en {game} es increíble, cada elemento tiene su propósito"
  ],
  indie: [
    "¿Cómo es posible que {game} me emocione más que juegos AAA de 100 millones de presupuesto?",
    "El arte pixelado de {game} es hermoso, cada frame parece una obra de arte",
    "Apoyemos a los desarrolladores indie comprando {game}, estos juegos necesitan amor ❤️"
  ],
  deportes: [
    "¡Gané la Champions con mi equipo favorito en {game}! Después de 5 temporadas 🏆",
    "Los nuevos movimientos en {game} están geniales, se siente más fluido que nunca",
    "¿Cuál es vuestra formación favorita en {game}? Yo siempre uso 4-3-3"
  ]
};

const generalPostContents = [
  "¿Vale la pena {game} en 2024? He oído opiniones mixtas",
  "Acabo de terminar {game} y necesito algo similar. ¿Recomendaciones?",
  "El soundtrack de {game} es simplemente perfecto para concentrarse",
  "¿En qué plataforma recomiendan jugar {game}? PC vs consola",
  "Los mods de {game} han extendido mi experiencia por cientos de horas",
  "Recuerdo cuando salió {game}, que nostalgia. ¿Alguien más lo jugó en el lanzamiento?",
  "La comunidad de {game} es una de las mejores que he conocido",
  "¿{game} merece el Game of the Year? Voto que sí 🏆",
  "Me he viciado tanto a {game} que sueño con él 😴",
  "Los gráficos de {game} son impresionantes, especialmente en PC",
  "¿Alguien más está jugando {game}? Necesito compañeros para el modo cooperativo",
  "Este boss en {game} me está dando muchos problemas... ¿algún consejo? 😅"
];

const commentContents = [
  "¡Totalmente de acuerdo! {game} es increíble",
  "No estoy seguro, a mí {game} no me convenció tanto",
  "¿En qué plataforma lo jugaste?",
  "Yo tuve la misma experiencia con {game}",
  "¿Cuántas horas le has dedicado a {game}?",
  "Necesito empezar {game} ya, todos hablan maravillas",
  "La comunidad de {game} es muy acogedora",
  "¿Ya probaste el último update de {game}?",
  "Me pasa igual con {game}, es muy adictivo",
  "¿Algún tip para principiantes en {game}?",
  "Excelente review, me ayudó mucho",
  "A mí me pasó lo mismo",
  "¿Hay modo cooperativo?",
  "El precio está muy alto todavía",
  "Mejor esperar a que baje de precio",
  "¡Añádeme para jugar juntos!",
  "La música es lo mejor del juego"
];

const populatePosts = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vgz_gaming_db');
    console.log('Conectado a MongoDB');

    // Obtener usuarios y videojuegos existentes
    const usuarios = await Usuario.find({});
    const videojuegos = await Videojuego.find({});

    if (usuarios.length === 0 || videojuegos.length === 0) {
      console.error('Necesitas tener usuarios y videojuegos en la base de datos primero');
      process.exit(1);
    }

    // Limpiar posts existentes
    await Post.deleteMany({});
    console.log('Colección de posts limpiada');

    const posts = [];
    const valoraciones = ['lo_recomiendo', 'no_lo_recomiendo', 'meh', null];

    // Generar posts específicos para cada juego
    for (const videojuego of videojuegos) {
      const numPostsForGame = Math.floor(Math.random() * 4) + 1; // 1-4 posts por juego
      
      for (let i = 0; i < numPostsForGame; i++) {
        const randomUser = usuarios[Math.floor(Math.random() * usuarios.length)];
        
        // Seleccionar contenido basado en géneros del juego
        let selectedPosts = generalPostContents;
        
        if (videojuego.generos.some(g => ['FPS'].includes(g))) {
          selectedPosts = [...gameSpecificPosts.fps, ...generalPostContents];
        } else if (videojuego.generos.some(g => ['RPG'].includes(g))) {
          selectedPosts = [...gameSpecificPosts.rpg, ...generalPostContents];
        } else if (videojuego.generos.some(g => ['Horror'].includes(g))) {
          selectedPosts = [...gameSpecificPosts.horror, ...generalPostContents];
        } else if (videojuego.generos.some(g => ['Estrategia'].includes(g))) {
          selectedPosts = [...gameSpecificPosts.estrategia, ...generalPostContents];
        } else if (videojuego.generos.some(g => ['Racing'].includes(g))) {
          selectedPosts = [...gameSpecificPosts.racing, ...generalPostContents];
        } else if (videojuego.generos.some(g => ['Simulacion'].includes(g))) {
          selectedPosts = [...gameSpecificPosts.simulacion, ...generalPostContents];
        } else if (videojuego.generos.some(g => ['Indie'].includes(g))) {
          selectedPosts = [...gameSpecificPosts.indie, ...generalPostContents];
        } else if (videojuego.generos.some(g => ['Deportes'].includes(g))) {
          selectedPosts = [...gameSpecificPosts.deportes, ...generalPostContents];
        }

        const randomContent = selectedPosts[Math.floor(Math.random() * selectedPosts.length)];
        const contenido = randomContent.replace(/{game}/g, videojuego.nombre);
        
        const randomRating = Math.random() < 0.6 ? valoraciones[Math.floor(Math.random() * valoraciones.length)] : null;

        // Generar fecha aleatoria en los últimos 4 meses
        const now = new Date();
        const fourMonthsAgo = new Date(now.getTime() - (4 * 30 * 24 * 60 * 60 * 1000));
        const randomDate = new Date(fourMonthsAgo.getTime() + Math.random() * (now.getTime() - fourMonthsAgo.getTime()));

        const post = {
          autor: randomUser._id,
          contenido: contenido,
          videojuego: videojuego._id,
          esPublico: Math.random() < 0.95, // 95% públicos
          valoracionJuego: randomRating,
          likes: [],
          createdAt: randomDate,
          updatedAt: randomDate
        };

        // Agregar likes aleatorios (más probabilidad de likes en posts más antiguos)
        const daysSincePost = (now - randomDate) / (1000 * 60 * 60 * 24);
        const maxLikes = Math.min(Math.floor(daysSincePost * 0.5) + Math.floor(Math.random() * 25), usuarios.length);
        const numLikes = Math.floor(Math.random() * maxLikes);
        
        const likedUsers = new Set();
        for (let j = 0; j < numLikes; j++) {
          const randomLiker = usuarios[Math.floor(Math.random() * usuarios.length)];
          if (!likedUsers.has(randomLiker._id.toString())) {
            likedUsers.add(randomLiker._id.toString());
            post.likes.push({
              usuario: randomLiker._id,
              fecha: new Date(randomDate.getTime() + Math.random() * (now.getTime() - randomDate.getTime()))
            });
          }
        }

        posts.push(post);
      }
    }

    // Insertar posts
    const insertedPosts = await Post.insertMany(posts);
    console.log(`${insertedPosts.length} posts insertados`);

    // Generar comentarios para 40% de los posts
    const numComments = Math.floor(insertedPosts.length * 0.4);
    const comments = [];
    
    for (let i = 0; i < numComments; i++) {
      const randomPost = insertedPosts[Math.floor(Math.random() * insertedPosts.length)];
      const randomUser = usuarios[Math.floor(Math.random() * usuarios.length)];
      const gameFromPost = await Videojuego.findById(randomPost.videojuego);
      
      const randomCommentTemplate = commentContents[Math.floor(Math.random() * commentContents.length)];
      const commentContent = randomCommentTemplate.replace(/{game}/g, gameFromPost.nombre);

      const commentDate = new Date(randomPost.createdAt.getTime() + Math.random() * (Date.now() - randomPost.createdAt.getTime()));

      const comment = {
        autor: randomUser._id,
        contenido: commentContent,
        videojuego: randomPost.videojuego,
        esPublico: randomPost.esPublico,
        esComentario: true,
        postPadre: randomPost._id,
        likes: [],
        createdAt: commentDate,
        updatedAt: commentDate
      };

      // Likes aleatorios en comentarios (menos que en posts)
      const numCommentLikes = Math.floor(Math.random() * 10);
      const commentLikedUsers = new Set();
      for (let j = 0; j < numCommentLikes; j++) {
        const randomLiker = usuarios[Math.floor(Math.random() * usuarios.length)];
        if (!commentLikedUsers.has(randomLiker._id.toString())) {
          commentLikedUsers.add(randomLiker._id.toString());
          comment.likes.push({
            usuario: randomLiker._id,
            fecha: new Date(commentDate.getTime() + Math.random() * (Date.now() - commentDate.getTime()))
          });
        }
      }

      comments.push(comment);
    }

    // Insertar comentarios
    const insertedComments = await Post.insertMany(comments);
    console.log(`${insertedComments.length} comentarios insertados`);

    // Actualizar posts padre con referencias a comentarios
    for (const comment of insertedComments) {
      await Post.findByIdAndUpdate(comment.postPadre, {
        $push: { comentarios: comment._id }
      });
    }

    console.log('Referencias de comentarios actualizadas');
    console.log(`Total posts: ${insertedPosts.length}, Total comentarios: ${insertedComments.length}`);
    console.log('Base de datos de posts poblada exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('Error poblando la base de datos de posts:', error);
    process.exit(1);
  }
};

populatePosts();
