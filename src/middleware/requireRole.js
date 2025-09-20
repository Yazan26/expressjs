/**
 * Role-based authorization middleware
 */

/**
 * Middleware to require specific role(s)
 * Must be used after requireAuth middleware
 * @param {string|Array} allowedRoles - Role(s) that can access the route
 * @returns {Function} Middleware function
 */
const requireRole = (allowedRoles) => {
  // Normalize to array for consistent checking
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  
  return (req, res, next) => {
    // Check if user has required role - req.user should be set by requireAuth middleware
    const user = req.user || req.session?.user;
    
    if (!user || !user.role || !roles.includes(user.role)) {
      req.session.error = `Access denied. Required role: ${roles.join(' or ')}`;
      
      // Redirect based on user's current role or to login
      if (user && user.role) {
        // User is logged in but doesn't have the right role
        if (user.role === 'customer') {
          return res.redirect('/customer/dashboard');
        } else if (user.role === 'staff') {
          return res.redirect('/staff/offers');
        } else if (user.role === 'admin') {
          return res.redirect('/admin/films');
        } else {
          return res.redirect('/');
        }
      } else {
        // User is not logged in
        return res.redirect('/auth/login');
      }
    }

    // User has required role, continue
    next();
  };
};

module.exports = requireRole;