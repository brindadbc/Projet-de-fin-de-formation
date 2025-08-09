// routes/messages.js - Routes mises à jour avec gestion des statuts
const express = require('express');
const router = express.Router();
const {
  getConversations,
  getOrCreateConversation,
  getMessages,
  sendMessage,
  editMessage,
  deleteMessage,
  markMessagesAsRead,
  markMessagesAsDelivered,
  getAvailableUsers,
  getMessageStatus // Nouvelle fonction
} = require('../controllers/messageController');

const { protect } = require('../middleware/auth');

// Middleware d'authentification pour toutes les routes
router.use(protect);

// Routes existantes
router.get('/conversations', getConversations);
router.get('/available-users', getAvailableUsers);
router.get('/conversations/:otherUserId', getOrCreateConversation);
router.get('/conversations/:conversationId/messages', getMessages);
router.post('/conversations/:conversationId/messages', sendMessage);
router.put('/messages/:messageId', editMessage);
router.delete('/messages/:messageId', deleteMessage);

// Routes pour les statuts des messages
router.patch('/conversations/:conversationId/read', markMessagesAsRead);
router.patch('/conversations/:conversationId/delivered', markMessagesAsDelivered);

// NOUVEAU: Route pour obtenir le statut d'un message spécifique
router.get('/messages/:messageId/status', getMessageStatus);

// NOUVEAU: Route pour marquer des messages spécifiques comme lus
router.patch('/messages/mark-read', async (req, res) => {
  try {
    const userId = req.user._id;
    const { messageIds } = req.body;

    if (!messageIds || !Array.isArray(messageIds)) {
      return res.status(400).json({ message: 'messageIds est requis et doit être un tableau' });
    }

    const Message = require('../models/message');
    const Conversation = require('../models/conversation');

    // Trouver les messages et vérifier les autorisations
    const messages = await Message.find({
      _id: { $in: messageIds },
      sender: { $ne: userId }
    }).populate('conversation', 'participants');

    const updatedMessages = [];
    
    for (const message of messages) {
      // Vérifier que l'utilisateur fait partie de la conversation
      const isParticipant = message.conversation.participants.some(p => 
        p.toString() === userId.toString()
      );

      if (isParticipant) {
        message.markAsRead(userId);
        await message.updateStatus();
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

    res.json({
      message: 'Messages marqués comme lus',
      updatedCount: updatedMessages.length
    });

  } catch (error) {
    console.error('Erreur marquage messages spécifiques:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;