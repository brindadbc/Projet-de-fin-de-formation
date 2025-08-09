// const Message = require('../models/message');
// const Conversation = require('../models/conversation');
// const User = require('../models/user');
// const mongoose = require('mongoose');

// // Obtenir toutes les conversations d'un utilisateur
// const getConversations = async (req, res) => {
//   try {
//     const userId = req.user.id;
    
//     const conversations = await Conversation.find({
//       participants: userId
//     })
//     .populate('participants', 'firstName lastName email role company position profilePicture isOnline lastSeen')
//     .populate('lastMessage')
//     .sort({ updatedAt: -1 });

//     // Calculer le nombre de messages non lus pour chaque conversation
//     const conversationsWithUnread = await Promise.all(
//       conversations.map(async (conversation) => {
//         const unreadCount = await Message.countDocuments({
//           conversation: conversation._id,
//           sender: { $ne: userId },
//           readBy: { $not: { $elemMatch: { user: userId } } }
//         });

//         return {
//           ...conversation.toObject(),
//           unreadCount
//         };
//       })
//     );

//     res.json(conversationsWithUnread);
//   } catch (error) {
//     console.error('Erreur lors de la récupération des conversations:', error);
//     res.status(500).json({ message: 'Erreur serveur' });
//   }
// };

// // Obtenir ou créer une conversation
// const getOrCreateConversation = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { otherUserId } = req.params;

//     // Vérifier que l'autre utilisateur existe
//     const otherUser = await User.findById(otherUserId);
//     if (!otherUser) {
//       return res.status(404).json({ message: 'Utilisateur non trouvé' });
//     }

//     // Chercher une conversation existante
//     let conversation = await Conversation.findOne({
//       participants: { $all: [userId, otherUserId] }
//     })
//     .populate('participants', 'firstName lastName email role company position profilePicture isOnline lastSeen')
//     .populate('lastMessage');

//     // Si pas de conversation existante, en créer une nouvelle
//     if (!conversation) {
//       conversation = new Conversation({
//         participants: [userId, otherUserId]
//       });
//       await conversation.save();
      
//       // Populate les participants pour la réponse
//       await conversation.populate('participants', 'firstName lastName email role company position profilePicture isOnline lastSeen');
//     }

//     res.json(conversation);
//   } catch (error) {
//     console.error('Erreur lors de la création/récupération de la conversation:', error);
//     res.status(500).json({ message: 'Erreur serveur' });
//   }
// };

// // Obtenir les messages d'une conversation
// const getMessages = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { conversationId } = req.params;
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 50;
//     const skip = (page - 1) * limit;

//     // Vérifier que l'utilisateur fait partie de la conversation
//     const conversation = await Conversation.findById(conversationId);
//     if (!conversation || !conversation.hasParticipant(userId)) {
//       return res.status(403).json({ message: 'Accès non autorisé à cette conversation' });
//     }

//     const messages = await Message.find({
//       conversation: conversationId,
//       deletedFor: { $ne: userId }
//     })
//     .populate('sender', 'firstName lastName profilePicture role company position')
//     .sort({ createdAt: -1 })
//     .limit(limit)
//     .skip(skip);

//     // Marquer les messages comme lus
//     await Message.updateMany(
//       {
//         conversation: conversationId,
//         sender: { $ne: userId },
//         'readBy.user': { $ne: userId }
//       },
//       {
//         $push: {
//           readBy: {
//             user: userId,
//             readAt: new Date()
//           }
//         }
//       }
//     );

//     // Inverser l'ordre pour avoir les plus anciens en premier
//     messages.reverse();

//     res.json(messages);
//   } catch (error) {
//     console.error('Erreur lors de la récupération des messages:', error);
//     res.status(500).json({ message: 'Erreur serveur' });
//   }
// };

// // Envoyer un message
// const sendMessage = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { conversationId } = req.params;
//     const { content, messageType = 'text' } = req.body;

//     // Validation
//     if (!content || !content.trim()) {
//       return res.status(400).json({ message: 'Le contenu du message est requis' });
//     }

//     // Vérifier que l'utilisateur fait partie de la conversation
//     const conversation = await Conversation.findById(conversationId);
//     if (!conversation || !conversation.hasParticipant(userId)) {
//       return res.status(403).json({ message: 'Accès non autorisé à cette conversation' });
//     }

//     // Créer le message
//     const message = new Message({
//       conversation: conversationId,
//       sender: userId,
//       content: content.trim(),
//       messageType,
//       status: 'sent'
//     });

//     await message.save();

//     // Mettre à jour la conversation
//     conversation.lastMessage = message._id;
//     conversation.updatedAt = new Date();
//     await conversation.save();

//     // Populate le sender pour la réponse
//     await message.populate('sender', 'firstName lastName profilePicture role company position');

//     res.status(201).json(message);
//   } catch (error) {
//     console.error('Erreur lors de l\'envoi du message:', error);
//     res.status(500).json({ message: 'Erreur serveur' });
//   }
// };

// // Modifier un message
// const editMessage = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { messageId } = req.params;
//     const { content } = req.body;

//     // Validation
//     if (!content || !content.trim()) {
//       return res.status(400).json({ message: 'Le contenu du message est requis' });
//     }

//     // Trouver le message
//     const message = await Message.findById(messageId);
//     if (!message) {
//       return res.status(404).json({ message: 'Message non trouvé' });
//     }

//     // Vérifier que l'utilisateur est l'auteur du message
//     if (message.sender.toString() !== userId) {
//       return res.status(403).json({ message: 'Vous ne pouvez modifier que vos propres messages' });
//     }

//     // Mettre à jour le message
//     message.content = content.trim();
//     message.edited = true;
//     message.editedAt = new Date();
//     await message.save();

//     await message.populate('sender', 'firstName lastName profilePicture role company position');

//     res.json(message);
//   } catch (error) {
//     console.error('Erreur lors de la modification du message:', error);
//     res.status(500).json({ message: 'Erreur serveur' });
//   }
// };

// // Supprimer un message
// const deleteMessage = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { messageId } = req.params;
//     const { deleteForEveryone = false } = req.body;

//     const message = await Message.findById(messageId);
//     if (!message) {
//       return res.status(404).json({ message: 'Message non trouvé' });
//     }

//     // Vérifier que l'utilisateur est l'auteur du message
//     if (message.sender.toString() !== userId) {
//       return res.status(403).json({ message: 'Vous ne pouvez supprimer que vos propres messages' });
//     }

//     if (deleteForEveryone) {
//       // Supprimer complètement le message
//       await Message.findByIdAndDelete(messageId);
      
//       // Mettre à jour la conversation si c'était le dernier message
//       const conversation = await Conversation.findById(message.conversation);
//       if (conversation && conversation.lastMessage && conversation.lastMessage.toString() === messageId) {
//         const lastMessage = await Message.findOne({
//           conversation: message.conversation
//         }).sort({ createdAt: -1 });
        
//         conversation.lastMessage = lastMessage ? lastMessage._id : null;
//         await conversation.save();
//       }
//     } else {
//       // Marquer comme supprimé pour cet utilisateur uniquement
//       if (!message.deletedFor.includes(userId)) {
//         message.deletedFor.push(userId);
//         await message.save();
//       }
//     }

//     res.json({ message: 'Message supprimé avec succès' });
//   } catch (error) {
//     console.error('Erreur lors de la suppression du message:', error);
//     res.status(500).json({ message: 'Erreur serveur' });
//   }
// };

// // Marquer les messages comme lus
// const markMessagesAsRead = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { conversationId } = req.params;

//     // Vérifier que l'utilisateur fait partie de la conversation
//     const conversation = await Conversation.findById(conversationId);
//     if (!conversation || !conversation.hasParticipant(userId)) {
//       return res.status(403).json({ message: 'Accès non autorisé à cette conversation' });
//     }

//     // Marquer tous les messages non lus comme lus
//     await Message.updateMany(
//       {
//         conversation: conversationId,
//         sender: { $ne: userId },
//         'readBy.user': { $ne: userId }
//       },
//       {
//         $push: {
//           readBy: {
//             user: userId,
//             readAt: new Date()
//           }
//         }
//       }
//     );

//     res.json({ message: 'Messages marqués comme lus' });
//   } catch (error) {
//     console.error('Erreur lors du marquage des messages comme lus:', error);
//     res.status(500).json({ message: 'Erreur serveur' });
//   }
// };

// // Obtenir les utilisateurs disponibles pour une nouvelle conversation
// const getAvailableUsers = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const currentUser = await User.findById(userId);
    
//     // Obtenir les utilisateurs d'un rôle différent
//     const oppositeRole = currentUser.role === 'candidate' ? 'recruiter' : 'candidate';
    
//     const availableUsers = await User.find({
//       _id: { $ne: userId },
//       role: oppositeRole
//     }).select('firstName lastName email role company position profilePicture isOnline lastSeen');

//     res.json(availableUsers);
//   } catch (error) {
//     console.error('Erreur lors de la récupération des utilisateurs disponibles:', error);
//     res.status(500).json({ message: 'Erreur serveur' });
//   }
// };

// module.exports = {
//   getConversations,
//   getOrCreateConversation,
//   getMessages,
//   sendMessage,
//   editMessage,
//   deleteMessage,
//   markMessagesAsRead,
//   getAvailableUsers
// };


// controllers/messageController.js - Version corrigée et bien organisée
const Message = require('../models/message');
const Conversation = require('../models/conversation');
const User = require('../models/user');
const mongoose = require('mongoose');
// const { afterMessageSent } = require('../hooks/notificationHooks');

/**
 * SERVICE DE MESSAGERIE AVEC GESTION DES STATUTS
 * Fonctionnalités : Envoi, Réception, Statuts (Envoyé, Livré, Lu), Notifications temps réel
 */

// ======================= CONVERSATIONS =======================

/**
 * Obtenir toutes les conversations d'un utilisateur avec compteurs non lus
 */
const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;
    
    console.log('📋 Récupération des conversations pour userId:', userId);
    
    const conversations = await Conversation.find({
      participants: userId
    })
    .populate('participants', 'name email role company position profilePicture isOnline lastSeen')
    .populate({
      path: 'lastMessage',
      populate: {
        path: 'sender',
        select: 'name profilePicture'
      }
    })
    .sort({ updatedAt: -1 });

    // Calculer le nombre de messages non lus pour chaque conversation
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conversation) => {
        const unreadCount = await Message.countDocuments({
          conversation: conversation._id,
          sender: { $ne: userId },
          readBy: { $not: { $elemMatch: { user: userId } } }
        });

        return {
          ...conversation.toObject(),
          unreadCount
        };
      })
    );

    console.log('✅ Conversations récupérées:', conversationsWithUnread.length);
    res.json(conversationsWithUnread);
  } catch (error) {
    console.error('❌ Erreur récupération conversations:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

/**
 * Obtenir ou créer une conversation entre deux utilisateurs
 */
const getOrCreateConversation = async (req, res) => {
  try {
    const userId = req.user._id;
    const { otherUserId } = req.params;

    console.log('🔍 Recherche/création conversation:', { userId, otherUserId });

    // Vérifier que l'autre utilisateur existe
    const otherUser = await User.findById(otherUserId);
    if (!otherUser) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Chercher une conversation existante
    let conversation = await Conversation.findOne({
      participants: { $all: [userId, otherUserId] }
    })
    .populate('participants', 'name email role company position profilePicture isOnline lastSeen')
    .populate({
      path: 'lastMessage',
      populate: {
        path: 'sender',
        select: 'name profilePicture'
      }
    });

    // Si pas de conversation existante, en créer une nouvelle
    if (!conversation) {
      conversation = new Conversation({
        participants: [userId, otherUserId]
      });
      await conversation.save();
      
      // Populate les participants pour la réponse
      await conversation.populate('participants', 'name email role company position profilePicture isOnline lastSeen');
      console.log('✅ Nouvelle conversation créée:', conversation._id);
    } else {
      console.log('✅ Conversation existante trouvée:', conversation._id);
    }

    res.json(conversation);
  } catch (error) {
    console.error('❌ Erreur création/récupération conversation:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

/**
 * Obtenir les utilisateurs disponibles pour une nouvelle conversation
 */
const getAvailableUsers = async (req, res) => {
  try {
    const userId = req.user._id;
    const currentUser = await User.findById(userId);
    
    // Obtenir les utilisateurs du rôle opposé
    const oppositeRole = currentUser.role === 'candidat' ? 'recruteur' : 'candidat';
    
    const availableUsers = await User.find({
      _id: { $ne: userId },
      role: oppositeRole
    }).select('name email role company position profilePicture isOnline lastSeen');

    console.log('👥 Utilisateurs disponibles récupérés:', availableUsers.length);
    res.json(availableUsers);
  } catch (error) {
    console.error('❌ Erreur récupération utilisateurs disponibles:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// ======================= MESSAGES =======================

/**
 * Obtenir les messages d'une conversation avec mise à jour automatique des statuts
 */
const getMessages = async (req, res) => {
  try {
    const userId = req.user._id;
    const { conversationId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    console.log('📨 Récupération des messages:', { userId, conversationId, page, limit });

    // Vérifier l'accès à la conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation non trouvée' });
    }

    const isParticipant = conversation.participants.some(p => 
      p.toString() === userId.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({ message: 'Accès non autorisé à cette conversation' });
    }

    // Récupérer les messages
    const messages = await Message.find({
      conversation: conversationId,
      deletedFor: { $ne: userId }
    })
    .populate('sender', 'name profilePicture role company position')
    .populate('readBy.user', 'name profilePicture')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);

    // Marquer automatiquement les messages reçus non livrés comme livrés
    const messagesToDeliver = messages.filter(msg => 
      msg.sender._id.toString() !== userId.toString() &&
      msg.status === 'sent'
    );

    if (messagesToDeliver.length > 0) {
      await Message.updateMany(
        { _id: { $in: messagesToDeliver.map(m => m._id) } },
        { 
          $set: { 
            status: 'delivered', 
            deliveredAt: new Date() 
          } 
        }
      );

      // Notifier l'expéditeur que ses messages sont livrés
      const socketServer = req.app.get('socketServer');
      if (socketServer) {
        conversation.participants.forEach(participantId => {
          if (participantId.toString() !== userId.toString()) {
            socketServer.sendToUser(participantId, {
              type: 'messages_delivered_confirmation',
              conversationId: conversationId,
              messageIds: messagesToDeliver.map(m => m._id),
              deliveredBy: userId,
              timestamp: new Date()
            });
          }
        });
      }
    }

    // Inverser l'ordre pour avoir les plus anciens en premier
    messages.reverse();

    console.log('✅ Messages récupérés:', messages.length);
    res.json(messages);
  } catch (error) {
    console.error('❌ Erreur récupération messages:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

/**
 * Envoyer un nouveau message avec gestion des statuts
 */
const sendMessage = async (req, res) => {
  try {
    const userId = req.user._id;
    const { conversationId } = req.params;
    const { content, messageType = 'text' } = req.body;
    console.log('📨 Tentative d\'envoi de message:', {
      userId,
      conversationId,
      contentLength: content?.length
    });

    // Validation du contenu
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Le contenu du message est requis' });
    }

    // Vérifier l'accès à la conversation
    const conversation = await Conversation.findById(conversationId)
      .populate('participants', '_id name');
    
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation non trouvée' });
    }

    const isParticipant = conversation.participants.some(p => 
      p._id.toString() === userId.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({ message: 'Accès non autorisé à cette conversation' });
    }

    // Créer le message
    const message = new Message({
      conversation: conversationId,
      sender: userId,
      content: content.trim(),
      messageType,
      status: 'sent'
    });

    await message.save();
    console.log('✅ Message sauvegardé:', message._id);

    // Mettre à jour la conversation
    conversation.lastMessage = message._id;
    conversation.updatedAt = new Date();
    await conversation.save();

    // Populate le sender pour la réponse
    await message.populate('sender', 'name profilePicture role company position');

    // Notifier via WebSocket
    const socketServer = req.app.get('socketServer');
    if (socketServer) {
      const participantIds = conversation.participants.map(p => p._id);
      socketServer.notifyNewMessage(message, participantIds);
    }
    console.log('✅ Message envoyé avec succès');
    res.status(201).json(message);
  } catch (error) {
    console.error('❌ Erreur envoi message:', error);
    res.status(500).json({ 
      message: 'Erreur serveur', 
      error: error.message
    });
  }
};

/**
 * Modifier un message existant
 */
const editMessage = async (req, res) => {
  try {
    const userId = req.user._id;
    const { messageId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Le contenu du message est requis' });
    }

    const message = await Message.findById(messageId)
      .populate('conversation', 'participants');
    
    if (!message) {
      return res.status(404).json({ message: 'Message non trouvé' });
    }

    if (message.sender.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Vous ne pouvez modifier que vos propres messages' });
    }

    message.content = content.trim();
    message.edited = true;
    message.editedAt = new Date();
    await message.save();

    await message.populate('sender', 'name profilePicture role company position');

    // Notifier via WebSocket
    const socketServer = req.app.get('socketServer');
    if (socketServer) {
      socketServer.notifyMessageEdited(message, message.conversation.participants);
    }

    console.log('✅ Message modifié:', message._id);
    res.json(message);
  } catch (error) {
    console.error('❌ Erreur modification message:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

/**
 * Supprimer un message
 */
const deleteMessage = async (req, res) => {
  try {
    const userId = req.user._id;
    const { messageId } = req.params;
    const { deleteForEveryone = false } = req.body;

    const message = await Message.findById(messageId)
      .populate('conversation', 'participants');
    
    if (!message) {
      return res.status(404).json({ message: 'Message non trouvé' });
    }

    if (message.sender.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Vous ne pouvez supprimer que vos propres messages' });
    }

    if (deleteForEveryone) {
      // Supprimer complètement le message
      await Message.findByIdAndDelete(messageId);
      
      // Mettre à jour le dernier message de la conversation si nécessaire
      const conversation = await Conversation.findById(message.conversation._id);
      if (conversation && conversation.lastMessage && conversation.lastMessage.toString() === messageId) {
        const lastMessage = await Message.findOne({
          conversation: message.conversation._id
        }).sort({ createdAt: -1 });
        
        conversation.lastMessage = lastMessage ? lastMessage._id : null;
        await conversation.save();
      }

      // Notifier via WebSocket
      const socketServer = req.app.get('socketServer');
      if (socketServer) {
        socketServer.notifyMessageDeleted(messageId, message.conversation._id, message.conversation.participants, userId);
      }
    } else {
      // Marquer comme supprimé pour cet utilisateur uniquement
      if (!message.deletedFor.includes(userId)) {
        message.deletedFor.push(userId);
        await message.save();
      }
    }

    console.log('✅ Message supprimé:', messageId);
    res.json({ message: 'Message supprimé avec succès' });
  } catch (error) {
    console.error('❌ Erreur suppression message:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// ======================= GESTION DES STATUTS =======================

/**
 * Marquer les messages d'une conversation comme lus
 */
const markMessagesAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const { conversationId } = req.params;

    console.log('📖 Marquage messages comme lus:', { userId, conversationId });

    // Vérifier l'accès à la conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation non trouvée' });
    }

    const isParticipant = conversation.participants.some(p => 
      p.toString() === userId.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    // Trouver tous les messages non lus de cette conversation
    const unreadMessages = await Message.find({
      conversation: conversationId,
      sender: { $ne: userId },
      'readBy.user': { $ne: userId }
    });

    console.log('📊 Messages non lus trouvés:', unreadMessages.length);

    // Marquer chaque message comme lu et mettre à jour le statut
    const updatedMessages = [];
    for (const message of unreadMessages) {
      message.readBy.push({
        user: userId,
        readAt: new Date()
      });
      message.status = 'read';
      await message.save();
      
      // Populate pour la notification WebSocket
      await message.populate('sender', 'name profilePicture');
      updatedMessages.push(message);
    }

    // Notifier via WebSocket des changements de statut
    const socketServer = req.app.get('socketServer');
    if (socketServer && updatedMessages.length > 0) {
      conversation.participants.forEach(participantId => {
        socketServer.sendToUser(participantId, {
          type: 'messages_read_by_user',
          conversationId: conversationId,
          messageIds: updatedMessages.map(msg => msg._id),
          readBy: userId,
          timestamp: new Date()
        });
      });
    }

    console.log('✅ Messages marqués comme lus:', updatedMessages.length);
    res.json({ 
      message: 'Messages marqués comme lus',
      updatedCount: updatedMessages.length
    });
  } catch (error) {
    console.error('❌ Erreur marquage comme lu:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

/**
 * Marquer les messages comme livrés (automatique lors de la réception)
 */
const markMessagesAsDelivered = async (req, res) => {
  try {
    const userId = req.user._id;
    const { conversationId } = req.params;
    const { messageIds } = req.body; // IDs spécifiques à marquer (optionnel)

    console.log('📦 Marquage comme livré:', { userId, conversationId, messageIds });

    // Vérifier l'accès à la conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation non trouvée' });
    }

    const isParticipant = conversation.participants.some(p => 
      p.toString() === userId.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    // Construire la requête de mise à jour
    let updateQuery = {
      conversation: conversationId,
      sender: { $ne: userId },
      status: 'sent'
    };

    // Si des IDs spécifiques sont fournis
    if (messageIds && Array.isArray(messageIds)) {
      updateQuery._id = { $in: messageIds };
    }

    // Marquer comme livré
    const result = await Message.updateMany(
      updateQuery,
      {
        $set: {
          status: 'delivered',
          deliveredAt: new Date()
        }
      }
    );

    console.log('✅ Messages marqués comme livrés:', result.modifiedCount);

    // Notifier via WebSocket
    const socketServer = req.app.get('socketServer');
    if (socketServer && result.modifiedCount > 0) {
      conversation.participants.forEach(participantId => {
        if (participantId.toString() !== userId.toString()) {
          socketServer.sendToUser(participantId, {
            type: 'messages_delivered_confirmation',
            conversationId: conversationId,
            deliveredBy: userId,
            messageCount: result.modifiedCount,
            timestamp: new Date()
          });
        }
      });
    }

    res.json({ 
      message: 'Messages marqués comme livrés',
      count: result.modifiedCount
    });
  } catch (error) {
    console.error('❌ Erreur marquage comme livré:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

/**
 * Obtenir le statut détaillé d'un message
 */
const getMessageStatus = async (req, res) => {
  try {
    const userId = req.user._id;
    const { messageId } = req.params;

    const message = await Message.findById(messageId)
      .populate('conversation', 'participants')
      .populate('readBy.user', 'name profilePicture')
      .populate('sender', 'name profilePicture');

    if (!message) {
      return res.status(404).json({ message: 'Message non trouvé' });
    }

    // Vérifier l'accès
    const isParticipant = message.conversation.participants.some(p => 
      p.toString() === userId.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    // Préparer les informations de statut
    const statusInfo = {
      messageId: message._id,
      status: message.status,
      createdAt: message.createdAt,
      deliveredAt: message.deliveredAt,
      readBy: message.readBy,
      isOwn: message.sender._id.toString() === userId.toString(),
      edited: message.edited,
      editedAt: message.editedAt
    };

    res.json(statusInfo);
  } catch (error) {
    console.error('❌ Erreur récupération statut message:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

/**
 * Marquer des messages spécifiques comme lus (pour l'intersection observer)
 */
const markSpecificMessagesAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const { messageIds } = req.body;

    if (!messageIds || !Array.isArray(messageIds)) {
      return res.status(400).json({ message: 'messageIds est requis et doit être un tableau' });
    }

    // Trouver les messages et vérifier les autorisations
    const messages = await Message.find({
      _id: { $in: messageIds },
      sender: { $ne: userId }
    }).populate('conversation', 'participants');

    const updatedMessages = [];
    
    for (const message of messages) {
      // Vérifier l'accès à la conversation
      const isParticipant = message.conversation.participants.some(p =>
        p.toString() === userId.toString()
      );

      if (isParticipant && !message.readBy.some(r => r.user.toString() === userId.toString())) {
        message.readBy.push({
          user: userId,
          readAt: new Date()
        });
        message.status = 'read';
        await message.save();
        updatedMessages.push(message);
      }
    }

    // Notifier via WebSocket
    const socketServer = req.app.get('socketServer');
    if (socketServer && updatedMessages.length > 0) {
      updatedMessages.forEach(message => {
        message.conversation.participants.forEach(participantId => {
          socketServer.sendToUser(participantId, {
            type: 'message_status_updated',
            messageId: message._id,
            status: message.status,
            readBy: message.readBy,
            timestamp: new Date()
          });
        });
      });
    }

    console.log('✅ Messages spécifiques marqués comme lus:', updatedMessages.length);
    res.json({
      message: 'Messages marqués comme lus',
      updatedCount: updatedMessages.length
    });
  } catch (error) {
    console.error('❌ Erreur marquage messages spécifiques:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// ======================= EXPORTS =======================

module.exports = {
  // Conversations
  getConversations,
  getOrCreateConversation,
  getAvailableUsers,
  
  // Messages
  getMessages,
  sendMessage,
  editMessage,
  deleteMessage,
  
  // Gestion des statuts
  markMessagesAsRead,
  markMessagesAsDelivered,
  getMessageStatus,
  markSpecificMessagesAsRead
};

