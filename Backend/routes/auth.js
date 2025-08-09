const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
// routes/userRoutes.js (ajoutez ces routes à votre fichier userRoutes existant)
const { authenticateToken } = require('../middleware/auth');


// Routes publiques
router.post('/register', register);
router.post('/login', login);

// Routes privées (nécessitent une authentification)
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

module.exports = router;