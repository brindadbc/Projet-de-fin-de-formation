const mongoose = require('mongoose');

const connectDB= async() => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI,{
          useNewUrlParser: true,
          useUnifiedTopology: true,
        });
       console.log(`MongoDB connected: ${conn.connection.host}`);
    } catch (error) {
      console.error("Database connection Error:", error);
      process.exit(1);  
    }
};

module.exports= connectDB;


// const mongoose = require('mongoose');

// const connectDB = async () => {
//   try {
//     // Activer le debugging de Mongoose
//     mongoose.set('debug', true);
    
//     const conn = await mongoose.connect(process.env.MONGO_URI, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//       serverSelectionTimeoutMS: 5000, // 5 secondes timeout
//       socketTimeoutMS: 45000, // 45 secondes timeout
//       maxPoolSize: 10, // Nombre max de connexions
//       retryWrites: true,
//       w: 'majority'
//     });

//     console.log(`✅ MongoDB connecté: ${conn.connection.host}`);
//     console.log('📊 Stats base de données:');
//     console.log('- Nom base:', conn.connection.name);
//     console.log('- Collections:', (await conn.connection.db.listCollections().toArray()).map(c => c.name));
    
//     // Vérification des indexes
//     const collections = ['applications', 'jobs', 'users'];
//     for (const col of collections) {
//       if (conn.connection.collections[col]) {
//         const indexes = await conn.connection.collections[col].indexes();
//         console.log(`🔍 Indexes pour ${col}:`, indexes.map(i => i.name));
//       }
//     }

//   } catch (error) {
//     console.error('💥 ERREUR Connexion DB:', {
//       message: error.message,
//       stack: error.stack,
//       fullError: JSON.stringify(error, null, 2)
//     });
    
//     // Tentative de reconnexion automatique
//     setTimeout(connectDB, 5000);
//   }
// };

// // Gestion des événements de connexion
// mongoose.connection.on('connected', () => {
//   console.log('🟢 Mongoose connecté');
// });

// mongoose.connection.on('error', (err) => {
//   console.error('🔴 Erreur Mongoose:', err);
// });

// mongoose.connection.on('disconnected', () => {
//   console.log('🟡 Mongoose déconnecté');
// });

// // Gestion propre de la fermeture
// process.on('SIGINT', async () => {
//   await mongoose.connection.close();
//   console.log('Mongoose déconnecté via app termination');
//   process.exit(0);
// });

// module.exports = connectDB;