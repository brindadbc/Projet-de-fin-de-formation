const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Le titre du poste est requis'],
    trim: true,
    maxlength: [100, 'Le titre ne peut pas dépasser 100 caractères']
  },
  company: {
    type: String,
    required: [true, 'Le nom de l\'entreprise est requis'],
    trim: true,
    maxlength: [100, 'Le nom de l\'entreprise ne peut pas dépasser 100 caractères']
  },
  location: {
    type: String,
    required: [true, 'La localisation est requise'],
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Le type de contrat est requis'],
    enum: ['CDI', 'CDD', 'Freelance', 'Stage', 'Alternance'],
    default: 'CDI'
  },
  remote: {
    type: Boolean,
    default: false
  },
  salary: {
    min: {
      type: String,
      default: ''
    },
    max: {
      type: String,
      default: ''
    },
    currency: {
      type: String,
      enum: ['FCFA', 'EUR', 'USD', 'GBP'],
      default: 'FCFA'
    },
    period: {
      type: String,
      enum: ['year', 'month', 'day', 'hour'],
      default: 'year'
    }
  },
  experience: {
    type: String,
    enum: ['junior', 'intermediate', 'senior', 'lead'],
    default: 'intermediate'
  },
  education: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    required: [true, 'La description du poste est requise'],
    minlength: [10, 'La description doit contenir au moins 10 caractères']
  },
  requirements: [{
    type: String,
    trim: true
  }],
  benefits: [{
    type: String,
    trim: true
  }],
  skills: [{
    type: String,
    trim: true
  }],
  department: {
    type: String,
    default: ''
  },
  team_size: {
    type: String,
    default: ''
  },
  start_date: {
    type: Date
  },
  application_deadline: {
    type: Date
  },
  contact_email: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: 'Format d\'email invalide'
    }
  },
  questions: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['Actif', 'Fermé', 'Brouillon', 'En pause'],
    default: 'Actif'
  },
  recruiter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'L\'ID du recruteur est requis']
  },
  applicants: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  applications: [{
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    appliedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['Postulé', 'En cours', 'Accepté', 'Refusé'],
      default: 'Postulé'
    },
    coverLetter: {
      type: String
    },
    resume: {
      type: String
    }
  }]
}, {
  timestamps: true
});

// Index pour améliorer les performances de recherche
jobSchema.index({ title: 'text', description: 'text', company: 'text' });
jobSchema.index({ recruiter: 1, status: 1 });
jobSchema.index({ location: 1, type: 1 });
jobSchema.index({ createdAt: -1 });

// Méthode virtuelle pour formater le salaire
jobSchema.virtual('formattedSalary').get(function() {
  if (this.salary.min && this.salary.max) {
    return `${this.salary.min} - ${this.salary.max} ${this.salary.currency}`;
  } else if (this.salary.min) {
    return `${this.salary.min} ${this.salary.currency}`;
  } else if (this.salary.max) {
    return `${this.salary.max} ${this.salary.currency}`;
  }
  return 'Non spécifié';
});

// Middleware pour incrémenter le nombre de vues
jobSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Middleware pour ajouter une candidature
jobSchema.methods.addApplication = function(candidateId, applicationData) {
  this.applications.push({
    candidate: candidateId,
    ...applicationData
  });
  this.applicants = this.applications.length;
  return this.save();
};

// Méthode statique pour rechercher des emplois
jobSchema.statics.searchJobs = function(query) {
  const searchQuery = {};
  
  if (query.search) {
    searchQuery.$text = { $search: query.search };
  }
  
  if (query.location) {
    searchQuery.location = new RegExp(query.location, 'i');
  }
  
  if (query.type) {
    searchQuery.type = query.type;
  }
  
  if (query.status) {
    searchQuery.status = query.status;
  } else {
    searchQuery.status = 'Actif'; // Par défaut, ne montrer que les emplois actifs
  }
  
  return this.find(searchQuery)
    .populate('recruiter', 'name email')
    .sort({ createdAt: -1 });
};

// module.exports = mongoose.model('Job', jobSchema);
module.exports = mongoose.models.Job || mongoose.model('Job', jobSchema);