// // middleware/auth.js - Version corrigée

// const jwt = require('jsonwebtoken');
// const User = require('../models/User');

// const protect = async (req, res, next) => {
//   let token;
//   if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
//     try {
//       // Get token from header
//       token = req.headers.authorization.split(' ')[1];
//       // Verify token
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
//       // Get user from token
//       req.user = await User.findById(decoded.id).select('-password');
      
//       if (!req.user) {
//         return res.status(401).json({ message: 'Utilisateur non trouvé' });
//       }
      
//       console.log('🔑 Utilisateur authentifié:', {
//         id: req.user.id,
//         role: req.user.role,
//         userType: req.user.userType,
//         company: req.user.company
//       });
      
//       next();
//     } catch (error) {
//       console.error('Erreur de vérification du token:', error);
//       return res.status(401).json({ message: 'Token invalide' });
//     }
//   } else {
//     return res.status(401).json({ message: 'Pas de token, accès non autorisé' });
//   }
// };

// // Middleware pour vérifier le rôle
// const authorize = (...roles) => {
//   return (req, res, next) => {
//     if (!roles.includes(req.user.role)) {
//       return res.status(403).json({ 
//         message: 'Accès refusé pour ce rôle' 
//       });
//     }
//     next();
//   };
// };

// // Middleware spécifique pour les recruteurs - VERSION CORRIGÉE
// const recruiterOnly = (req, res, next) => {
//   console.log('🔍 Vérification rôle recruteur:', {
//     userId: req.user?.id,
//     role: req.user?.role,
//     userType: req.user?.userType
//   });
  
//   // CORRECTION: Vérifier les rôles en français ET en anglais
//   const isRecruiter = req.user.role === 'recruiter' || 
//                      req.user.role === 'recruteur' ||  // ← Ajout du français
//                      req.user.userType === 'recruiter' ||
//                      req.user.userType === 'recruteur' || // ← Ajout du français
//                      req.user.role === 'admin';
  
//   if (!isRecruiter) {
//     console.log('❌ Accès refusé - pas recruteur. Rôle actuel:', req.user.role);
//     return res.status(403).json({ 
//       message: 'Accès refusé. Vous devez être recruteur pour accéder à cette ressource.',
//       currentRole: req.user.role // ← Ajout pour debug
//     });
//   }
  
//   console.log('✅ Accès autorisé - utilisateur recruteur');
//   next();
// };

// // Middleware pour les candidats seulement
// const candidateOnly = (req, res, next) => {
//   const isCandidate = req.user.role === 'candidate' || 
//                      req.user.role === 'candidat' ||    // ← Ajout du français
//                      req.user.userType === 'candidate' ||
//                      req.user.userType === 'candidat';  // ← Ajout du français
  
//   if (!isCandidate) {
//     return res.status(403).json({ 
//       message: 'Accès refusé. Cette ressource est réservée aux candidats.' 
//     });
//   }
//   next();
// };

// module.exports = { 
//   protect, 
//   authorize, 
//   recruiterOnly, 
//   candidateOnly 
// };

// middleware/auth.js - Version corrigée
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // Vérifier la présence du header Authorization
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extraire le token
      token = req.headers.authorization.split(' ')[1];
      
      console.log('🔍 Token reçu:', token ? 'Présent' : 'Absent');

      // Vérifier le token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('✅ Token décodé:', decoded);

      // Récupérer l'utilisateur
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        console.log('❌ Utilisateur non trouvé avec ID:', decoded.id);
        return res.status(401).json({ 
          message: 'Utilisateur non trouvé',
          tokenId: decoded.id 
        });
      }

      console.log('🔑 Utilisateur authentifié:', {
        id: req.user._id, // Utiliser _id au lieu de id
        email: req.user.email,
        role: req.user.role,
        name: req.user.name
      });

      next();
    } catch (error) {
      console.error('❌ Erreur de vérification du token:', error.message);
      
      // Messages d'erreur plus spécifiques
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Token malformé' });
      } else if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expiré' });
      } else {
        return res.status(401).json({ message: 'Token invalide' });
      }
    }
  } else {
    console.log('❌ Aucun token d\'autorisation fourni');
    return res.status(401).json({ 
      message: 'Pas de token, accès non autorisé',
      headers: req.headers.authorization ? 'Header présent mais format incorrect' : 'Aucun header Authorization'
    });
  }
};

// Middleware pour vérifier le rôle
const authorize = (...roles) => {
  return (req, res, next) => {
    console.log('🔍 Vérification du rôle:', {
      userRole: req.user.role,
      allowedRoles: roles
    });

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Accès refusé. Rôles autorisés: ${roles.join(', ')}. Votre rôle: ${req.user.role}`
      });
    }
    next();
  };
};

// Middleware spécifique pour les recruteurs
const recruiterOnly = (req, res, next) => {
  console.log('🔍 Vérification rôle recruteur:', {
    userId: req.user?._id,
    role: req.user?.role,
    userType: req.user?.userType
  });

  const isRecruiter = req.user.role === 'recruiter' ||
                     req.user.role === 'recruteur' ||
                     req.user.userType === 'recruiter' ||
                     req.user.userType === 'recruteur' ||
                     req.user.role === 'admin';

  if (!isRecruiter) {
    console.log('❌ Accès refusé - pas recruteur. Rôle actuel:', req.user.role);
    return res.status(403).json({
      message: 'Accès refusé. Vous devez être recruteur pour accéder à cette ressource.',
      currentRole: req.user.role
    });
  }

  console.log('✅ Accès autorisé - utilisateur recruteur');
  next();
};

// Middleware pour les candidats seulement
const candidateOnly = (req, res, next) => {
  const isCandidate = req.user.role === 'candidate' ||
                     req.user.role === 'candidat' ||
                     req.user.userType === 'candidate' ||
                     req.user.userType === 'candidat';

  if (!isCandidate) {
    return res.status(403).json({
      message: 'Accès refusé. Cette ressource est réservée aux candidats.'
    });
  }
  next();
};

module.exports = {
  protect,
  authorize,
  recruiterOnly,
  candidateOnly
};


// const jwt = require('jsonwebtoken');
// const User = require('../models/User');

// const protect = async (req, res, next) => {
//   let token;

//   if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
//     try {
//       // Get token from header
//       token = req.headers.authorization.split(' ')[1];

//       // Verify token
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);

//       // Get user from token
//       req.user = await User.findById(decoded.id).select('-password');
      
//       if (!req.user) {
//         return res.status(401).json({ message: 'Utilisateur non trouvé' });
//       }

//       next();
//     } catch (error) {
//       console.error('Erreur de vérification du token:', error);
//       return res.status(401).json({ message: 'Token invalide' });
//     }
//   }

//   if (!token) {
//     return res.status(401).json({ message: 'Pas de token, accès non autorisé' });
//   }
// };

// // Middleware pour vérifier le rôle
// const authorize = (...roles) => {
//   return (req, res, next) => {
//     if (!roles.includes(req.user.role)) {
//       return res.status(403).json({ 
//         message: 'Accès refusé pour ce rôle' 
//       });
//     }
//     next();
//   };
// };

// module.exports = { protect, authorize };
// middleware/recruiter.js
// const jwt = require('jsonwebtoken');
// const User = require('../models/User'); // Ajustez selon votre modèle

// // Middleware pour vérifier que l'utilisateur est un recruteur
// const recruiterOnly = async (req, res, next) => {
//   try {
//     // Vérifier que l'utilisateur est authentifié (le middleware auth doit être appelé avant)
//     if (!req.user) {
//       return res.status(401).json({ 
//         message: 'Accès non autorisé. Authentification requise.' 
//       });
//     }

//     // Vérifier le rôle depuis le token JWT
//     const userRole = req.user.role || req.user.userType;
    
//     console.log('🔍 Vérification rôle recruteur:', {
//       userId: req.user.id,
//       role: userRole,
//       email: req.user.email
//     });

//     // Vérifier si l'utilisateur est un recruteur
//     if (userRole !== 'recruiter' && userRole !== 'employer') {
//       console.warn('🚫 Accès refusé - rôle insuffisant:', {
//         userId: req.user.id,
//         role: userRole,
//         requiredRole: 'recruiter'
//       });

//       return res.status(403).json({ 
//         message: 'Accès refusé. Vous devez être connecté en tant que recruteur.',
//         currentRole: userRole,
//         requiredRole: 'recruiter'
//       });
//     }

//     // Optionnel : Vérification supplémentaire dans la base de données
//     if (process.env.VERIFY_ROLE_IN_DB === 'true') {
//       try {
//         const user = await User.findById(req.user.id);
//         if (!user || (user.role !== 'recruiter' && user.role !== 'employer')) {
//           console.warn('🚫 Rôle en DB différent du token:', {
//             userId: req.user.id,
//             tokenRole: userRole,
//             dbRole: user?.role
//           });
          
//           return res.status(403).json({ 
//             message: 'Accès refusé. Rôle invalide.' 
//           });
//         }
//       } catch (dbError) {
//         console.error('❌ Erreur vérification rôle en DB:', dbError);
//         // Continuer avec le rôle du token si la vérification DB échoue
//       }
//     }

//     console.log('✅ Accès recruteur autorisé:', req.user.id);
//     next();

//   } catch (error) {
//     console.error('❌ Erreur dans le middleware recruiterOnly:', error);
//     res.status(500).json({ 
//       message: 'Erreur interne du serveur lors de la vérification des permissions.' 
//     });
//   }
// };

// // Middleware plus flexible qui accepte plusieurs rôles
// const roleRequired = (allowedRoles = []) => {
//   return async (req, res, next) => {
//     try {
//       if (!req.user) {
//         return res.status(401).json({ 
//           message: 'Accès non autorisé. Authentification requise.' 
//         });
//       }

//       const userRole = req.user.role || req.user.userType;
      
//       console.log('🔍 Vérification rôles autorisés:', {
//         userId: req.user.id,
//         userRole: userRole,
//         allowedRoles: allowedRoles
//       });

//       if (!allowedRoles.includes(userRole)) {
//         console.warn('🚫 Rôle non autorisé:', {
//           userId: req.user.id,
//           userRole: userRole,
//           allowedRoles: allowedRoles
//         });

//         return res.status(403).json({ 
//           message: `Accès refusé. Rôles autorisés: ${allowedRoles.join(', ')}`,
//           currentRole: userRole,
//           allowedRoles: allowedRoles
//         });
//       }

//       console.log('✅ Rôle autorisé:', userRole);
//       next();

//     } catch (error) {
//       console.error('❌ Erreur dans le middleware roleRequired:', error);
//       res.status(500).json({ 
//         message: 'Erreur interne du serveur lors de la vérification des permissions.' 
//       });
//     }
//   };
// };

// // Middleware pour vérifier si l'utilisateur peut accéder à une candidature spécifique
// const canAccessApplication = async (req, res, next) => {
//   try {
//     const applicationId = req.params.id;
//     const userId = req.user.id;
//     const userRole = req.user.role || req.user.userType;

//     console.log('🔍 Vérification accès candidature:', {
//       applicationId,
//       userId,
//       userRole
//     });

//     // Les recruteurs peuvent accéder à toutes les candidatures de leurs offres
//     if (userRole === 'recruiter' || userRole === 'employer') {
//       // Ici vous pourriez ajouter une vérification pour s'assurer que la candidature
//       // correspond à une offre du recruteur, mais pour simplifier on autorise tout
//       console.log('✅ Accès autorisé - recruteur');
//       return next();
//     }

//     // Les candidats ne peuvent accéder qu'à leurs propres candidatures
//     if (userRole === 'candidate' || userRole === 'user') {
//       // Ici vous devriez vérifier que la candidature appartient bien au candidat
//       // const application = await Application.findById(applicationId);
//       // if (application.candidateId.toString() !== userId) { ... }
//       console.log('✅ Accès autorisé - candidat (vérification propriétaire requise)');
//       return next();
//     }

//     console.warn('🚫 Rôle non reconnu:', userRole);
//     res.status(403).json({ 
//       message: 'Accès refusé. Rôle non autorisé.' 
//     });

//   } catch (error) {
//     console.error('❌ Erreur vérification accès candidature:', error);
//     res.status(500).json({ 
//       message: 'Erreur lors de la vérification des permissions.' 
//     });
//   }
// };

// module.exports = {
//   recruiterOnly,
//   roleRequired,
//   canAccessApplication
// };