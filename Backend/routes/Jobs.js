const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/jobController');

const { protect, recruiterOnly } = require('../middleware/auth');

// Routes publiques
router.get('/', getAllJobs);
router.get('/:id', getJobById);

// Routes protégées (nécessitent une authentification)
router.use(protect);

// CORRECTION PRINCIPALE : Route pour les jobs du recruteur
// L'ordre est important - les routes spécifiques avant les routes avec paramètres
router.get('/my/jobs', recruiterOnly, getMyJobs);

// Routes pour les recruteurs
router.post('/', recruiterOnly, createJob);
router.put('/:id', recruiterOnly, updateJob);
router.delete('/:id', recruiterOnly, deleteJob);
router.patch('/:id/status', recruiterOnly, updateJobStatus);
router.post('/:id/duplicate', recruiterOnly, duplicateJob);

// Routes pour les actions en masse
router.delete('/bulk/delete', recruiterOnly, deleteBulkJobs);
router.patch('/bulk/status', recruiterOnly, updateBulkJobsStatus);

module.exports = router;


