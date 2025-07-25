const express = require('express'); 
const { 
getAllUsers, 
getUserById, 
updateUser, 
deleteUser, 
getDashboardStats 
} = require('../controllers/adminController'); 
const { protect } = require('../middleware/auth'); 
const { adminOnly, adminOrSelf } = require('../middleware/admin'); 
const router = express.Router(); 
// All routes are protected and require admin role 
router.use(protect); 
router.use(adminOnly); 
router.get('/dashboard-stats', getDashboardStats); 
router.get('/users', getAllUsers); 
router.get('/users/:id', getUserById); 
router.put('/users/:id', updateUser); 
router.delete('/users/:id', deleteUser); 
module.exports = router;