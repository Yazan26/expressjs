/**
 * Authentication Middleware
 * Blocks unauthenticated access to protected routes
 * Attaches req.user from session for authenticated users
 */

/**
 * Middleware to require authentication
 * Redirects to login page if user is not authenticated
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object  
 * @param {Function} next - Express next middleware function
 */
const requireAuth = (req, res, next) => {
  // Check if user is authenticated (has valid session)
  if (!req.session || !req.session.user) {
    // Store the original URL for redirect after login
    req.session.redirectUrl = req.originalUrl;
    
    // Set error message for login page
    req.session.error = 'Please log in to access this page';
    
    // Redirect to login page
    return res.redirect('/auth/login');
  }

  // User is authenticated, attach user to request object
  req.user = req.session.user;
  
  // Continue to next middleware/route handler
  next();
};

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
    // Check if user has required role
    if (!req.user || !req.user.role || !roles.includes(req.user.role)) {
      // Store the original URL for potential redirect
      req.session.redirectUrl = req.originalUrl;
      
      // Set error message
      req.session.error = `Access denied. Required role: ${roles.join(' or ')}`;
      
      // Redirect based on user's current role or to login
      if (req.user && req.user.role) {
        // User is logged in but doesn't have the right role
        if (req.user.role === 'customer') {
          return res.redirect('/customer/dashboard');
        } else if (req.user.role === 'staff' || req.user.role === 'manager') {
          return res.redirect('/reports/staff-performance');
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

/**
 * Middleware to require manager or staff role
 * Shortcut for common role requirement
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const requireStaff = requireRole(['staff', 'manager']);

/**
 * Middleware to require manager role only
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const requireManager = requireRole('manager');

/**
 * Middleware to require customer role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const requireCustomer = requireRole('customer');

/**
 * Middleware to redirect authenticated users away from auth pages
 * Prevents authenticated users from seeing login page
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const redirectAuthenticated = (req, res, next) => {
  // If user is already authenticated, redirect to appropriate dashboard
  if (req.session && req.session.user) {
    const user = req.session.user;
    
    if (user.role === 'customer') {
      return res.redirect('/customer/dashboard');
    } else if (user.role === 'staff' || user.role === 'manager') {
      return res.redirect('/reports/staff-performance');
    } else {
      return res.redirect('/');
    }
  }

  // User is not authenticated, continue to auth page
  next();
};

module.exports = requireAuth;