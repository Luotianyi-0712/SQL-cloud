const { validateAdminKey } = require('../utils/auth');

function adminAuthMiddleware(req, res, next) {
  const adminKey = req.headers['x-admin-key'] || req.query.adminKey;
  
  if (!adminKey || !validateAdminKey(adminKey)) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Admin key is required and must be valid'
    });
  }
  
  next();
}

module.exports = adminAuthMiddleware;
