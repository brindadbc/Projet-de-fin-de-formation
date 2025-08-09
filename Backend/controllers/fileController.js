const Application = require('../models/application');
const path = require('path');
const fs = require('fs');

// @desc    Télécharger un fichier de candidature
// @route   GET /api/applications/:id/download/:fileType
// @access  Private (Recruiter or Candidate)
const downloadFile = async (req, res) => {
  try {
    const { id, fileType } = req.params;
    
    // Vérifier que le type de fichier est valide
    const validFileTypes = ['cv', 'coverLetterFile', 'portfolio'];
    if (!validFileTypes.includes(fileType)) {
      return res.status(400).json({ message: 'Type de fichier invalide' });
    }

    // Récupérer la candidature
    const application = await Application.findById(id)
      .populate('candidate', 'firstName lastName email')
      .populate('job', 'title company');

    if (!application) {
      return res.status(404).json({ message: 'Candidature non trouvée' });
    }

    // Vérifier les permissions
    const isCandidate = application.candidate._id.toString() === req.user.id;
    const isRecruiter = req.user.role === 'recruiter' || req.user.role === 'admin';

    if (!isCandidate && !isRecruiter) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    // Vérifier que le fichier existe dans la candidature
    const fileInfo = application.documents[fileType];
    if (!fileInfo || !fileInfo.path) {
      return res.status(404).json({ message: 'Fichier non trouvé' });
    }

    // Vérifier que le fichier existe sur le système de fichiers
    const filePath = path.resolve(fileInfo.path);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Fichier non trouvé sur le serveur' });
    }

    // Définir le nom du fichier pour le téléchargement
    const candidateName = `${application.candidate.firstName}_${application.candidate.lastName}`;
    const jobTitle = application.job.title.replace(/[^a-zA-Z0-9]/g, '_');
    const fileExtension = path.extname(fileInfo.filename);
    const downloadName = `${candidateName}_${jobTitle}_${fileType}${fileExtension}`;

    // Définir les headers pour le téléchargement
    res.setHeader('Content-Disposition', `attachment; filename="${downloadName}"`);
    res.setHeader('Content-Type', 'application/octet-stream');

    // Envoyer le fichier
    res.sendFile(filePath);

  } catch (error) {
    console.error('Erreur lors du téléchargement du fichier:', error);
    res.status(500).json({ 
      message: 'Erreur serveur lors du téléchargement du fichier',
      error: error.message 
    });
  }
};

// @desc    Obtenir les informations d'un fichier
// @route   GET /api/applications/:id/file-info/:fileType
// @access  Private
const getFileInfo = async (req, res) => {
  try {
    const { id, fileType } = req.params;
    
    const validFileTypes = ['cv', 'coverLetterFile', 'portfolio'];
    if (!validFileTypes.includes(fileType)) {
      return res.status(400).json({ message: 'Type de fichier invalide' });
    }

    const application = await Application.findById(id);
    if (!application) {
      return res.status(404).json({ message: 'Candidature non trouvée' });
    }

    // Vérifier les permissions
    const isCandidate = application.candidate.toString() === req.user.id;
    const isRecruiter = req.user.role === 'recruiter' || req.user.role === 'admin';

    if (!isCandidate && !isRecruiter) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    const fileInfo = application.documents[fileType];
    if (!fileInfo) {
      return res.status(404).json({ message: 'Fichier non trouvé' });
    }

    // Vérifier que le fichier existe sur le système de fichiers
    const filePath = path.resolve(fileInfo.path);
    const fileExists = fs.existsSync(filePath);
    
    let fileSize = 0;
    if (fileExists) {
      const stats = fs.statSync(filePath);
      fileSize = stats.size;
    }

    res.json({
      filename: fileInfo.filename,
      uploadDate: fileInfo.uploadDate,
      exists: fileExists,
      size: fileSize,
      type: fileType
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des informations du fichier:', error);
    res.status(500).json({ 
      message: 'Erreur serveur lors de la récupération des informations du fichier',
      error: error.message 
    });
  }
};

module.exports = {
  downloadFile,
  getFileInfo
};89