const adminOnly = (req, res, next) => { 
  if (req.user && req.user.role === 'admin') { 
    next(); 
  } else { 
    res.status(403).json({ message: 'Access denied. Admin only.' }); 
  } 
}; 
 
const adminOrSelf = (req, res, next) => { 
  if (req.user && (req.user.role === 'admin' || req.user._id.toString() === req.params.id)) { 
    next(); 
  } else { 
    res.status(403).json({ message: 'Access denied. Admin or self only.' }); 
  } 
}; 
 
module.exports = { adminOnly, adminOrSelf };