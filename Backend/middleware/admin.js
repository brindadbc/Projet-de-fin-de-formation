// const adminOnly = (req, res, next) => { 
//   if (req.user && req.user.role === 'admin') { 
//     next(); 
//   } else { 
//     res.status(403).json({ message: 'Access denied. Admin only.' }); 
//   } 
// }; 
 
// const adminOrSelf = (req, res, next) => { 
//   if (req.user && (req.user.role === 'admin' || req.user._id.toString() === req.params.id)) { 
//     next(); 
//   } else { 
//     res.status(403).json({ message: 'Access denied. Admin or self only.' }); 
//   } 
// }; 
 
// module.exports = { adminOnly, adminOrSelf };



// middleware/admin.js
const User = require('../models/user');

// Middleware pour vérifier le rôle administrateur
const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Non authentifié' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      message: 'Accès refusé. Seuls les administrateurs peuvent accéder à cette ressource.' 
    });
  }

  next();
};

// Middleware pour vérifier le rôle recruteur
const recruiterOnly = (req, res, next) => {
  console.log('🔍 Vérification rôle recruteur:', {
    userId: req.user?.id,
    role: req.user?.role,
    userType: req.user?.userType
  });

  if (!req.user) {
    return res.status(401).json({ message: 'Non authentifié' });
  }

  // Vérifier si l'utilisateur est un recruteur ou admin
  // const isRecruiter = req.user.role === 'recruiter' || 
  //                    req.user.userType === 'recruiter' ||
  //                    req.user.role === 'admin';
  const isRecruiter = req.user.role === 'recruiter' || 
                   req.user.role === 'recruteur' ||     // ← Ajout
                   req.user.userType === 'recruiter' ||
                   req.user.userType === 'recruteur' || // ← Ajout  
                   req.user.role === 'admin';

  if (!isRecruiter) {
    console.log('❌ Accès refusé - pas recruteur');
    return res.status(403).json({ 
      message: 'Accès refusé. Vous devez être recruteur pour accéder à cette ressource.' 
    });
  }

  console.log('✅ Accès autorisé - utilisateur recruteur');
  next();
};

// Middleware pour vérifier le rôle candidat
const candidateOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Non authentifié' });
  }

  const isCandidate = req.user.role === 'candidate' || 
                     req.user.userType === 'candidate';

  if (!isCandidate) {
    return res.status(403).json({ 
      message: 'Accès refusé. Cette ressource est réservée aux candidats.' 
    });
  }

  next();
};

// Middleware pour vérifier plusieurs rôles
const requireRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Non authentifié' });
    }

    const hasRole = roles.some(role => 
      req.user.role === role || req.user.userType === role
    );

    if (!hasRole) {
      return res.status(403).json({ 
        message: `Accès refusé. Rôles requis: ${roles.join(', ')}` 
      });
    }

    next();
  };
};

module.exports = {
  adminOnly,
  recruiterOnly,
  candidateOnly,
  requireRoles
};