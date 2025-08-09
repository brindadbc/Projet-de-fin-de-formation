const Application = require('../models/application');
const Job = require('../models/job');
const User = require('../models/user');
const multer = require('multer');
const path = require('path');
const fs = require('fs');


// ==============================================
// CONFIGURATION MULTER (UPLOAD DE FICHIERS)
// ==============================================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = 'uploads/applications/';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Type de fichier non autorisé'));
    }
  }
});

const uploadFiles = upload.fields([
  { name: 'cv', maxCount: 1 },
  { name: 'coverLetterFile', maxCount: 1 },
  { name: 'portfolio', maxCount: 1 }
]);

// ==============================================
// FONCTIONS UTILITAIRES
// ==============================================
const formatSalary = (salary) => {
  if (!salary) return 'Non spécifié';
  
  if (typeof salary === 'object') {
    if (salary.min && salary.max) {
      return `${salary.min} - ${salary.max} ${salary.currency || 'FCFA'}`;
    } else if (salary.min) {
      return `À partir de ${salary.min} ${salary.currency || 'FCFA'}`;
    } else if (salary.max) {
      return `Jusqu'à ${salary.max} ${salary.currency || 'FCFA'}`;
    }
  }
  return typeof salary === 'string' ? salary : 'Non spécifié';
};

const calculateMatchScore = (candidateSkills, jobSkills, additionalInfo = {}) => {
  try {
    let score = 50; // Score de base

    // Correspondance des compétences (40% du score)
    if (Array.isArray(jobSkills) && Array.isArray(candidateSkills) && jobSkills.length > 0) {
      const jobSkillsLower = jobSkills.map(s => s.toLowerCase());
      const candidateSkillsLower = candidateSkills.map(s => s.toLowerCase());
      const matchingSkills = jobSkillsLower.filter(skill => candidateSkillsLower.includes(skill));
      score += (matchingSkills.length / jobSkills.length) * 40;
    }

    // Expérience (20% du score)
    if (additionalInfo.experience && additionalInfo.experience !== 'Non spécifiée') {
      score += 20;
    }

    // Lettre de motivation (10% du score)
    if (additionalInfo.coverLetter && additionalInfo.coverLetter.length > 100) {
      score += 10;
    }

    // Disponibilité (10% du score)
    if (additionalInfo.availability && additionalInfo.availability !== 'Non spécifiée') {
      score += 10;
    }

    return Math.min(Math.round(score), 100);
  } catch (error) {
    console.error('Erreur calcul score:', error);
    return 75; // Score par défaut
  }
};

// ==============================================
// FONCTION DE VÉRIFICATION DES PERMISSIONS RECRUTEUR - CORRIGÉE
// ==============================================
const checkRecruiterJobAccess = async (recruiterId, job) => {
  try {
    console.log('🔍 Vérification accès job recruteur:', {
      recruiterId: recruiterId.toString(),
      jobId: job._id.toString(),
      jobCreatedBy: job.createdBy?.toString(),
      jobRecruiter: job.recruiter?.toString(),
      jobAuthor: job.author?.toString(),
      jobOwner: job.owner?.toString(),
      jobCompany: job.company?.toString()
    });

    const recruiterIdStr = recruiterId.toString();

    // 1. Vérifier les champs directs du job
    const directAccess = (
      (job.createdBy && job.createdBy.toString() === recruiterIdStr) ||
      (job.recruiter && job.recruiter.toString() === recruiterIdStr) ||
      (job.author && job.author.toString() === recruiterIdStr) ||
      (job.owner && job.owner.toString() === recruiterIdStr)
    );

    if (directAccess) {
      console.log('✅ Accès direct accordé via champs job');
      return true;
    }

    // 2. Vérifier via l'entreprise
    if (job.company) {
      const recruiter = await User.findById(recruiterId).select('company');
      if (recruiter && recruiter.company && recruiter.company.toString() === job.company.toString()) {
        console.log('✅ Accès accordé via entreprise');
        return true;
      }
    }

    // 3. Recherche étendue dans tous les jobs créés par ce recruteur
    const jobsByRecruiter = await Job.findOne({
      _id: job._id,
      $or: [
        { createdBy: recruiterId },
        { recruiter: recruiterId },
        { author: recruiterId },
        { owner: recruiterId }
      ]
    });

    if (jobsByRecruiter) {
      console.log('✅ Accès accordé via recherche étendue');
      return true;
    }

    console.log('❌ Aucun accès trouvé pour ce recruteur');
    return false;
  } catch (error) {
    console.error('❌ Erreur vérification accès job:', error);
    return false;
  }
};

// ==============================================
// CONTRÔLEUR DE TÉLÉCHARGEMENT CORRIGÉ
// ==============================================
const downloadFile = async (req, res, next) => {
  console.log('📥 === CONTRÔLEUR TÉLÉCHARGEMENT CORRIGÉ ===');
  console.log('Paramètres reçus:', {
    applicationId: req.params.id,
    fileType: req.params.fileType,
    userId: req.user?.id,
    userRole: req.user?.role,
    userType: req.user?.userType
  });

  try {
    const { id: applicationId, fileType } = req.params;

    // Validation des paramètres
    if (!applicationId) {
      return res.status(400).json({
        message: 'ID de candidature manquant',
        code: 'MISSING_APPLICATION_ID'
      });
    }

    if (!fileType) {
      return res.status(400).json({
        message: 'Type de fichier manquant',
        code: 'MISSING_FILE_TYPE'
      });
    }

    // Récupération de la candidature avec population complète
    const application = await Application.findById(applicationId)
      .populate('candidate', 'firstName lastName email')
      .populate('job', 'title company createdBy recruiter author owner');

    if (!application) {
      console.error(`❌ Candidature ${applicationId} non trouvée`);
      return res.status(404).json({
        message: 'Candidature non trouvée',
        applicationId,
        code: 'APPLICATION_NOT_FOUND'
      });
    }

    console.log('✅ Candidature trouvée:', {
      id: application._id,
      candidateId: application.candidate._id,
      candidateName: `${application.candidate.firstName || 'N/A'} ${application.candidate.lastName || 'N/A'}`,
      jobId: application.job._id,
      hasDocuments: !!application.documents,
      documentsCount: application.documents ? Object.keys(application.documents).length : 0
    });

    // ==========================================
    // VÉRIFICATION DES PERMISSIONS - VERSION TOTALEMENT CORRIGÉE
    // ==========================================
    const userId = req.user.id.toString();
    const candidateId = application.candidate._id.toString();
    
    // 1. Vérifier si c'est le propriétaire de la candidature
    const isOwner = candidateId === userId;
    
    // 2. Vérifier si c'est un recruteur avec tous les variants possibles
    const userRole = (req.user.role || '').toLowerCase();
    const userType = (req.user.userType || '').toLowerCase();
    
    const isRecruiter = ['recruiter', 'recruteur', 'admin', 'administrateur'].includes(userRole) || 
                       ['recruiter', 'recruteur', 'admin', 'administrateur'].includes(userType);
    
    // 3. Si c'est le propriétaire, accès direct
    if (isOwner) {
      console.log('✅ Accès accordé - Propriétaire de la candidature');
    }
    // 4. Si c'est un recruteur, vérifier l'accès au job
    else if (isRecruiter) {
      console.log('🔍 Utilisateur identifié comme recruteur, vérification accès job...');
      
      const hasJobAccess = await checkRecruiterJobAccess(req.user.id, application.job);
      
      if (!hasJobAccess) {
        console.error('❌ Recruteur sans accès au job:', {
          recruiterId: userId,
          jobId: application.job._id,
          jobCreatedBy: application.job.createdBy,
          jobRecruiter: application.job.recruiter
        });
        
        return res.status(403).json({
          message: 'Vous n\'avez pas accès aux documents de cette candidature. Seuls les recruteurs ayant créé l\'offre d\'emploi peuvent télécharger les documents.',
          code: 'RECRUITER_NO_JOB_ACCESS',
          debug: {
            isRecruiter: true,
            hasJobAccess: false,
            jobId: application.job._id,
            recruiterId: userId
          }
        });
      }
      
      console.log('✅ Accès accordé - Recruteur avec accès au job');
    }
    // 5. Sinon, accès refusé
    else {
      console.error('❌ Accès refusé - Ni propriétaire ni recruteur:', {
        isOwner,
        isRecruiter,
        userRole: req.user.role,
        userType: req.user.userType,
        candidateId,
        userId
      });

      return res.status(403).json({
        message: 'Permissions insuffisantes pour accéder à ce document. Vous devez être le candidat propriétaire ou un recruteur autorisé.',
        code: 'INSUFFICIENT_PERMISSIONS',
        debug: {
          isOwner,
          isRecruiter,
          userRole: req.user.role,
          candidateId,
          userId
        }
      });
    }

    console.log('✅ Permissions validées avec succès');

    // Mapping des types de fichiers
    const fileTypeMapping = {
      'cv': 'cv',
      'CV': 'cv',
      'coverLetter': 'coverLetterFile',
      'coverLetterFile': 'coverLetterFile',
      'lettre': 'coverLetterFile',
      'lettre_motivation': 'coverLetterFile',
      'cover': 'coverLetterFile',
      'portfolio': 'portfolio'
    };

    const normalizedFileType = fileTypeMapping[fileType] || fileType.toLowerCase();
    console.log(`📋 Type de fichier normalisé: ${fileType} -> ${normalizedFileType}`);

    // Vérification de l'existence du document dans la base
    if (!application.documents || !application.documents[normalizedFileType]) {
      console.error(`❌ Document "${normalizedFileType}" non trouvé dans la base:`, {
        availableDocuments: application.documents ? Object.keys(application.documents) : [],
        requestedType: normalizedFileType
      });

      return res.status(404).json({
        message: `Document "${fileType}" non trouvé pour cette candidature`,
        availableDocuments: application.documents ? Object.keys(application.documents) : [],
        requestedType: normalizedFileType,
        code: 'DOCUMENT_NOT_IN_DB'
      });
    }

    const documentInfo = application.documents[normalizedFileType];
    console.log('📄 Informations du document:', documentInfo);

    if (!documentInfo.path) {
      return res.status(404).json({
        message: 'Chemin du fichier manquant dans la base de données',
        code: 'MISSING_FILE_PATH'
      });
    }

    // Vérification de l'existence physique du fichier
    let filePath = documentInfo.path;
    
    // Si le chemin est relatif, le résoudre par rapport au répertoire du projet
    if (!path.isAbsolute(filePath)) {
      filePath = path.resolve(process.cwd(), filePath);
    }

    console.log('🔍 Vérification du fichier:', filePath);

    if (!fs.existsSync(filePath)) {
      console.error(`❌ Fichier physique non trouvé: ${filePath}`);
      
      // Essayer des chemins alternatifs
      const alternativePaths = [
        path.join(process.cwd(), 'uploads', documentInfo.filename || `${applicationId}_${normalizedFileType}`),
        path.join(process.cwd(), 'public/uploads', documentInfo.filename || `${applicationId}_${normalizedFileType}`),
        path.join(__dirname, '../uploads', documentInfo.filename || `${applicationId}_${normalizedFileType}`),
        documentInfo.originalPath || documentInfo.path
      ];

      let foundPath = null;
      for (const altPath of alternativePaths) {
        if (fs.existsSync(altPath)) {
          foundPath = altPath;
          console.log(`✅ Fichier trouvé dans chemin alternatif: ${foundPath}`);
          break;
        }
      }

      if (!foundPath) {
        return res.status(404).json({
          message: 'Fichier physique non trouvé sur le serveur',
          originalPath: documentInfo.path,
          resolvedPath: filePath,
          alternativesPaths: alternativePaths,
          code: 'PHYSICAL_FILE_NOT_FOUND'
        });
      }

      filePath = foundPath;
    }

    // Obtenir les informations du fichier
    const fileStats = fs.statSync(filePath);
    console.log('📊 Statistiques du fichier:', {
      size: fileStats.size,
      created: fileStats.birthtime,
      modified: fileStats.mtime
    });

    if (fileStats.size === 0) {
      return res.status(404).json({
        message: 'Le fichier existe mais est vide',
        filePath,
        code: 'EMPTY_FILE'
      });
    }

    // Déterminer le type MIME
    const mimeTypes = {
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png'
    };

    const fileExtension = path.extname(filePath).toLowerCase();
    const mimeType = documentInfo.mimetype || 
                     mimeTypes[fileExtension] || 
                     'application/octet-stream';

    // Générer un nom de fichier pour le téléchargement
    const candidateName = `${application.candidate.firstName || 'Candidat'}_${application.candidate.lastName || 'Inconnu'}`;
    const sanitizedName = candidateName.replace(/[^a-zA-Z0-9_-]/g, '_');
    
    const fileTypeNames = {
      'cv': 'CV',
      'coverLetterFile': 'Lettre_motivation',
      'portfolio': 'Portfolio'
    };
    
    const fileTypeName = fileTypeNames[normalizedFileType] || normalizedFileType;
    const downloadFileName = documentInfo.originalName || 
                            `${fileTypeName}_${sanitizedName}${fileExtension}`;

    console.log(`📤 Préparation de l'envoi:`, {
      filePath,
      mimeType,
      downloadFileName,
      fileSize: fileStats.size
    });

    // Headers de réponse
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Length', fileStats.size);
    res.setHeader('Content-Disposition', `attachment; filename="${downloadFileName}"`);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    // Envoi du fichier
    const fileStream = fs.createReadStream(filePath);
    
    fileStream.on('error', (streamError) => {
      console.error('❌ Erreur lors de la lecture du fichier:', streamError);
      if (!res.headersSent) {
        res.status(500).json({
          message: 'Erreur lors de la lecture du fichier',
          error: streamError.message,
          code: 'FILE_STREAM_ERROR'
        });
      }
    });

    fileStream.on('end', () => {
      console.log('✅ Fichier envoyé avec succès');
    });

    // Log de l'activité
    console.log(`📥 Téléchargement initié:`, {
      user: isOwner ? 'Candidat' : 'Recruteur',
      userId: req.user.id,
      applicationId,
      fileType: normalizedFileType,
      fileName: downloadFileName,
      timestamp: new Date().toISOString()
    });

    fileStream.pipe(res);

  } catch (error) {
    console.error('💥 Erreur fatale dans downloadFile:', error);
    
    if (!res.headersSent) {
      res.status(500).json({
        message: 'Erreur interne du serveur',
        error: error.message,
        code: 'INTERNAL_SERVER_ERROR',
        applicationId: req.params.id,
        fileType: req.params.fileType
      });
    }
  }
};

// ==============================================
// CONTROLEURS PRINCIPAUX (inchangés pour la plupart)
// ==============================================

// 1. CRÉATION DE CANDIDATURE
const createApplication = async (req, res) => {
  try {
    console.log('=== CRÉATION CANDIDATURE ===');
    console.log('User ID:', req.user.id);
    console.log('Body reçu:', req.body);
    console.log('Files reçus:', req.files ? Object.keys(req.files) : 'Aucun fichier');

    // Parser les données JSON
    let personalInfo, additionalInfo, customAnswers;
    try {
      personalInfo = typeof req.body.personalInfo === 'string' 
        ? JSON.parse(req.body.personalInfo) 
        : req.body.personalInfo;
        
      additionalInfo = req.body.additionalInfo 
        ? (typeof req.body.additionalInfo === 'string' 
           ? JSON.parse(req.body.additionalInfo) 
           : req.body.additionalInfo)
        : {};
        
      customAnswers = req.body.customAnswers 
        ? (typeof req.body.customAnswers === 'string' 
           ? JSON.parse(req.body.customAnswers) 
           : req.body.customAnswers)
        : [];
    } catch (parseError) {
      console.error('Erreur de parsing:', parseError);
      return res.status(400).json({ 
        message: 'Format de données invalide',
        error: parseError.message 
      });
    }

    // Validations
    if (!req.body.jobId) {
      return res.status(400).json({ message: 'ID du poste requis' });
    }

    if (!personalInfo || !personalInfo.firstName?.trim() || !personalInfo.lastName?.trim()) {
      return res.status(400).json({ message: 'Prénom et nom requis' });
    }

    if (!personalInfo.email?.trim()) {
      return res.status(400).json({ message: 'Email requis' });
    }

    if (!personalInfo.phone?.trim()) {
      return res.status(400).json({ message: 'Téléphone requis' });
    }

    if (!req.files?.cv) {
      return res.status(400).json({ message: 'CV requis' });
    }

    // Vérifier que l'emploi existe
    const job = await Job.findById(req.body.jobId);
    if (!job) {
      return res.status(404).json({ message: 'Emploi non trouvé' });
    }

    // Vérifier candidature existante
    const existingApplication = await Application.findOne({
      candidate: req.user.id,
      job: req.body.jobId
    });

    if (existingApplication) {
      return res.status(409).json({ 
        message: 'Vous avez déjà postulé pour ce poste' 
      });
    }

    // Préparer les documents
    const documents = {};
    if (req.files.cv) {
      documents.cv = {
        filename: req.files.cv[0].filename,
        originalName: req.files.cv[0].originalname,
        path: req.files.cv[0].path,
        mimetype: req.files.cv[0].mimetype,
        size: req.files.cv[0].size,
        uploadDate: new Date()
      };
    }
    if (req.files.coverLetterFile) {
      documents.coverLetterFile = {
        filename: req.files.coverLetterFile[0].filename,
        originalName: req.files.coverLetterFile[0].originalname,
        path: req.files.coverLetterFile[0].path,
        mimetype: req.files.coverLetterFile[0].mimetype,
        size: req.files.coverLetterFile[0].size,
        uploadDate: new Date()
      };
    }
    if (req.files.portfolio) {
      documents.portfolio = {
        filename: req.files.portfolio[0].filename,
        originalName: req.files.portfolio[0].originalname,
        path: req.files.portfolio[0].path,
        mimetype: req.files.portfolio[0].mimetype,
        size: req.files.portfolio[0].size,
        uploadDate: new Date()
      };
    }

    // Créer la candidature
    const application = new Application({
      candidate: req.user.id,
      job: req.body.jobId,
      personalInfo: {
        firstName: personalInfo.firstName.trim(),
        lastName: personalInfo.lastName.trim(),
        email: personalInfo.email.trim(),
        phone: personalInfo.phone.trim(),
        address: personalInfo.address?.trim() || ''
      },
      documents,
      coverLetter: req.body.coverLetter?.trim() || '',
      additionalInfo: {
        experience: additionalInfo.experience || '',
        motivation: additionalInfo.motivation || '',
        availability: additionalInfo.availability || '',
        expectedSalary: additionalInfo.expectedSalary || '',
        portfolioUrl: additionalInfo.portfolioUrl || '',
        linkedinUrl: additionalInfo.linkedinUrl || '',
        skills: additionalInfo.skills || []
      },
      customAnswers: Array.isArray(customAnswers) ? customAnswers : [],
      status: 'new',
      appliedDate: new Date(),
      lastUpdate: new Date(),
      statusHistory: [{
        status: 'new',
        changedBy: req.user.id,
        changedAt: new Date(),
        note: 'Candidature soumise'
      }]
    });

    await application.save();

    // Peupler pour la réponse
    await application.populate([
      { path: 'candidate', select: 'firstName lastName email' },
      { path: 'job', select: 'title company location type salary' }
    ]);

    res.status(201).json({
      message: 'Candidature créée avec succès',
      applicationId: application._id,
      application: {
        id: application._id,
        status: application.status,
        appliedDate: application.appliedDate,
        job: {
          title: application.job.title,
          company: application.job.company
        }
      }
    });

  } catch (error) {
    console.error('❌ Erreur création candidature:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      
      return res.status(400).json({
        message: 'Erreur de validation',
        errors
      });
    }
    
    res.status(500).json({ 
      message: 'Erreur serveur lors de la création de la candidature',
      error: error.message 
    });
  }
};

// 2. RÉCUPÉRATION DES CANDIDATURES (CANDIDAT)
const getCandidateApplications = async (req, res) => {
  try {
    console.log('=== CANDIDATURES CANDIDAT ===');
    console.log('User ID:', req.user.id);
    
    const { status, sortBy = 'appliedDate', order = 'desc' } = req.query;
    
    const filter = { candidate: req.user.id };
    if (status && status !== 'all') {
      filter.status = status;
    }

    const sortOptions = {};
    sortOptions[sortBy] = order === 'desc' ? -1 : 1;

    const applications = await Application.find(filter)
      .populate({
        path: 'job',
        select: 'title company location type salary remote postedDate description requirements skills questions',
        populate: {
          path: 'company',
          select: 'name logo'
        }
      })
      .sort(sortOptions);

    const formattedApplications = applications.map(app => {
      const jobInfo = app.job || {};
      
      return {
        id: app._id,
        jobId: app.job?._id,
        company: jobInfo.company?.name || jobInfo.company || 'Entreprise non spécifiée',
        companyLogo: jobInfo.company?.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(jobInfo.company?.name || 'E')}&background=667eea&color=fff`,
        position: jobInfo.title || 'Poste non spécifié',
        location: jobInfo.location || 'Localisation non spécifiée',
        salary: formatSalary(jobInfo.salary),
        type: jobInfo.type || 'Non spécifié',
        remote: jobInfo.remote || false,
        status: app.status,
        appliedDate: app.appliedDate?.toLocaleDateString('fr-FR') || 'Date inconnue',
        lastUpdate: app.lastUpdate?.toLocaleDateString('fr-FR') || 'Date inconnue',
        description: jobInfo.description || 'Description non disponible',
        requirements: jobInfo.requirements || [],
        skills: jobInfo.skills || [],
        questions: jobInfo.questions || [],
        coverLetter: app.coverLetter || '',
        documents: app.documents || {},
        customAnswers: app.customAnswers || [],
        statusHistory: app.statusHistory || []
      };
    });

    res.json(formattedApplications);

  } catch (error) {
    console.error('❌ Erreur candidatures candidat:', error);
    res.status(500).json({ 
      message: 'Erreur serveur lors de la récupération des candidatures',
      error: error.message 
    });
  }
};

// 3. RÉCUPÉRATION DES CANDIDATURES (RECRUTEUR)
const getRecruiterApplications = async (req, res) => {
  try {
    console.log('=== CANDIDATURES RECRUTEUR ===');
    console.log('User ID:', req.user.id);
    console.log('User Role:', req.user.role);
    console.log('User Company:', req.user.company);
    
    const { 
      status, 
      jobId, 
      search, 
      experience,
      location,
      sortBy = 'appliedDate', 
      order = 'desc',
      page = 1,
      limit = 50
    } = req.query;

    console.log('Paramètres de requête:', { status, jobId, search, experience, location, sortBy, order, page, limit });

    // Étape 1: Recherche des jobs du recruteur - VERSION ÉLARGIE
    const jobQuery = {
      $or: [
        { createdBy: req.user.id },
        { recruiter: req.user.id },
        { author: req.user.id },
        { owner: req.user.id }
      ]
    };

    if (req.user.company) {
      jobQuery.$or.push({ company: req.user.company });
    }

    console.log('Job query:', JSON.stringify(jobQuery, null, 2));

    const recruiterJobs = await Job.find(jobQuery).select('_id title company location type salary description requirements skills');
    console.log(`Jobs trouvés: ${recruiterJobs.length}`);
    
    if (recruiterJobs.length === 0) {
      console.log('⚠️ AUCUN JOB TROUVÉ pour ce recruteur');
      return res.json({
        applications: [],
        total: 0,
        pagination: {
          total: 0,
          page: parseInt(page),
          pages: 0,
          limit: parseInt(limit)
        },
        jobs: [],
        filters: { status, jobId, search, experience, location, sortBy, order },
        message: 'Aucune offre d\'emploi trouvée. Créez d\'abord des offres pour recevoir des candidatures.',
        debug: {
          userId: req.user.id,
          userRole: req.user.role,
          userCompany: req.user.company,
          jobQuery: jobQuery
        }
      });
    }

    const jobIds = recruiterJobs.map(job => job._id);
    console.log('Job IDs:', jobIds.map(id => id.toString()));

    // Étape 2: Construction du filtre candidatures
    const applicationFilter = { job: { $in: jobIds } };
    
    if (status && status !== 'all') {
      applicationFilter.status = status;
    }

    if (jobId && jobIds.some(id => id.toString() === jobId)) {
      applicationFilter.job = jobId;
    }

    if (experience) {
      applicationFilter['additionalInfo.experience'] = { $regex: experience, $options: 'i' };
    }

    if (location && location.trim()) {
      applicationFilter.$or = [
        { 'personalInfo.address': { $regex: location.trim(), $options: 'i' } },
        { 'additionalInfo.location': { $regex: location.trim(), $options: 'i' } }
      ];
    }

    if (search && search.trim()) {
      const searchTerm = search.trim();
      applicationFilter.$or = applicationFilter.$or || [];
      applicationFilter.$or.push(
        { 'personalInfo.firstName': { $regex: searchTerm, $options: 'i' } },
        { 'personalInfo.lastName': { $regex: searchTerm, $options: 'i' } },
        { 'personalInfo.email': { $regex: searchTerm, $options: 'i' } }
      );
    }

    console.log('Filtre candidatures:', JSON.stringify(applicationFilter, null, 2));

    // Étape 3: Agrégation avec toutes les informations
    const pipeline = [
      { $match: applicationFilter },
      {
        $lookup: {
          from: 'users',
          localField: 'candidate',
          foreignField: '_id',
          as: 'candidateInfo',
          pipeline: [
            {
              $project: {
                firstName: 1,
                lastName: 1,
                email: 1,
                phone: 1,
                avatar: 1,
                skills: 1,
                experience: 1,
                location: 1
              }
            }
          ]
        }
      },
      {
        $lookup: {
          from: 'jobs',
          localField: 'job',
          foreignField: '_id',
          as: 'jobInfo',
          pipeline: [
            {
              $project: {
                title: 1,
                company: 1,
                location: 1,
                type: 1,
                salary: 1,
                description: 1,
                requirements: 1,
                skills: 1,
                remote: 1,
                contactEmail: 1,
                postedDate: 1,
                questions: 1
              }
            }
          ]
        }
      },
      {
        $addFields: {
          candidateInfo: { $arrayElemAt: ['$candidateInfo', 0] },
          jobInfo: { $arrayElemAt: ['$jobInfo', 0] }
        }
      },
      {
        $addFields: {
          matchScore: {
            $cond: {
              if: { $and: [
                { $isArray: '$jobInfo.skills' },
                { $isArray: '$additionalInfo.skills' }
              ]},
              then: {
                $multiply: [
                  { $divide: [
                    { $size: { $setIntersection: ['$jobInfo.skills', '$additionalInfo.skills'] } },
                    { $size: '$jobInfo.skills' }
                  ]},
                  100
                ]
              },
              else: 75
            }
          }
        }
      }
    ];

    console.log('Pipeline d\'agrégation:', JSON.stringify(pipeline, null, 2));

    // Étape 4: Exécution avec tri et pagination
    const sortOptions = {};
    sortOptions[sortBy] = order === 'desc' ? -1 : 1;

    // Compter le total
    const totalPipeline = [...pipeline, { $count: 'total' }];
    const totalResult = await Application.aggregate(totalPipeline);
    const total = totalResult.length > 0 ? totalResult[0].total : 0;

    // Récupérer les applications avec pagination
    const applications = await Application.aggregate([
      ...pipeline,
      { $sort: sortOptions },
      { $skip: (page - 1) * limit },
      { $limit: parseInt(limit) }
    ]);

    console.log(`📊 Résultats: ${applications.length}/${total} candidatures trouvées`);

    // Étape 5: Formatage complet des données
    const formattedApplications = applications.map(app => {
      try {
        const candidateInfo = app.candidateInfo || {};
        const jobInfo = app.jobInfo || {};
        const personalInfo = app.personalInfo || {};
        const additionalInfo = app.additionalInfo || {};

        // Informations candidat
        const firstName = personalInfo.firstName || candidateInfo.firstName || '';
        const lastName = personalInfo.lastName || candidateInfo.lastName || '';
        const fullName = `${firstName} ${lastName}`.trim() || 'Candidat anonyme';
        const email = personalInfo.email || candidateInfo.email || '';
        const phone = personalInfo.phone || candidateInfo.phone || '';

        // Informations job
        const jobTitle = jobInfo.title || 'Poste non spécifié';
        const jobCompany = jobInfo.company || 'Entreprise non spécifiée';
        const jobLocation = jobInfo.location || 'Localisation non spécifiée';
        const jobType = jobInfo.type || 'Non spécifié';
        const jobSalary = formatSalary(jobInfo.salary);
        const jobDescription = jobInfo.description || '';
        const jobRequirements = Array.isArray(jobInfo.requirements) ? jobInfo.requirements : [];
        const jobSkills = Array.isArray(jobInfo.skills) ? jobInfo.skills : [];

        // Localisation candidat
        const candidateLocation = personalInfo.address || additionalInfo.location || candidateInfo.location || 'Non spécifiée';

        // Expérience et autres infos
        const experience = additionalInfo.experience || candidateInfo.experience || 'Non spécifiée';
        const expectedSalary = additionalInfo.expectedSalary || 'Non spécifié';
        const availability = additionalInfo.availability || 'Non spécifiée';

        // Compétences candidat
        const candidateSkills = additionalInfo.skills || candidateInfo.skills || [];
        const skillsArray = Array.isArray(candidateSkills) ? candidateSkills : 
                          typeof candidateSkills === 'string' ? candidateSkills.split(',').map(s => s.trim()) : [];

        // Score de correspondance
        const matchScore = Math.round(app.matchScore || calculateMatchScore(skillsArray, jobSkills));

        // Avatar
        const avatar = candidateInfo.avatar || 
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName)}+${encodeURIComponent(lastName)}&background=667eea&color=fff`;

        // Dates formatées
        const appliedDate = app.appliedDate ? app.appliedDate.toLocaleDateString('fr-FR') : 'Date inconnue';
        const lastUpdate = app.lastUpdate ? app.lastUpdate.toLocaleDateString('fr-FR') : appliedDate;

        return {
          // IDs
          id: app._id,
          jobId: app.job,
          candidateId: app.candidate,

          // Informations candidat
          name: fullName,
          firstName: firstName,
          lastName: lastName,
          email: email,
          phone: phone,
          avatar: avatar,

          // Informations job
          position: jobTitle,
          jobTitle: jobTitle,
          company: jobCompany,
          jobCompany: jobCompany,
          jobLocation: jobLocation,
          jobType: jobType,
          jobSalary: jobSalary,
          jobDescription: jobDescription,
          jobRequirements: jobRequirements,
          jobSkills: jobSkills,
          remote: jobInfo.remote || false,

          // Localisation et détails candidat
          location: candidateLocation,
          experience: experience,
          salary: expectedSalary,
          availability: availability,
          skills: skillsArray,

          // Métadonnées
          match: matchScore,
          status: app.status || 'new',
          appliedDate: appliedDate,
          lastUpdate: lastUpdate,

          // Contenu
          coverLetter: app.coverLetter || '',
          motivation: additionalInfo.motivation || '',
          portfolioUrl: additionalInfo.portfolioUrl || '',
          linkedinUrl: additionalInfo.linkedinUrl || '',

          // Documents avec vérification de l'existence
          documents: app.documents || {},
          hasCV: !!(app.documents && app.documents.cv && app.documents.cv.path),
          hasCoverLetter: !!(app.documents && app.documents.coverLetterFile && app.documents.coverLetterFile.path),
          hasPortfolio: !!(app.documents && app.documents.portfolio && app.documents.portfolio.path),

          // Réponses personnalisées
          customAnswers: Array.isArray(app.customAnswers) ? app.customAnswers : [],

          // Historique et notes
          statusHistory: app.statusHistory || [],
          recruiterNotes: app.recruiterNotes || [],
          isFavorite: app.isFavorite || false,

          // Informations de contact job
          contactEmail: jobInfo.contactEmail || email,
          contactPerson: additionalInfo.contactPerson || 'Recruteur',

          // Informations complètes pour le modal
          fullJobInfo: {
            id: app.job,
            title: jobTitle,
            company: jobCompany,
            location: jobLocation,
            type: jobType,
            salary: jobSalary,
            description: jobDescription,
            requirements: jobRequirements,
            skills: jobSkills,
            remote: jobInfo.remote || false,
            postedDate: jobInfo.postedDate,
            questions: jobInfo.questions || []
          },

          // Pour le débogage
          _hasJobInfo: !!jobInfo.title,
          _hasCandidateInfo: !!candidateInfo.firstName || !!personalInfo.firstName
        };
      } catch (formatError) {
        console.error('❌ Erreur formatage candidature:', formatError);
        return {
          id: app._id,
          name: 'Erreur de formatage',
          email: 'Erreur',
          status: app.status || 'new',
          error: formatError.message,
          _rawData: app
        };
      }
    });

    // Étape 6: Préparation de la réponse
    const response = {
      applications: formattedApplications,
      total: total,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit)
      },
      jobs: recruiterJobs.map(job => ({
        id: job._id,
        title: job.title,
        company: job.company,
        location: job.location,
        type: job.type
      })),
      filters: { 
        status, 
        jobId, 
        search, 
        experience, 
        location, 
        sortBy, 
        order 
      },
      stats: {
        total: total,
        new: applications.filter(a => a.status === 'new').length,
        reviewed: applications.filter(a => a.status === 'reviewed').length,
        shortlisted: applications.filter(a => a.status === 'shortlisted').length,
        interviewed: applications.filter(a => a.status === 'interviewed').length,
        accepted: applications.filter(a => a.status === 'accepted').length,
        rejected: applications.filter(a => a.status === 'rejected').length
      },
      metadata: {
        timestamp: new Date().toISOString(),
        recruiterId: req.user.id,
        recruiterCompany: req.user.company,
        jobsCount: recruiterJobs.length
      }
    };

    console.log('📤 Envoi de la réponse avec toutes les informations');
    res.json(response);

  } catch (error) {
    console.error('💥 ERREUR FATALE dans getRecruiterApplications:', error);
    
    res.status(500).json({ 
      message: 'Erreur serveur lors de la récupération des candidatures',
      error: error.message,
      timestamp: new Date().toISOString(),
      endpoint: 'getRecruiterApplications'
    });
  }
};

// 4. RÉCUPÉRATION D'UNE CANDIDATURE SPÉCIFIQUE
const getApplicationById = async (req, res) => {
  try {
    console.log('📥 Récupération candidature complète:', req.params.id);

    const application = await Application.findById(req.params.id)
      .populate({
        path: 'candidate',
        select: 'firstName lastName email phone avatar skills experience location'
      })
      .populate({
        path: 'job',
        select: 'title company location type salary description requirements skills remote contactEmail postedDate questions createdBy recruiter author owner',
        populate: {
          path: 'company',
          select: 'name logo website'
        }
      })
      .populate({
        path: 'statusHistory.changedBy',
        select: 'firstName lastName'
      })
      .populate({
        path: 'recruiterNotes.author',
        select: 'firstName lastName'
      });

    if (!application) {
      return res.status(404).json({ message: 'Candidature non trouvée' });
    }

    // Vérifier les permissions avec la nouvelle logique
    const isCandidate = application.candidate._id.toString() === req.user.id;
    const userRole = (req.user.role || '').toLowerCase();
    const userType = (req.user.userType || '').toLowerCase();
    const isRecruiter = ['recruiter', 'recruteur', 'admin', 'administrateur'].includes(userRole) || 
                       ['recruiter', 'recruteur', 'admin', 'administrateur'].includes(userType);
    
    let hasJobAccess = false;
    if (isRecruiter) {
      hasJobAccess = await checkRecruiterJobAccess(req.user.id, application.job);
    }

    if (!isCandidate && !(isRecruiter && hasJobAccess)) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    // Formater la réponse avec toutes les informations
    const formattedResponse = {
      ...application.toObject(),
      
      // Informations calculées
      matchScore: calculateMatchScore(
        application.additionalInfo?.skills || [],
        application.job?.skills || [],
        application.additionalInfo
      ),
      
      // Informations de contact complètes
      contactInfo: {
        email: application.personalInfo?.email || application.candidate?.email,
        phone: application.personalInfo?.phone || application.candidate?.phone,
        address: application.personalInfo?.address,
        portfolioUrl: application.additionalInfo?.portfolioUrl,
        linkedinUrl: application.additionalInfo?.linkedinUrl
      },

      // Statut des documents avec vérification de l'existence des fichiers
      documentStatus: {
        hasCV: !!(application.documents && application.documents.cv && application.documents.cv.path),
        hasCoverLetter: !!(application.documents && application.documents.coverLetterFile && application.documents.coverLetterFile.path),
        hasPortfolio: !!(application.documents && application.documents.portfolio && application.documents.portfolio.path)
      }
    };

    res.json(formattedResponse);

  } catch (error) {
    console.error('Erreur lors de la récupération de la candidature:', error);
    res.status(500).json({ 
      message: 'Erreur serveur lors de la récupération de la candidature',
      error: error.message 
    });
  }
};

// 5. MISE À JOUR DU STATUT D'UNE CANDIDATURE
const updateApplicationStatus = async (req, res) => {
  try {
    console.log(`=== MISE À JOUR STATUT CANDIDATURE ${req.params.id} ===`);
    const { status, note } = req.body;
    
    // Valider le statut
    const validStatuses = ['new', 'reviewed', 'shortlisted', 'interviewed', 'accepted', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Statut invalide' });
    }
    
    const application = await Application.findById(req.params.id).populate('job');
    
    if (!application) {
      return res.status(404).json({ message: 'Candidature non trouvée' });
    }

    // Vérifier les permissions du recruteur avec la nouvelle logique
    const hasAccess = await checkRecruiterJobAccess(req.user.id, application.job);

    if (!hasAccess) {
      return res.status(403).json({ message: 'Accès non autorisé à cette candidature' });
    }
        
    // Mettre à jour le statut
    const oldStatus = application.status;
    application.status = status;
    application.lastUpdate = new Date();

    // Ajouter à l'historique
    application.statusHistory.push({
      status,
      changedBy: req.user.id,
      changedAt: new Date(),
      note: note || `Statut changé de "${oldStatus}" vers "${status}"`
    });

    // Ajouter une note si fournie
    if (note && note.trim()) {
      application.recruiterNotes.push({
        note: note.trim(),
        author: req.user.id,
        createdAt: new Date()
      });
    }

    await application.save();

    console.log('✅ Statut mis à jour avec succès:', oldStatus, '=>', status);

    res.json({
      message: 'Statut mis à jour avec succès',
      application: {
        id: application._id,
        status: application.status,
        lastUpdate: application.lastUpdate,
        oldStatus: oldStatus,
        newStatus: status
      }
    });

  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour du statut:', error);
    res.status(500).json({ 
      message: 'Erreur serveur lors de la mise à jour du statut',
      error: error.message 
    });
  }
};

// 6. SUPPRESSION D'UNE CANDIDATURE
const deleteApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    
    if (!application) {
      return res.status(404).json({ message: 'Candidature non trouvée' });
    }

    // Vérifier les permissions (seul le candidat peut supprimer sa candidature)
    if (application.candidate.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    // Supprimer les fichiers uploadés
    const documentFields = ['cv', 'coverLetterFile', 'portfolio'];
    documentFields.forEach(field => {
      if (application.documents[field] && application.documents[field].path) {
        try {
          const filePath = application.documents[field].path;
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`✅ Fichier ${field} supprimé:`, filePath);
          }
        } catch (err) {
          console.error(`❌ Erreur suppression fichier ${field}:`, err);
        }
      }
    });

    await Application.findByIdAndDelete(req.params.id);
    
    console.log('✅ Candidature supprimée:', req.params.id);
    res.json({ message: 'Candidature supprimée avec succès' });

  } catch (error) {
    console.error('❌ Erreur suppression candidature:', error);
    res.status(500).json({ 
      message: 'Erreur serveur lors de la suppression de la candidature',
      error: error.message 
    });
  }
};

// 7. AJOUT DE NOTE PAR LE RECRUTEUR
const addRecruiterNote = async (req, res) => {
  try {
    const { note } = req.body;
    
    if (!note || !note.trim()) {
      return res.status(400).json({ message: 'Note requise' });
    }
    
    const application = await Application.findById(req.params.id).populate('job');
    
    if (!application) {
      return res.status(404).json({ message: 'Candidature non trouvée' });
    }

    // Vérifier les permissions avec la nouvelle logique
    const hasAccess = await checkRecruiterJobAccess(req.user.id, application.job);

    if (!hasAccess) {
      return res.status(403).json({ message: 'Accès non autorisé à cette candidature' });
    }

    application.recruiterNotes.push({
      note: note.trim(),
      author: req.user.id,
      createdAt: new Date()
    });

    await application.save();

    console.log('✅ Note ajoutée à la candidature:', req.params.id);

    res.json({
      message: 'Note ajoutée avec succès',
      note: {
        note: note.trim(),
        author: req.user.id,
        createdAt: new Date()
      }
    });

  } catch (error) {
    console.error('❌ Erreur ajout note:', error);
    res.status(500).json({ 
      message: 'Erreur serveur lors de l\'ajout de la note',
      error: error.message 
    });
  }
};

// 8. MARQUER/DÉMARQUER COMME FAVORI
const toggleFavorite = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id).populate('job');
    
    if (!application) {
      return res.status(404).json({ message: 'Candidature non trouvée' });
    }

    // Vérifier les permissions avec la nouvelle logique
    const hasAccess = await checkRecruiterJobAccess(req.user.id, application.job);

    if (!hasAccess) {
      return res.status(403).json({ message: 'Accès non autorisé à cette candidature' });
    }

    application.isFavorite = !application.isFavorite;
    await application.save();

    console.log(`✅ Candidature ${application.isFavorite ? 'ajoutée aux' : 'retirée des'} favoris:`, req.params.id);

    res.json({
      message: `Candidature ${application.isFavorite ? 'ajoutée aux' : 'retirée des'} favoris`,
      isFavorite: application.isFavorite
    });

  } catch (error) {
    console.error('❌ Erreur favoris:', error);
    res.status(500).json({ 
      message: 'Erreur serveur lors de la mise à jour des favoris',
      error: error.message 
    });
  }
};

// 9. STATISTIQUES DES CANDIDATURES
const getApplicationStats = async (req, res) => {
  try {
    // Récupérer les emplois du recruteur avec la nouvelle logique élargie
    const jobQuery = {
      $or: [
        { createdBy: req.user.id },
        { recruiter: req.user.id },
        { author: req.user.id },
        { owner: req.user.id }
      ]
    };

    if (req.user.company) {
      jobQuery.$or.push({ company: req.user.company });
    }
    
    const recruiterJobs = await Job.find(jobQuery).select('_id');
    const jobIds = recruiterJobs.map(job => job._id);

    if (jobIds.length === 0) {
      return res.json({
        total: 0,
        new: 0,
        reviewed: 0,
        shortlisted: 0,
        interviewed: 0,
        accepted: 0,
        rejected: 0
      });
    }

    const stats = await Application.aggregate([
      { $match: { job: { $in: jobIds } } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const total = await Application.countDocuments({ job: { $in: jobIds } });

    const formattedStats = {
      total,
      new: stats.find(s => s._id === 'new')?.count || 0,
      reviewed: stats.find(s => s._id === 'reviewed')?.count || 0,
      shortlisted: stats.find(s => s._id === 'shortlisted')?.count || 0,
      interviewed: stats.find(s => s._id === 'interviewed')?.count || 0,
      accepted: stats.find(s => s._id === 'accepted')?.count || 0,
      rejected: stats.find(s => s._id === 'rejected')?.count || 0
    };

    console.log('📊 Statistiques calculées:', formattedStats);
    res.json(formattedStats);

  } catch (error) {
    console.error('❌ Erreur statistiques:', error);
    res.status(500).json({ 
      message: 'Erreur serveur lors de la récupération des statistiques',
      error: error.message 
    });
  }
};

// ==============================================
// EXPORTATIONS
// ==============================================
module.exports = {
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
  calculateMatchScore,
  checkRecruiterJobAccess // Exporter la nouvelle fonction aussi
};



