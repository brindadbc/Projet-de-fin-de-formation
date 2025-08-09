const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file', 'audio', 'video'],
    default: 'text'
  },
  // Statuts des messages
  status: {
    type: String,
    enum: ['sending', 'sent', 'delivered', 'read'],
    default: 'sending'
  },
  // Quand le message a été livré
  deliveredAt: {
    type: Date
  },
  // Suivi des lectures par utilisateur
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Message modifié
  edited: {
    type: Boolean,
    default: false
  },
  editedAt: Date,
  // Messages supprimés pour certains utilisateurs
  deletedFor: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Méthode pour marquer comme lu par un utilisateur
messageSchema.methods.markAsRead = function(userId) {
  const existingRead = this.readBy.find(read => 
    read.user.toString() === userId.toString()
  );
  
  if (!existingRead) {
    this.readBy.push({
      user: userId,
      readAt: new Date()
    });
    
    // Mettre à jour le statut global si tous les participants ont lu
    this.updateStatus();
  }
};

// Méthode pour mettre à jour le statut global du message
messageSchema.methods.updateStatus = async function() {
  try {
    // Récupérer la conversation pour connaître les participants
    const conversation = await mongoose.model('Conversation')
      .findById(this.conversation)
      .populate('participants');
    
    if (!conversation) return;
    
    // Participants autres que l'expéditeur
    const recipients = conversation.participants.filter(p => 
      p._id.toString() !== this.sender.toString()
    );
    
    if (recipients.length === 0) {
      this.status = 'sent';
      return;
    }
    
    // Vérifier si tous ont lu
    const allRead = recipients.every(recipient => 
      this.readBy.some(read => 
        read.user.toString() === recipient._id.toString()
      )
    );
    
    if (allRead) {
      this.status = 'read';
    } else if (this.deliveredAt) {
      this.status = 'delivered';
    } else {
      this.status = 'sent';
    }
  } catch (error) {
    console.error('Erreur mise à jour statut:', error);
  }
};

// Index pour optimiser les requêtes
messageSchema.index({ conversation: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });
messageSchema.index({ status: 1 });

module.exports = mongoose.model('Message', messageSchema);