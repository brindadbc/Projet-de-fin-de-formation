
const User = require('../models/User');
const Job = require('../models/Job');


// @desc    Créer une nouvelle offre d'emploi
// @route   POST /api/jobs
// @access  Private (Recruteur)
const createJob = async (req, res) => {
  try {
    const {
      title,
      company,
      location,
      type,
      remote,
      salary,
      experience,
      education,
      description,
      requirements,
      benefits,
      skills,
      department,
      team_size,
      start_date,
      application_deadline,
      contact_email,
      questions,
      status
    } = req.body;

    // Validation des champs requis
    if (!title || !company || !location || !description) {
      return res.status(400).json({
        success: false,
        message: 'Les champs titre, entreprise, localisation et description sont requis'
      });
    }

    // Créer l'offre d'emploi
    const job = await Job.create({
      title,
      company,
      location,
      type,
      remote,
      salary,
      experience,
      education,
      description,
      requirements: requirements || [],
      benefits: benefits || [],
      skills: skills || [],
      department,
      team_size,
      start_date,
      application_deadline,
      contact_email,
      questions: questions || [],
      status: status || 'Actif',
      recruiter: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Offre d\'emploi créée avec succès',
      data: job
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'offre:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la création de l\'offre',
      error: error.message
    });
  }
};

// @desc    Obtenir toutes les offres d'emploi d'un recruteur
// @route   GET /api/jobs/my-jobs
// @access  Private (Recruteur)
const getMyJobs = async (req, res) => {
  try {
    const { status, search, sort } = req.query;
    
    let query = { recruiter: req.user.id };
    
    // Filtrer par statut si spécifié
    if (status && status !== 'all') {
      query.status = status;
    }
    
    // Recherche textuelle
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Définir l'ordre de tri
    let sortQuery = { createdAt: -1 }; // Par défaut, du plus récent au plus ancien
    
    switch (sort) {
      case 'oldest':
        sortQuery = { createdAt: 1 };
        break;
      case 'applicants':
        sortQuery = { applicants: -1 };
        break;
      case 'views':
        sortQuery = { views: -1 };
        break;
      default:
        sortQuery = { createdAt: -1 };
    }
    
    const jobs = await Job.find(query)
      .sort(sortQuery)
      .populate('recruiter', 'name email');
    
    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des offres:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des offres',
      error: error.message
    });
  }
};

// @desc    Obtenir toutes les offres d'emploi publiques
// @route   GET /api/jobs
// @access  Public
const getAllJobs = async (req, res) => {
  try {
    const { search, location, category, type, salary, page = 1, limit = 10 } = req.query;
    
    let query = { status: 'Actif' }; // Seulement les offres actives
    
    // Recherche textuelle
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Filtrer par localisation
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }
    
    // Filtrer par type de contrat
    if (type) {
      query.type = type;
    }
    
    // Filtrer par département (utilisé comme catégorie)
    if (category) {
      query.department = { $regex: category, $options: 'i' };
    }
    
    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    const jobs = await Job.find(query)
      .populate('recruiter', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);
    
    const total = await Job.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: jobs.length,
      total,
      pages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      data: jobs
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des offres publiques:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des offres',
      error: error.message
    });
  }
};

// @desc    Obtenir une offre d'emploi par ID
// @route   GET /api/jobs/:id
// @access  Public
const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('recruiter', 'name email');
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Offre d\'emploi non trouvée'
      });
    }
    
    // Incrémenter le nombre de vues
    await job.incrementViews();
    
    res.status(200).json({
      success: true,
      data: job
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'offre:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération de l\'offre',
      error: error.message
    });
  }
};

// @desc    Mettre à jour une offre d'emploi
// @route   PUT /api/jobs/:id
// @access  Private (Recruteur propriétaire)
const updateJob = async (req, res) => {
  try {
    let job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Offre d\'emploi non trouvée'
      });
    }
    
    // Vérifier que l'utilisateur est le propriétaire de l'offre
    if (job.recruiter.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé à modifier cette offre'
      });
    }
    
    job = await Job.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    
    res.status(200).json({
      success: true,
      message: 'Offre d\'emploi mise à jour avec succès',
      data: job
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'offre:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la mise à jour de l\'offre',
      error: error.message
    });
  }
};

// @desc    Supprimer une offre d'emploi
// @route   DELETE /api/jobs/:id
// @access  Private (Recruteur propriétaire)
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Offre d\'emploi non trouvée'
      });
    }
    
    // Vérifier que l'utilisateur est le propriétaire de l'offre
    if (job.recruiter.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé à supprimer cette offre'
      });
    }
    
    await job.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Offre d\'emploi supprimée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'offre:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la suppression de l\'offre',
      error: error.message
    });
  }
};

// @desc    Supprimer plusieurs offres d'emploi
// @route   DELETE /api/jobs/bulk
// @access  Private (Recruteur propriétaire)
const deleteBulkJobs = async (req, res) => {
  try {
    const { jobIds } = req.body;
    
    if (!jobIds || !Array.isArray(jobIds) || jobIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Liste des IDs d\'offres requise'
      });
    }
    
    // Vérifier que toutes les offres appartiennent au recruteur
    const jobs = await Job.find({
      _id: { $in: jobIds },
      recruiter: req.user.id
    });
    
    if (jobs.length !== jobIds.length) {
      return res.status(403).json({
        success: false,
        message: 'Certaines offres ne vous appartiennent pas'
      });
    }
    
    await Job.deleteMany({
      _id: { $in: jobIds },
      recruiter: req.user.id
    });
    
    res.status(200).json({
      success: true,
      message: `${jobIds.length} offre(s) supprimée(s) avec succès`
    });
  } catch (error) {
    console.error('Erreur lors de la suppression en masse:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la suppression en masse',
      error: error.message
    });
  }
};

// @desc    Mettre à jour le statut d'une offre
// @route   PATCH /api/jobs/:id/status
// @access  Private (Recruteur propriétaire)
const updateJobStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status || !['Actif', 'Fermé', 'Brouillon', 'En pause'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Statut invalide'
      });
    }
    
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Offre d\'emploi non trouvée'
      });
    }
    
    // Vérifier que l'utilisateur est le propriétaire de l'offre
    if (job.recruiter.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé à modifier cette offre'
      });
    }
    
    job.status = status;
    await job.save();
    
    res.status(200).json({
      success: true,
      message: 'Statut mis à jour avec succès',
      data: job
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la mise à jour du statut',
      error: error.message
    });
  }
};

// @desc    Mettre à jour le statut de plusieurs offres
// @route   PATCH /api/jobs/bulk/status
// @access  Private (Recruteur propriétaire)
const updateBulkJobsStatus = async (req, res) => {
  try {
    const { jobIds, status } = req.body;
    
    if (!jobIds || !Array.isArray(jobIds) || jobIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Liste des IDs d\'offres requise'
      });
    }
    
    if (!status || !['Actif', 'Fermé', 'Brouillon', 'En pause'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Statut invalide'
      });
    }
    
    // Vérifier que toutes les offres appartiennent au recruteur
    const jobs = await Job.find({
      _id: { $in: jobIds },
      recruiter: req.user.id
    });
    
    if (jobs.length !== jobIds.length) {
      return res.status(403).json({
        success: false,
        message: 'Certaines offres ne vous appartiennent pas'
      });
    }
    
    await Job.updateMany(
      {
        _id: { $in: jobIds },
        recruiter: req.user.id
      },
      { status }
    );
    
    res.status(200).json({
      success: true,
      message: `Statut mis à jour pour ${jobIds.length} offre(s)`
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour en masse du statut:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la mise à jour en masse du statut',
      error: error.message
    });
  }
};

// @desc    Dupliquer une offre d'emploi
// @route   POST /api/jobs/:id/duplicate
// @access  Private (Recruteur propriétaire)
const duplicateJob = async (req, res) => {
  try {
    const originalJob = await Job.findById(req.params.id);
    
    if (!originalJob) {
      return res.status(404).json({
        success: false,
        message: 'Offre d\'emploi non trouvée'
      });
    }
    
    // Vérifier que l'utilisateur est le propriétaire de l'offre
    if (originalJob.recruiter.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé à dupliquer cette offre'
      });
    }
    
    // Créer une copie de l'offre
    const jobData = originalJob.toObject();
    delete jobData._id;
    delete jobData.createdAt;
    delete jobData.updatedAt;
    delete jobData.applications;
    
    // Modifier le titre pour indiquer que c'est une copie
    jobData.title = `${jobData.title} (Copie)`;
    jobData.status = 'Brouillon';
    jobData.applicants = 0;
    jobData.views = 0;
    
    const duplicatedJob = await Job.create(jobData);
    
    res.status(201).json({
      success: true,
      message: 'Offre dupliquée avec succès',
      data: duplicatedJob
    });
  } catch (error) {
    console.error('Erreur lors de la duplication de l\'offre:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la duplication de l\'offre',
      error: error.message
    });
  }
};

module.exports = {
  createJob,
  getMyJobs,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
  deleteBulkJobs,
  updateJobStatus,
  updateBulkJobsStatus,
  duplicateJob
};