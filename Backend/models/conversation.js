const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  unreadCount: {
    type: Map,
    of: Number,
    default: new Map()
  }
}, {
  timestamps: true
});

// Index pour optimiser les requêtes
conversationSchema.index({ participants: 1 });
conversationSchema.index({ updatedAt: -1 });

// Méthode pour vérifier si un utilisateur fait partie de la conversation
conversationSchema.methods.hasParticipant = function(userId) {
  return this.participants.some(participant => 
    participant.toString() === userId.toString()
  );
};

// Méthode pour obtenir l'autre participant (pour les conversations à 2)
conversationSchema.methods.getOtherParticipant = function(userId) {
  return this.participants.find(participant => 
    participant.toString() !== userId.toString()
  );
};

module.exports = mongoose.model('Conversation', conversationSchema);