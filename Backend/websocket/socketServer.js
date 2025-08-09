// websocket/socketServer.js
const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

class SocketServer {
  constructor(server) {
    this.wss = new WebSocket.Server({ 
      server,
      verifyClient: this.verifyClient.bind(this)
    });
    
    this.clients = new Map(); // userId -> Set of WebSocket connections
    this.setupEventHandlers();
  }

  // Vérifier l'authentification du client WebSocket
  async verifyClient(info) {
    try {
      const url = new URL(info.req.url, 'ws://localhost');
      const token = url.searchParams.get('token');
      
      if (!token) {
        console.log('Aucun token fourni pour la connexion WebSocket');
        return false;
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      
      if (!user) {
        console.log('Utilisateur non trouvé pour le token:', decoded.id);
        return false;
      }

      // Stocker les informations utilisateur dans la requête
      info.req.user = user;
      console.log('Authentification WebSocket réussie pour:', user.email || user._id);
      return true;
    } catch (error) {
      console.error('Erreur de vérification WebSocket:', error.message);
      return false;
    }
  }

  setupEventHandlers() {
    this.wss.on('connection', (ws, req) => {
      const user = req.user;
      
      // Vérification de sécurité supplémentaire
      if (!user) {
        console.error('Utilisateur non défini lors de la connexion WebSocket');
        ws.close(1008, 'Utilisateur non authentifié');
        return;
      }

      // Utiliser une propriété qui existe certainement (email ou _id)
      const userName = user.name || user.email || user._id.toString();
      console.log(`Utilisateur ${userName} connecté via WebSocket`);

      // Ajouter le client à la map
      const userIdStr = user._id.toString();
      if (!this.clients.has(userIdStr)) {
        this.clients.set(userIdStr, new Set());
      }
      this.clients.get(userIdStr).add(ws);

      // Marquer l'utilisateur comme en ligne
      this.setUserOnlineStatus(user._id, true);

      // Gérer les messages du client
      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data);
          this.handleClientMessage(user._id, message);
        } catch (error) {
          console.error('Erreur parsing message WebSocket:', error);
        }
      });

      // Gérer la déconnexion
      ws.on('close', () => {
        console.log(`Utilisateur ${userName} déconnecté`);
        this.removeClient(userIdStr, ws);
        
        // Si c'était la dernière connexion, marquer comme hors ligne
        if (!this.clients.has(userIdStr) || 
            this.clients.get(userIdStr).size === 0) {
          this.setUserOnlineStatus(user._id, false);
        }
      });

      // Gérer les erreurs WebSocket
      ws.on('error', (error) => {
        console.error(`Erreur WebSocket pour ${userName}:`, error);
      });

      // Envoyer confirmation de connexion
      ws.send(JSON.stringify({
        type: 'connection_established',
        userId: user._id,
        timestamp: new Date()
      }));
    });
  }

  // Gérer les messages du client
  async handleClientMessage(userId, message) {
    switch (message.type) {
      case 'ping':
        this.sendToUser(userId, { type: 'pong', timestamp: new Date() });
        break;

      case 'typing_start':
        if (message.conversationId) {
          await this.broadcastToConversation(message.conversationId, userId, {
            type: 'user_typing',
            userId: userId,
            conversationId: message.conversationId,
            timestamp: new Date()
          });
        }
        break;

      case 'typing_stop':
        if (message.conversationId) {
          await this.broadcastToConversation(message.conversationId, userId, {
            type: 'user_stopped_typing',
            userId: userId,
            conversationId: message.conversationId,
            timestamp: new Date()
          });
        }
        break;

      case 'mark_messages_read':
        if (message.conversationId && message.messageIds) {
          await this.handleMarkMessagesRead(userId, message.conversationId, message.messageIds);
        }
        break;

      case 'messages_received':
        if (message.conversationId && message.messageIds) {
          await this.handleMessagesReceived(userId, message.conversationId, message.messageIds);
        }
        break;

      default:
        console.log('Type de message WebSocket non géré:', message.type);
    }
  }

  // Gérer le marquage des messages comme lus
  async handleMarkMessagesRead(userId, conversationId, messageIds) {
    try {
      // Mettre à jour les messages en base de données
      await Message.updateMany(
        { 
          _id: { $in: messageIds }, 
          conversation: conversationId,
          sender: { $ne: userId } // Ne pas marquer ses propres messages
        },
        {
          $addToSet: {
            readBy: {
              user: userId,
              readAt: new Date()
            }
          }
        }
      );

      // Récupérer la conversation pour obtenir les participants
      const conversation = await Conversation.findById(conversationId).populate('participants');
      if (!conversation) return;

      // Notifier tous les autres participants que ces messages ont été lus
      const notification = {
        type: 'messages_read_by_user',
        messageIds: messageIds,
        userId: userId.toString(),
        conversationId: conversationId,
        timestamp: new Date()
      };

      conversation.participants.forEach(participant => {
        if (participant._id.toString() !== userId.toString()) {
          this.sendToUser(participant._id, notification);
        }
      });

      // Confirmer à l'expéditeur que les messages ont été marqués comme lus
      this.sendToUser(userId, {
        type: 'messages_marked_read_confirmation',
        messageIds: messageIds,
        conversationId: conversationId,
        timestamp: new Date()
      });

    } catch (error) {
      console.error('Erreur lors du marquage des messages comme lus:', error);
    }
  }

  // Gérer la confirmation de réception des messages
  async handleMessagesReceived(userId, conversationId, messageIds) {
    try {
      // Mettre à jour le statut des messages à "delivered"
      await Message.updateMany(
        { 
          _id: { $in: messageIds }, 
          conversation: conversationId,
          sender: { $ne: userId },
          status: 'sent'
        },
        {
          $set: { status: 'delivered' }
        }
      );

      // Récupérer la conversation pour obtenir les participants
      const conversation = await Conversation.findById(conversationId).populate('participants');
      if (!conversation) return;

      // Notifier les expéditeurs que leurs messages ont été livrés
      const notification = {
        type: 'messages_delivered_confirmation',
        messageIds: messageIds,
        userId: userId.toString(),
        conversationId: conversationId,
        timestamp: new Date()
      };

      conversation.participants.forEach(participant => {
        if (participant._id.toString() !== userId.toString()) {
          this.sendToUser(participant._id, notification);
        }
      });

    } catch (error) {
      console.error('Erreur lors de la confirmation de réception:', error);
    }
  }

  // Retirer un client
  removeClient(userId, ws) {
    if (this.clients.has(userId)) {
      this.clients.get(userId).delete(ws);
      if (this.clients.get(userId).size === 0) {
        this.clients.delete(userId);
      }
    }
  }

  // Mettre à jour le statut en ligne/hors ligne
  async setUserOnlineStatus(userId, isOnline) {
    try {
      await User.findByIdAndUpdate(userId, {
        isOnline: isOnline,
        lastSeen: new Date()
      });

      // Notifier les autres utilisateurs du changement de statut
      this.broadcast({
        type: isOnline ? 'user_online' : 'user_offline',
        userId: userId.toString(),
        timestamp: new Date()
      }, [userId.toString()]);

    } catch (error) {
      console.error('Erreur mise à jour statut utilisateur:', error);
    }
  }

  // Envoyer un message à un utilisateur spécifique
  sendToUser(userId, message) {
    const userConnections = this.clients.get(userId.toString());
    if (userConnections && userConnections.size > 0) {
      const messageStr = JSON.stringify(message);
      userConnections.forEach(ws => {
        if (ws.readyState === WebSocket.OPEN) {
          try {
            ws.send(messageStr);
          } catch (error) {
            console.error('Erreur envoi message WebSocket:', error);
          }
        }
      });
    }
  }

  // Envoyer un message à tous les participants d'une conversation
  async broadcastToConversation(conversationId, senderId, message, excludeUsers = []) {
    try {
      const conversation = await Conversation.findById(conversationId).populate('participants');
      if (!conversation) return;

      const excludeUserIds = [...excludeUsers, senderId.toString()];
      
      conversation.participants.forEach(participant => {
        if (!excludeUserIds.includes(participant._id.toString())) {
          this.sendToUser(participant._id, message);
        }
      });
    } catch (error) {
      console.error('Erreur broadcast conversation:', error);
    }
  }

  // Diffuser un message à tous les clients connectés (sauf exclusions)
  broadcast(message, excludeUserIds = []) {
    const messageStr = JSON.stringify(message);
    
    this.clients.forEach((connections, userId) => {
      if (!excludeUserIds.includes(userId)) {
        connections.forEach(ws => {
          if (ws.readyState === WebSocket.OPEN) {
            try {
              ws.send(messageStr);
            } catch (error) {
              console.error('Erreur broadcast WebSocket:', error);
            }
          }
        });
      }
    });
  }

  // Notifier un nouveau message avec gestion des statuts
  async notifyNewMessage(message, conversationParticipants) {
    try {
      // Marquer le message comme "sent" initialement
      await Message.findByIdAndUpdate(message._id, { status: 'sent' });

      const notification = {
        type: 'new_message',
        message: {
          ...message.toObject(),
          status: 'sent'
        },
        timestamp: new Date()
      };

      conversationParticipants.forEach(participantId => {
        if (participantId.toString() !== message.sender._id.toString()) {
          this.sendToUser(participantId, notification);
        }
      });

      // Confirmer l'envoi à l'expéditeur
      this.sendToUser(message.sender._id, {
        type: 'message_sent_confirmation',
        messageId: message._id,
        status: 'sent',
        timestamp: new Date()
      });

    } catch (error) {
      console.error('Erreur notification nouveau message:', error);
    }
  }

  // Notifier la modification d'un message
  async notifyMessageEdited(message, conversationParticipants) {
    const notification = {
      type: 'message_edited',
      message: message,
      timestamp: new Date()
    };

    conversationParticipants.forEach(participantId => {
      if (participantId.toString() !== message.sender._id.toString()) {
        this.sendToUser(participantId, notification);
      }
    });
  }

  // Notifier la suppression d'un message
  async notifyMessageDeleted(messageId, conversationId, conversationParticipants, senderId) {
    const notification = {
      type: 'message_deleted',
      messageId: messageId,
      conversationId: conversationId,
      timestamp: new Date()
    };

    conversationParticipants.forEach(participantId => {
      if (participantId.toString() !== senderId.toString()) {
        this.sendToUser(participantId, notification);
      }
    });
  }

  // Obtenir le nombre de clients connectés
  getConnectedUsersCount() {
    return this.clients.size;
  }

  // Obtenir les IDs des utilisateurs connectés
  getConnectedUserIds() {
    return Array.from(this.clients.keys());
  }

  // Fermer toutes les connexions WebSocket
  closeAllConnections() {
    this.clients.forEach((connections) => {
      connections.forEach(ws => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.close(1001, 'Serveur en arrêt');
        }
      });
    });
    this.clients.clear();
  }
}

module.exports = SocketServer;



// // websocket/socketServer.js
// const WebSocket = require('ws');
// const jwt = require('jsonwebtoken');
// const User = require('../models/User');

// class SocketServer {
//   constructor(server) {
//     this.wss = new WebSocket.Server({ 
//       server,
//       verifyClient: this.verifyClient.bind(this)
//     });
    
//     this.clients = new Map(); // userId -> Set of WebSocket connections
//     this.setupEventHandlers();
//   }

//   // Vérifier l'authentification du client WebSocket
//   async verifyClient(info) {
//     try {
//       const url = new URL(info.req.url, 'ws://localhost');
//       const token = url.searchParams.get('token');
      
//       if (!token) {
//         console.log('Aucun token fourni pour la connexion WebSocket');
//         return false;
//       }

//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
//       const user = await User.findById(decoded.id);
      
//       if (!user) {
//         console.log('Utilisateur non trouvé pour le token:', decoded.id);
//         return false;
//       }

//       // Stocker les informations utilisateur dans la requête
//       info.req.user = user;
//       console.log('Authentification WebSocket réussie pour:', user.email || user._id);
//       return true;
//     } catch (error) {
//       console.error('Erreur de vérification WebSocket:', error.message);
//       return false;
//     }
//   }

//   setupEventHandlers() {
//     this.wss.on('connection', (ws, req) => {
//       const user = req.user;
      
//       // Vérification de sécurité supplémentaire
//       if (!user) {
//         console.error('Utilisateur non défini lors de la connexion WebSocket');
//         ws.close(1008, 'Utilisateur non authentifié');
//         return;
//       }

//       // Utiliser une propriété qui existe certainement (email ou _id)
//       const userName = user.name || user.email || user._id.toString();
//       console.log(`Utilisateur ${userName} connecté via WebSocket`);

//       // Ajouter le client à la map
//       const userIdStr = user._id.toString();
//       if (!this.clients.has(userIdStr)) {
//         this.clients.set(userIdStr, new Set());
//       }
//       this.clients.get(userIdStr).add(ws);

//       // Marquer l'utilisateur comme en ligne
//       this.setUserOnlineStatus(user._id, true);

//       // Gérer les messages du client
//       ws.on('message', (data) => {
//         try {
//           const message = JSON.parse(data);
//           this.handleClientMessage(user._id, message);
//         } catch (error) {
//           console.error('Erreur parsing message WebSocket:', error);
//         }
//       });

//       // Gérer la déconnexion
//       ws.on('close', () => {
//         console.log(`Utilisateur ${userName} déconnecté`);
//         this.removeClient(userIdStr, ws);
        
//         // Si c'était la dernière connexion, marquer comme hors ligne
//         if (!this.clients.has(userIdStr) || 
//             this.clients.get(userIdStr).size === 0) {
//           this.setUserOnlineStatus(user._id, false);
//         }
//       });

//       // Gérer les erreurs WebSocket
//       ws.on('error', (error) => {
//         console.error(`Erreur WebSocket pour ${userName}:`, error);
//       });

//       // Envoyer confirmation de connexion
//       ws.send(JSON.stringify({
//         type: 'connection_established',
//         userId: user._id,
//         timestamp: new Date()
//       }));
//     });
//   }

//   // Gérer les messages du client
//   handleClientMessage(userId, message) {
//     switch (message.type) {
//       case 'ping':
//         this.sendToUser(userId, { type: 'pong', timestamp: new Date() });
//         break;
//       case 'typing_start':
//         if (message.conversationId) {
//           this.broadcastToConversation(message.conversationId, userId, {
//             type: 'user_typing',
//             userId: userId,
//             conversationId: message.conversationId,
//             timestamp: new Date()
//           });
//         }
//         break;
//       case 'typing_stop':
//         if (message.conversationId) {
//           this.broadcastToConversation(message.conversationId, userId, {
//             type: 'user_stopped_typing',
//             userId: userId,
//             conversationId: message.conversationId,
//             timestamp: new Date()
//           });
//         }
//         break;
//       default:
//         console.log('Type de message WebSocket non géré:', message.type);
//     }
//   }

//   // Retirer un client
//   removeClient(userId, ws) {
//     if (this.clients.has(userId)) {
//       this.clients.get(userId).delete(ws);
//       if (this.clients.get(userId).size === 0) {
//         this.clients.delete(userId);
//       }
//     }
//   }

//   // Mettre à jour le statut en ligne/hors ligne
//   async setUserOnlineStatus(userId, isOnline) {
//     try {
//       await User.findByIdAndUpdate(userId, {
//         isOnline: isOnline,
//         lastSeen: new Date()
//       });

//       // Notifier les autres utilisateurs du changement de statut
//       this.broadcast({
//         type: isOnline ? 'user_online' : 'user_offline',
//         userId: userId.toString(),
//         timestamp: new Date()
//       }, [userId.toString()]);

//     } catch (error) {
//       console.error('Erreur mise à jour statut utilisateur:', error);
//     }
//   }

//   // Envoyer un message à un utilisateur spécifique
//   sendToUser(userId, message) {
//     const userConnections = this.clients.get(userId.toString());
//     if (userConnections && userConnections.size > 0) {
//       const messageStr = JSON.stringify(message);
//       userConnections.forEach(ws => {
//         if (ws.readyState === WebSocket.OPEN) {
//           try {
//             ws.send(messageStr);
//           } catch (error) {
//             console.error('Erreur envoi message WebSocket:', error);
//           }
//         }
//       });
//     }
//   }

//   // Envoyer un message à tous les participants d'une conversation
//   broadcastToConversation(conversationId, senderId, message, excludeUsers = []) {
//     // Cette méthode sera complétée avec la logique de récupération des participants
//     // Pour l'instant, on fait un broadcast général
//     this.broadcast(message, [...excludeUsers, senderId.toString()]);
//   }

//   // Diffuser un message à tous les clients connectés (sauf exclusions)
//   broadcast(message, excludeUserIds = []) {
//     const messageStr = JSON.stringify(message);
    
//     this.clients.forEach((connections, userId) => {
//       if (!excludeUserIds.includes(userId)) {
//         connections.forEach(ws => {
//           if (ws.readyState === WebSocket.OPEN) {
//             try {
//               ws.send(messageStr);
//             } catch (error) {
//               console.error('Erreur broadcast WebSocket:', error);
//             }
//           }
//         });
//       }
//     });
//   }

//   // Notifier un nouveau message
//   notifyNewMessage(message, conversationParticipants) {
//     const notification = {
//       type: 'new_message',
//       message: message,
//       timestamp: new Date()
//     };

//     conversationParticipants.forEach(participantId => {
//       if (participantId.toString() !== message.sender._id.toString()) {
//         this.sendToUser(participantId, notification);
//       }
//     });
//   }

//   // Notifier la modification d'un message
//   notifyMessageEdited(message, conversationParticipants) {
//     const notification = {
//       type: 'message_edited',
//       message: message,
//       timestamp: new Date()
//     };

//     conversationParticipants.forEach(participantId => {
//       if (participantId.toString() !== message.sender._id.toString()) {
//         this.sendToUser(participantId, notification);
//       }
//     });
//   }

//   // Notifier la suppression d'un message
//   notifyMessageDeleted(messageId, conversationId, conversationParticipants, senderId) {
//     const notification = {
//       type: 'message_deleted',
//       messageId: messageId,
//       conversationId: conversationId,
//       timestamp: new Date()
//     };

//     conversationParticipants.forEach(participantId => {
//       if (participantId.toString() !== senderId.toString()) {
//         this.sendToUser(participantId, notification);
//       }
//     });
//   }

//   // Obtenir le nombre de clients connectés
//   getConnectedUsersCount() {
//     return this.clients.size;
//   }

//   // Obtenir les IDs des utilisateurs connectés
//   getConnectedUserIds() {
//     return Array.from(this.clients.keys());
//   }

//   // Fermer toutes les connexions WebSocket
//   closeAllConnections() {
//     this.clients.forEach((connections) => {
//       connections.forEach(ws => {
//         if (ws.readyState === WebSocket.OPEN) {
//           ws.close(1001, 'Serveur en arrêt');
//         }
//       });
//     });
//     this.clients.clear();
//   }
// }

// module.exports = SocketServer;


