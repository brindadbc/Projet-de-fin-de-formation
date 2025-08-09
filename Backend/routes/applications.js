const express = require('express');
const router = express.Router();
const {
  uploadFiles,
  createApplication,
  getCandidateApplications,
  getRecruiterApplications,
  getApplicationById,
  updateApplicationStatus,
  addRecruiterNote,
  toggleFavorite,
  deleteApplication,
  getApplicationStats,
  downloadFile,
  checkRecruiterJobAccess
} = require('../controllers/applicationController');
const Application = require('../models/application');
const { protect, recruiterOnly, candidateOnly } = require('../middleware/auth');

// =============================================
// ROUTES DE DEBUG ET TEST
// =============================================
router.get('/:id/documents/debug', protect, async (req, res) => {
  try {
    console.log('🔍 === DIAGNOSTIC COMPLET DOCUMENT ===');
    
    const applicationId = req.params.id;
    
    // Vérifier l'ID
    if (!applicationId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        message: 'Format d\'ID de candidature invalide',
        applicationId
      });
    }

    const application = await Application.findById(applicationId)
      .populate('candidate', 'firstName lastName email')
      .populate('job', 'title company createdBy recruiter author owner');
    
    if (!application) {
      return res.status(404).json({ 
        message: 'Candidature non trouvée pour diagnostic',
        applicationId
      });
    }

    const documents = application.documents || {};
    const fs = require('fs');
    const path = require('path');

    const diagnostic = {
      applicationId,
      
      // Informations de base
      candidateName: `${application.candidate.firstName} ${application.candidate.lastName}`,
      jobTitle: application.job?.title || 'Non défini',
      
      // Permissions avec nouvelle logique
      userRole: req.user.role,
      userId: req.user.id,
      candidateId: application.candidate._id.toString(),
      isOwner: application.candidate._id.toString() === req.user.id,
      isRecruiter: ['recruiter', 'recruteur', 'admin'].includes((req.user.role || '').toLowerCase()),
      hasJobAccess: false, // Sera calculé
      
      // Documents dans la base
      documentsInDB: Object.keys(documents),
      documentsCount: Object.keys(documents).length,
      documentsDetails: {},
      
      // Vérification des fichiers physiques
      physicalFiles: {},
      
      // Issues détectées
      issues: [],
      recommendations: []
    };

    // Vérifier l'accès job pour les recruteurs
    if (diagnostic.isRecruiter) {
      diagnostic.hasJobAccess = await checkRecruiterJobAccess(req.user.id, application.job);
    }

    diagnostic.canAccess = diagnostic.isOwner || (diagnostic.isRecruiter && diagnostic.hasJobAccess);

    // Analyser chaque document
    Object.entries(documents).forEach(([docType, docInfo]) => {
      diagnostic.documentsDetails[docType] = {
        hasPath: !!docInfo.path,
        path: docInfo.path,
        filename: docInfo.filename,
        originalName: docInfo.originalName,
        mimetype: docInfo.mimetype,
        size: docInfo.size
      };

      // Vérifier l'existence physique
      if (docInfo.path) {
        let filePath = docInfo.path;
        
        // Résoudre le chemin
        if (!path.isAbsolute(filePath)) {
          filePath = path.resolve(process.cwd(), filePath);
        }

        const fileExists = fs.existsSync(filePath);
        let fileStats = null;
        
        if (fileExists) {
          try {
            fileStats = fs.statSync(filePath);
          } catch (err) {
            console.error('Erreur stats fichier:', err);
          }
        }

        diagnostic.physicalFiles[docType] = {
          expectedPath: filePath,
          exists: fileExists,
          stats: fileExists && fileStats ? {
            size: fileStats.size,
            isFile: fileStats.isFile(),
            created: fileStats.birthtime,
            modified: fileStats.mtime
          } : null
        };

        // Détecter les problèmes
        if (!fileExists) {
          diagnostic.issues.push(`Fichier physique manquant pour ${docType}: ${filePath}`);
          diagnostic.recommendations.push(`Vérifiez que le fichier ${docInfo.filename} existe dans le répertoire d'upload`);
        } else if (fileStats && fileStats.size === 0) {
          diagnostic.issues.push(`Fichier vide pour ${docType}`);
          diagnostic.recommendations.push(`Le fichier ${docInfo.filename} est vide et doit être re-uploadé`);
        }
      } else {
        diagnostic.issues.push(`Chemin manquant en base pour ${docType}`);
        diagnostic.recommendations.push(`Corrigez les données en base pour le document ${docType}`);
      }
    });

    // Vérifications générales
    if (Object.keys(documents).length === 0) {
      diagnostic.issues.push('Aucun document trouvé pour cette candidature');
      diagnostic.recommendations.push('Vérifiez que les documents ont été correctement uploadés lors de la candidature');
    }

    if (!diagnostic.canAccess) {
      diagnostic.issues.push('Permissions insuffisantes pour accéder aux documents');
      diagnostic.recommendations.push('Connectez-vous en tant que propriétaire de la candidature ou recruteur autorisé');
    }

    // Endpoints disponibles
    diagnostic.availableEndpoints = [
      `/applications/${applicationId}/documents/{fileType}`,
      `/applications/${applicationId}/download/{fileType}`,
      `/applications/my-applications/${applicationId}/documents/{fileType}` // Pour les candidats
    ];

    res.json(diagnostic);

  } catch (error) {
    res.status(500).json({
      message: 'Erreur lors du diagnostic',
      error: error.message,
      applicationId: req.params.id
    });
  }
});

// Route de test général
router.get('/test', (req, res) => {
  res.json({
    message: 'API Applications fonctionnelle',
    timestamp: new Date().toISOString(),
    endpoints: [
      'GET /api/applications/recruiter - Candidatures pour recruteur',
      'GET /api/applications/my-applications - Candidatures du candidat',
      'POST /api/applications - Créer une candidature',
      'GET /api/applications/:id/documents/:fileType - Télécharger un document',
      'GET /api/applications/:id/download/:fileType - Télécharger un document (alternatif)'
    ]
  });
});

// Route de test avec authentification
router.get('/test-auth', protect, (req, res) => {
  res.json({
    message: 'Authentification OK',
    user: {
      id: req.user.id,
      role: req.user.role,
      email: req.user.email
    },
    timestamp: new Date().toISOString()
  });
});

// =============================================
// ROUTES PRINCIPALES
// =============================================

// 1. CANDIDATURES - Récupération
router.get('/recruiter', protect, recruiterOnly, getRecruiterApplications);
router.get('/my-applications', protect, candidateOnly, getCandidateApplications);

// 2. CANDIDATURES - Actions
router.post('/', protect, candidateOnly, uploadFiles, createApplication);
router.get('/:id', protect, getApplicationById);
router.delete('/:id', protect, candidateOnly, deleteApplication);

// 3. STATUT ET NOTES
router.put('/:id/status', protect, recruiterOnly, updateApplicationStatus);
router.post('/:id/notes', protect, recruiterOnly, addRecruiterNote);
router.put('/:id/favorite', protect, recruiterOnly, toggleFavorite);

// 4. STATISTIQUES
router.get('/stats', protect, recruiterOnly, getApplicationStats);

// =============================================
// ROUTES DE TÉLÉCHARGEMENT - VERSION TOTALEMENT CORRIGÉE
// =============================================

// Middleware de vérification des permissions unifié
const checkDocumentPermissions = async (req, res, next) => {
  try {
    const applicationId = req.params.id;
    const fileType = req.params.fileType;

    console.log('🔐 === VÉRIFICATION PERMISSIONS UNIFIÉE ===');
    console.log('Paramètres:', { applicationId, fileType, userId: req.user.id, userRole: req.user.role });

    // Récupérer la candidature avec toutes les informations nécessaires
    const application = await Application.findById(applicationId)
      .populate('candidate', 'firstName lastName email')
      .populate('job', 'title company createdBy recruiter author owner');

    if (!application) {
      return res.status(404).json({
        message: 'Candidature non trouvée',
        applicationId,
        code: 'APPLICATION_NOT_FOUND'
      });
    }

    console.log('✅ Candidature trouvée:', {
      id: application._id,
      candidateId: application.candidate._id,
      candidateName: `${application.candidate.firstName} ${application.candidate.lastName}`,
      jobId: application.job._id
    });

    // Vérifications des permissions
    const userId = req.user.id.toString();
    const candidateId = application.candidate._id.toString();
    
    // 1. Vérifier si c'est le propriétaire
    const isOwner = candidateId === userId;
    
    // 2. Vérifier si c'est un recruteur
    const userRole = (req.user.role || '').toLowerCase();
    const userType = (req.user.userType || '').toLowerCase();
    const isRecruiter = ['recruiter', 'recruteur', 'admin', 'administrateur'].includes(userRole) || 
                       ['recruiter', 'recruteur', 'admin', 'administrateur'].includes(userType);
    
    // 3. Si recruteur, vérifier l'accès au job
    let hasJobAccess = false;
    if (isRecruiter) {
      hasJobAccess = await checkRecruiterJobAccess(req.user.id, application.job);
    }

    const canAccess = isOwner || (isRecruiter && hasJobAccess);

    console.log('🔍 Résultat permissions:', {
      isOwner,
      isRecruiter,
      hasJobAccess,
      canAccess,
      userRole: req.user.role
    });

    if (!canAccess) {
      console.error('❌ Accès refusé:', {
        reason: !isOwner ? 
                (!isRecruiter ? 'Ni propriétaire ni recruteur' : `Recruteur sans accès au job ${application.job._id}`) :
                'Raison inconnue'
      });

      return res.status(403).json({
        message: 'Permissions insuffisantes pour accéder à ce document',
        code: 'INSUFFICIENT_PERMISSIONS',
        debug: {
          isOwner,
          isRecruiter,
          hasJobAccess,
          userRole: req.user.role,
          candidateId,
          userId,
          jobId: application.job._id
        }
      });
    }

    console.log('✅ Permissions validées avec succès');

    // Stocker les informations dans req pour les utiliser dans downloadFile
    req.applicationData = {
      application,
      isOwner,
      isRecruiter,
      hasJobAccess
    };

    next();

  } catch (error) {
    console.error('💥 Erreur dans checkDocumentPermissions:', error);
    res.status(500).json({
      message: 'Erreur lors de la vérification des permissions',
      error: error.message,
      code: 'PERMISSION_CHECK_ERROR'
    });
  }
};

// Route principale de téléchargement (pour tous les utilisateurs)
router.get('/:id/documents/:fileType', protect, checkDocumentPermissions, downloadFile);

// Route alternative de téléchargement
router.get('/:id/download/:fileType', protect, checkDocumentPermissions, downloadFile);

// Route spécifique pour les candidats (leurs propres documents) - maintenant redondante mais gardée pour compatibilité
router.get('/my-applications/:id/documents/:fileType', protect, candidateOnly, async (req, res, next) => {
  console.log('📥 === ROUTE CANDIDAT SPÉCIFIQUE ===');
  
  try {
    const application = await Application.findById(req.params.id);
    
    if (!application) {
      return res.status(404).json({ 
        message: 'Candidature non trouvée',
        applicationId: req.params.id 
      });
    }

    // Vérifier que la candidature appartient bien au candidat connecté
    if (application.candidate.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        message: 'Vous ne pouvez télécharger que vos propres documents',
        applicationId: req.params.id,
        candidateId: application.candidate,
        userId: req.user.id
      });
    }

    console.log('✅ Propriété vérifiée pour le candidat');
    
    // Continuer vers downloadFile
    next();

  } catch (error) {
    console.error('❌ Erreur vérification propriété candidature:', error);
    res.status(500).json({
      message: 'Erreur lors de la vérification des permissions',
      error: error.message,
      applicationId: req.params.id
    });
  }
}, downloadFile);

// Route de diagnostic pour les téléchargements
router.get('/:id/documents/:fileType/debug', protect, async (req, res) => {
  try {
    console.log('🔍 === DIAGNOSTIC TÉLÉCHARGEMENT ===');
    
    const application = await Application.findById(req.params.id)
      .populate('candidate', 'firstName lastName email')
      .populate('job', 'title company createdBy recruiter author owner');
    
    if (!application) {
      return res.status(404).json({ 
        message: 'Candidature non trouvée pour diagnostic',
        applicationId: req.params.id 
      });
    }

    const fileType = req.params.fileType;
    const documents = application.documents || {};
    
    // Mapping des types de fichiers
    const fileTypeMapping = {
      'cv': 'cv',
      'CV': 'cv',
      'coverLetter': 'coverLetterFile',
      'coverLetterFile': 'coverLetterFile',
      'lettre': 'coverLetterFile',
      'portfolio': 'portfolio'
    };

    const normalizedFileType = fileTypeMapping[fileType] || fileType.toLowerCase();
    const fileInfo = documents[normalizedFileType];

    const fs = require('fs');
    let fileExists = false;
    let filePath = null;
    let fileStats = null;

    if (fileInfo && fileInfo.path) {
      filePath = fileInfo.path;
      try {
        fileExists = fs.existsSync(filePath);
        if (fileExists) {
          fileStats = fs.statSync(filePath);
        }
      } catch (err) {
        console.error('Erreur vérification fichier:', err);
      }
    }

    // Vérifier les permissions avec la nouvelle logique
    const isOwner = application.candidate._id.toString() === req.user.id;
    const isRecruiter = ['recruiter', 'recruteur', 'admin'].includes((req.user.role || '').toLowerCase());
    let hasJobAccess = false;
    
    if (isRecruiter) {
      hasJobAccess = await checkRecruiterJobAccess(req.user.id, application.job);
    }

    const diagnostic = {
      applicationId: req.params.id,
      requestedFileType: fileType,
      normalizedFileType: normalizedFileType,
      
      // Permissions avec nouvelle logique
      userRole: req.user.role,
      userId: req.user.id,
      candidateId: application.candidate._id.toString(),
      isOwner,
      isRecruiter,
      hasJobAccess,
      
      // Documents dans la base
      documentsInDB: Object.keys(documents),
      requestedDocumentExists: !!fileInfo,
      documentInfo: fileInfo || null,
      
      // Fichier physique
      expectedFilePath: filePath,
      fileExistsOnDisk: fileExists,
      fileStats: fileExists ? {
        size: fileStats.size,
        created: fileStats.birthtime,
        modified: fileStats.mtime
      } : null,
      
      // Diagnostic
      canAccess: isOwner || (isRecruiter && hasJobAccess),
      issues: [],
      recommendations: []
    };

    // Identifier les problèmes
    if (!fileInfo) {
      diagnostic.issues.push(`Document "${fileType}" non trouvé dans la base de données`);
      diagnostic.recommendations.push('Vérifiez que le document a été téléchargé lors de la candidature');
    }

    if (fileInfo && !fileExists) {
      diagnostic.issues.push('Document présent en base mais fichier physique manquant');
      diagnostic.recommendations.push('Vérifiez l\'intégrité des fichiers uploadés');
    }

    if (!diagnostic.canAccess) {
      diagnostic.issues.push('Permissions insuffisantes');
      diagnostic.recommendations.push('Connectez-vous en tant que propriétaire ou recruteur autorisé');
    }

    res.json(diagnostic);

  } catch (error) {
    res.status(500).json({
      message: 'Erreur lors du diagnostic',
      error: error.message,
      applicationId: req.params.id,
      fileType: req.params.fileType
    });
  }
});

// =============================================
// ROUTES DE TEST ET VALIDATION
// =============================================

// Route de test des permissions
router.get('/:id/permissions/test', protect, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('candidate', 'firstName lastName email')
      .populate('job', 'title company createdBy recruiter author owner');
    
    if (!application) {
      return res.status(404).json({ message: 'Candidature non trouvée' });
    }

    const isOwner = application.candidate._id.toString() === req.user.id;
    const isRecruiter = ['recruiter', 'recruteur', 'admin'].includes((req.user.role || '').toLowerCase());
    let hasJobAccess = false;
    
    if (isRecruiter) {
      hasJobAccess = await checkRecruiterJobAccess(req.user.id, application.job);
    }

    res.json({
      applicationId: req.params.id,
      user: {
        id: req.user.id,
        role: req.user.role,
        company: req.user.company
      },
      application: {
        candidateId: application.candidate._id,
        candidateName: `${application.candidate.firstName} ${application.candidate.lastName}`,
        jobId: application.job._id,
        jobTitle: application.job.title,
        jobCreatedBy: application.job.createdBy,
        jobRecruiter: application.job.recruiter
      },
      permissions: {
        isOwner,
        isRecruiter,
        hasJobAccess,
        canAccess: isOwner || (isRecruiter && hasJobAccess)
      },
      availableDocuments: Object.keys(application.documents || {}),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    res.status(500).json({
      message: 'Erreur lors du test des permissions',
      error: error.message
    });
  }
});

// Route de santé globale
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Applications API',
    timestamp: new Date().toISOString(),
    version: '2.0.0-corrected',
    features: {
      permissions: 'Enhanced with job access validation',
      download: 'Multi-endpoint with fallback support',
      debug: 'Comprehensive diagnostics available'
    }
  });
});

module.exports = router;

