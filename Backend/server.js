// const express = require('express');
// const cors = require('cors');
// const dotenv = require('dotenv');
// const connectDB = require('./config/db');
// const mongoose = require('mongoose'); 
// const authRoutes = require('./routes/auth');
// const adminRoutes = require('./routes/admin');

// // Load environment variables
// dotenv.config();

// // Connect to database
// connectDB();

// const app = express();

// // Middleware
// app.use(cors({
//   origin: process.env.FRONTEND_URL || 'http://localhost:3000',
//   credentials: true
// }));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Routes
// app.use('/api/auth', require('./routes/auth'));
// app.use('/api/admin', adminRoutes); 
// // Error handling middleware
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({ 
//     message: 'Erreur serveur interne',
//     error: process.env.NODE_ENV === 'development' ? err.message : {}
//   });
// });

// // 404 handler
// app.use('*', (req, res) => {
//   res.status(404).json({ message: 'Route non trouvée' });
// });

// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//   console.log(`Serveur démarré sur le port ${PORT}`);
// });




// // server.js (Version mise à jour avec notifications)
// const express = require('express');
// const http = require('http');
// const cors = require('cors');
// const dotenv = require('dotenv');
// const connectDB = require('./config/db');
// const mongoose = require('mongoose');
// const path = require('path');
// const SocketServer = require('./websocket/socketServer');
// // const notificationController = require('./controllers/notificationController');
// const cron = require('node-cron'); // npm install node-cron
// // const { sendInterviewReminders } = require('./hooks/notificationHooks');

// // Load environment variables
// dotenv.config();

// // Connect to database
// connectDB();

// const app = express();
// const server = http.createServer(app);

// // Initialize WebSocket server
// const socketServer = new SocketServer(server);
// app.set('socketServer', socketServer);

// // Initialize notification controller with WebSocket
// // notificationController.initialize(socketServer);

// // Start WebSocket heartbeat
// socketServer.startHeartbeat();

// // Middleware
// app.use(cors({
//   origin: process.env.FRONTEND_URL || 'http://localhost:3000',
//   credentials: true
// }));

// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// // Servir les fichiers statiques (pour les uploads)
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // Routes existantes
// app.use('/api/auth', require('./routes/auth'));
// app.use('/api/admin', require('./routes/admin'));
// app.use('/api/jobs', require('./routes/jobs'));
// app.use('/api/applications', require('./routes/applications'));
// app.use('/api/messages', require('./routes/messages'));

// // NOUVELLE ROUTE POUR LES NOTIFICATIONS
// // app.use('/api/notifications', require('./routes/notifications'));

// // Route pour obtenir les statistiques WebSocket
// app.get('/api/websocket/stats', (req, res) => {
//   const stats = socketServer.getConnectionStats();
//   res.json({
//     ...stats,
//     connectedUsers: socketServer.getConnectedUsers()
//   });
// });

// // // Route pour tester les notifications (développement uniquement)
// // if (process.env.NODE_ENV !== 'production') {
// //   app.post('/api/test/notification', async (req, res) => {
// //     try {
// //       const { userId, type = 'system', title = 'Test', message = 'Message de test' } = req.body;
      
// //       if (!userId) {
// //         return res.status(400).json({ error: 'userId requis' });
// //       }

// //       // Envoyer une notification de test
// //       socketServer.sendNotificationToUser(userId, {
// //         type: 'new_notification',
// //         notification: {
// //           _id: new mongoose.Types.ObjectId(),
// //           type,
// //           title,
// //           message,
// //           read: false,
// //           createdAt: new Date(),
// //           category: 'info',
// //           priority: 'normal'
// //         }
// //       });

// //       res.json({ success: true, message: 'Notification de test envoyée' });
// //     } catch (error) {
// //       console.error('Erreur test notification:', error);
// //       res.status(500).json({ error: error.message });
// //     }
// //   });

// //   app.get('/api/test/connected-users', (req, res) => {
// //     res.json({
// //       connectedUsers: socketServer.getConnectedUsers(),
// //       stats: socketServer.getConnectionStats()
// //     });
// //   });
// // }

// // TÂCHES PROGRAMMÉES (CRON JOBS)

// // Vérifier les rappels d'entretien toutes les heures
// cron.schedule('0 * * * *', async () => {
//   console.log('🕐 Vérification des rappels d\'entretien...');
//   try {
//     await sendInterviewReminders(app);
//   } catch (error) {
//     console.error('❌ Erreur lors de l\'envoi des rappels:', error);
//   }
// });

// // Nettoyer les anciennes notifications tous les jours à 2h du matin
// cron.schedule('0 2 * * *', async () => {
//   console.log('🧹 Nettoyage des anciennes notifications...');
//   try {
//     const NotificationService = require('./services/notificationService');
//     const notificationService = new NotificationService();
//     await notificationService.cleanupOldNotifications(30); // 30 jours
//   } catch (error) {
//     console.error('❌ Erreur lors du nettoyage:', error);
//   }
// });

// // Vérifier les jobs qui vont expirer (tous les jours à 9h)
// cron.schedule('0 9 * * *', async () => {
//   console.log('📅 Vérification des jobs qui vont expirer...');
//   try {
//     const Job = require('./models/job');
//     const { beforeJobExpires } = require('./hooks/notificationHooks');
    
//     // Trouver les jobs qui expirent dans 7 jours
//     const sevenDaysFromNow = new Date();
//     sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    
//     const expiringJobs = await Job.find({
//       expiryDate: { $lte: sevenDaysFromNow, $gte: new Date() },
//       isActive: true
//     }).populate('recruiter');

//     for (const job of expiringJobs) {
//       const daysUntilExpiry = Math.ceil((new Date(job.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
//       await beforeJobExpires(job, daysUntilExpiry, { app });
//     }
    
//     console.log(`📊 ${expiringJobs.length} notifications d'expiration envoyées`);
//   } catch (error) {
//     console.error('❌ Erreur vérification expiration jobs:', error);
//   }
// });

// // Statistiques des notifications (tous les jours à minuit)
// cron.schedule('0 0 * * *', async () => {
//   console.log('📊 Génération des statistiques de notifications...');
//   try {
//     const Notification = require('./models/notification');
    
//     const stats = await Notification.aggregate([
//       {
//         $match: {
//           createdAt: {
//             $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Dernières 24h
//           }
//         }
//       },
//       {
//         $group: {
//           _id: '$type',
//           count: { $sum: 1 },
//           readCount: {
//             $sum: { $cond: [{ $eq: ['$read', true] }, 1, 0] }
//           }
//         }
//       }
//     ]);
    
//     console.log('📈 Statistiques notifications 24h:', stats);
//   } catch (error) {
//     console.error('❌ Erreur génération statistiques:', error);
//   }
// });

// // Middleware de gestion d'erreurs
// app.use((err, req, res, next) => {
//   console.error('❌ Erreur serveur:', err.stack);
  
//   // Erreurs de validation
//   if (err.name === 'ValidationError') {
//     return res.status(400).json({
//       success: false,
//       message: 'Erreur de validation',
//       errors: Object.values(err.errors).map(e => e.message)
//     });
//   }
  
//   // Erreurs de cast (ID invalide)
//   if (err.name === 'CastError') {
//     return res.status(400).json({
//       success: false,
//       message: 'ID invalide'
//     });
//   }
  
//   // Erreurs de duplication
//   if (err.code === 11000) {
//     return res.status(400).json({
//       success: false,
//       message: 'Données dupliquées'
//     });
//   }
  
//   // Erreur générique
//   res.status(500).json({
//     success: false,
//     message: 'Erreur serveur interne',
//     error: process.env.NODE_ENV === 'development' ? err.message : {}
//   });
// });

// // 404 handler
// app.use('*', (req, res) => {
//   res.status(404).json({ 
//     success: false,
//     message: 'Route non trouvée' 
//   });
// });

// const PORT = process.env.PORT || 5000;

// server.listen(PORT, () => {
//   console.log(`🚀 Serveur démarré sur le port ${PORT}`);
//   console.log(`🔌 WebSocket server activé sur ws://localhost:${PORT}`);
//   console.log(`🔔 Système de notifications activé`);
//   console.log(`⏰ Tâches programmées activées`);
  
//   if (process.env.NODE_ENV !== 'production') {
//     console.log(`🧪 Mode développement - endpoints de test disponibles`);
//   }
// });

// // Gestion propre de l'arrêt du serveur
// process.on('SIGTERM', () => {
//   console.log('🛑 Signal SIGTERM reçu, arrêt en cours...');
//   server.close(() => {
//     console.log('✅ Serveur arrêté proprement');
//     process.exit(0);
//   });
// });

// process.on('SIGINT', () => {
//   console.log('🛑 Signal SIGINT reçu, arrêt en cours...');
//   server.close(() => {
//     console.log('✅ Serveur arrêté proprement');
//     process.exit(0);
//   });
// });

// // Gestion des erreurs non capturées
// process.on('unhandledRejection', (err, promise) => {
//   console.error('❌ Promesse rejetée non gérée:', err);
//   server.close(() => {
//     process.exit(1);
//   });
// });

// process.on('uncaughtException', (err) => {
//   console.error('❌ Exception non capturée:', err);
//   server.close(() => {
//     process.exit(1);
//   });
// });

// module.exports = { app, server, socketServer };





// const express = require('express');
// const cors = require('cors');
// const dotenv = require('dotenv');
// const connectDB = require('./config/db');
// const mongoose = require('mongoose');
// const path = require('path');

// const authRoutes = require('./routes/auth');
// const adminRoutes = require('./routes/admin');
// const jobRoutes = require('./routes/jobs');
// const applicationRoutes = require('./routes/applications'); // Nouvelle route

// // Load environment variables
// dotenv.config();

// // Connect to database
// connectDB();

// const app = express();

// // Middleware
// app.use(cors({
//   origin: process.env.FRONTEND_URL || 'http://localhost:3000',
//   credentials: true
// }));
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// // Serveur les fichiers statiques (pour les uploads)
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // Routes
// app.use('/api/auth', require('./routes/auth'));
// app.use('/api/admin', adminRoutes);
// app.use('/api/jobs', jobRoutes);
// app.use('/api/applications', applicationRoutes); // Nouvelle route pour les candidatures

// // Error handling middleware
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({
//     message: 'Erreur serveur interne',
//     error: process.env.NODE_ENV === 'development' ? err.message : {}
//   });
// });

// // 404 handler
// app.use('*', (req, res) => {
//   res.status(404).json({ message: 'Route non trouvée' });
// });

// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//   console.log(`Serveur démarré sur le port ${PORT}`);
// });



// const express = require('express');
// const cors = require('cors');
// const dotenv = require('dotenv');
// const connectDB = require('./config/db');
// const mongoose = require('mongoose');
// const path = require('path');

// const authRoutes = require('./routes/auth');
// const adminRoutes = require('./routes/admin');
// const jobRoutes = require('./routes/jobs');
// const applicationRoutes = require('./routes/applications');
// const messageRoutes = require('./routes/messages'); // Nouvelle route

// // Load environment variables
// dotenv.config();

// // Connect to database
// connectDB();

// const app = express();

// // Middleware
// app.use(cors({
//   origin: process.env.FRONTEND_URL || 'http://localhost:3000',
//   credentials: true
// }));
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// // Serveur les fichiers statiques (pour les uploads)
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // Routes
// app.use('/api/auth', require('./routes/auth'));
// app.use('/api/admin', adminRoutes);
// app.use('/api/jobs', jobRoutes);
// app.use('/api/applications', applicationRoutes);
// app.use('/api/messages', messageRoutes); // Nouvelle route pour les messages

// // Error handling middleware
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({
//     message: 'Erreur serveur interne',
//     error: process.env.NODE_ENV === 'development' ? err.message : {}
//   });
// });

// // 404 handler
// app.use('*', (req, res) => {
//   res.status(404).json({ message: 'Route non trouvée' });
// });

// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//   console.log(`Serveur démarré sur le port ${PORT}`);
// });


// server.js (Version mise à jour avec WebSocket)
const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const mongoose = require('mongoose');
const path = require('path');
const SocketServer = require('./websocket/socketServer');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);

// Initialize WebSocket server
const socketServer = new SocketServer(server);
app.set('socketServer', socketServer);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir les fichiers statiques (pour les uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/messages', require('./routes/messages'));

// Route pour obtenir les statistiques WebSocket (optionnel)
app.get('/api/websocket/stats', (req, res) => {
  res.json({
    connectedUsers: socketServer.getConnectedUsersCount(),
    connectedUserIds: socketServer.getConnectedUserIds()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Erreur serveur interne',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route non trouvée' });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
  console.log(`WebSocket server activé sur ws://localhost:${PORT}`);
});




