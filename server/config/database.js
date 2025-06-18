const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Verificar que la URI existe
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      console.log('MONGODB_URI no definida, usando URI por defecto');
      const defaultURI = 'mongodb://localhost:27017/vgz_gaming_db';
      
      const conn = await mongoose.connect(defaultURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      
      console.log(`MongoDB conectado: ${conn.connection.host}`);
      return;
    }
    
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB conectado: ${conn.connection.host}`);
  } catch (error) {
    console.error('Error conectando a MongoDB:', error.message);
    console.log('Continuando sin conexión a la base de datos...');
  }
};

const setupIndexes = async () => {
  try {
    // Índices de texto para búsquedas
    await mongoose.connection.db.collection('videojuegos').createIndex({
      nombre: 'text',
      descripcion: 'text',
      desarrollador: 'text'
    });
    
    await mongoose.connection.db.collection('posts').createIndex({
      contenido: 'text'
    });
    
    console.log('Índices de búsqueda configurados correctamente');
  } catch (error) {
    console.error('Error configurando índices:', error.message);
  }
};

module.exports = connectDB;
