
const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  // Référence au candidat
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Le candidat est requis']
  },
  
  // Référence à l'emploi
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: [true, 'L\'emploi est requis']
  },
  
  // Informations personnelles du candidat
  personalInfo: {
    firstName: {
      type: String,
      required: [true, 'Le prénom est requis'],
      trim: true
    },
    lastName: {
      type: String,
      required: [true, 'Le nom est requis'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'L\'email est requis'],
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      required: [true, 'Le téléphone est requis'],
      trim: true
    },
    address: {
      type: String,
      trim: true,
      default: ''
    }
  },
  
  // Documents téléchargés
  documents: {
    cv: {
      filename: String,
      path: String,
      uploadDate: {
        type: Date,
        default: Date.now
      }
    },
    coverLetterFile: {
      filename: String,
      path: String,
      uploadDate: {
        type: Date,
        default: Date.now
      }
    },
    portfolio: {
      filename: String,
      path: String,
      uploadDate: {
        type: Date,
        default: Date.now
      }
    }
  },
  
  // Lettre de motivation (texte)
  coverLetter: {
    type: String,
    trim: true,
    default: ''
  },
  
  // Informations complémentaires
  additionalInfo: {
    experience: {
      type: String,
      trim: true,
      default: ''
    },
    motivation: {
      type: String,
      trim: true,
      default: ''
    },
    availability: {
      type: String,
      trim: true,
      default: ''
    },
    expectedSalary: {
      type: String,
      trim: true,
      default: ''
    },
    portfolioUrl: {
      type: String,
      trim: true,
      default: ''
    },
    linkedinUrl: {
      type: String,
      trim: true,
      default: ''
    }
  },
  
  // Réponses aux questions personnalisées
  customAnswers: [{
    question: {
      type: String,
      required: true,
      trim: true
    },
    answer: {
      type: String,
      required: true,
      trim: true
    }
  }],
  
  // Statut de la candidature
  status: {
    type: String,
    enum: [
      'new',           // Nouvelle candidature
      'reviewed',      // Examinée
      'shortlisted',   // Présélectionnée
      'interviewed',   // Entretien programmé/effectué
      'accepted',      // Acceptée
      'rejected'       // Rejetée
    ],
    default: 'new'
  },
  
  // Historique des changements de statut
  statusHistory: [{
    status: {
      type: String,
      required: true
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    changedAt: {
      type: Date,
      default: Date.now
    },
    note: {
      type: String,
      trim: true,
      default: ''
    }
  }],
  
  // Notes du recruteur
  recruiterNotes: [{
    note: {
      type: String,
      required: true,
      trim: true
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Contact du recruteur (copie pour historique)
  recruiterContact: {
    person: {
      type: String,
      trim: true,
      default: ''
    },
    email: {
      type: String,
      trim: true,
      default: ''
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    }
  },
  
  // Score de correspondance (0-100)
  matchScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  
  // Candidature favorite pour le recruteur
  isFavorite: {
    type: Boolean,
    default: false
  },
  
  // Dates importantes
  appliedDate: {
    type: Date,
    default: Date.now
  },
  
  lastUpdate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true, // Ajoute createdAt et updatedAt automatiquement
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index pour améliorer les performances
applicationSchema.index({ candidate: 1, job: 1 }, { unique: true }); // Un candidat ne peut postuler qu'une fois par emploi
applicationSchema.index({ job: 1, status: 1 });
applicationSchema.index({ candidate: 1, status: 1 });
applicationSchema.index({ appliedDate: -1 });
applicationSchema.index({ matchScore: -1 });

// Virtuals pour des calculs dynamiques
applicationSchema.virtual('progress').get(function() {
  switch (this.status) {
    case 'new': return 20;
    case 'reviewed': return 40;
    case 'shortlisted': return 60;
    case 'interviewed': return 80;
    case 'accepted': return 100;
    case 'rejected': return 100;
    default: return 20;
  }
});

applicationSchema.virtual('nextStep').get(function() {
  switch (this.status) {
    case 'new': return 'En cours d\'examen par le recruteur';
    case 'reviewed': return 'Attente de décision pour présélection';
    case 'shortlisted': return 'Préparation d\'un entretien possible';
    case 'interviewed': return 'Entretien programmé ou en attente de résultat';
    case 'accepted': return 'Félicitations ! Préparez votre intégration';
    case 'rejected': return 'Candidature non retenue cette fois';
    default: return 'Statut en cours de mise à jour';
  }
});

applicationSchema.virtual('statusText').get(function() {
  const statusTexts = {
    'new': 'Nouveau',
    'reviewed': 'Examiné',
    'shortlisted': 'Présélectionné',
    'interviewed': 'Entretien',
    'accepted': 'Accepté',
    'rejected': 'Rejeté'
  };
  return statusTexts[this.status] || this.status;
});

// Méthodes d'instance
applicationSchema.methods.updateStatus = function(newStatus, userId, note = '') {
  const oldStatus = this.status;
  this.status = newStatus;
  this.lastUpdate = new Date();
  
  // Ajouter à l'historique
  this.statusHistory.push({
    status: newStatus,
    changedBy: userId,
    changedAt: new Date(),
    note: note || `Statut changé de "${oldStatus}" vers "${newStatus}"`
  });
  
  return this.save();
};

applicationSchema.methods.addNote = function(note, authorId) {
  this.recruiterNotes.push({
    note,
    author: authorId,
    createdAt: new Date()
  });
  
  return this.save();
};

applicationSchema.methods.calculateMatchScore = function() {
  // Algorithme basique de calcul de score
  // À améliorer selon vos critères métier
  let score = 50; // Score de base
  
  // Bonus pour les documents fournis
  if (this.documents.cv) score += 20;
  if (this.documents.coverLetterFile || this.coverLetter) score += 10;
  if (this.documents.portfolio) score += 10;
  
  // Bonus pour les réponses aux questions
  if (this.customAnswers && this.customAnswers.length > 0) {
    score += Math.min(10, this.customAnswers.length * 2);
  }
  
  // Assurer que le score reste entre 0 et 100
  this.matchScore = Math.max(0, Math.min(100, score));
  
  return this.matchScore;
};

// Méthodes statiques
applicationSchema.statics.getStatusStats = function(jobIds) {
  return this.aggregate([
    { $match: { job: { $in: jobIds } } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
};

applicationSchema.statics.getApplicationsByDateRange = function(startDate, endDate, jobIds = null) {
  const matchQuery = {
    appliedDate: {
      $gte: startDate,
      $lte: endDate
    }
  };
  
  if (jobIds) {
    matchQuery.job = { $in: jobIds };
  }
  
  return this.find(matchQuery)
    .populate('candidate', 'firstName lastName email')
    .populate('job', 'title company')
    .sort({ appliedDate: -1 });
};

// Middleware pre-save
applicationSchema.pre('save', function(next) {
  // Mettre à jour lastUpdate à chaque sauvegarde
  this.lastUpdate = new Date();
  
  // Calculer le score de correspondance si pas déjà fait
  if (this.matchScore === 0) {
    this.calculateMatchScore();
  }
  
  next();
});

// Middleware post-save pour notifications (optionnel)
applicationSchema.post('save', function(doc) {
  // Ici, vous pourriez envoyer des notifications
  console.log(`Candidature ${doc._id} sauvegardée avec statut: ${doc.status}`);
});

// Middleware pre-remove pour nettoyer les fichiers
applicationSchema.pre('remove', function(next) {
  const fs = require('fs');
  
  // Supprimer les fichiers uploadés
  const documentFields = ['cv', 'coverLetterFile', 'portfolio'];
  documentFields.forEach(field => {
    if (this.documents[field] && this.documents[field].path) {
      try {
        fs.unlinkSync(this.documents[field].path);
      } catch (err) {
        console.error(`Erreur lors de la suppression du fichier ${field}:`, err);
      }
    }
  });
  
  next();
});

module.exports = mongoose.model('Application', applicationSchema);