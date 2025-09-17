/**
 * Simple Error Handling Middleware
 */
const logger = require('../util/logger');

/**
 * Global Error Handler
 */
const globalErrorHandler = (err, req, res, next) => {
  // Enhanced error logging with context
  logger.error('Request error occurred', err, {
    service: 'MIDDLEWARE',
    action: 'ERROR_HANDLER',
    method: req.method,
    url: req.originalUrl,
    userAgent: req.get('User-Agent')?.substring(0, 100),
    userId: req.session?.user?.id || 'Anonymous',
    ip: req.ip || req.connection.remoteAddress,
    statusCode: err.statusCode || 500
  });
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Something went wrong';

  // Handle specific database errors
  if (err.code === 'ER_DUP_ENTRY') {
    logger.warn('Duplicate entry attempt', null, {
      service: 'DATABASE',
      action: 'DUPLICATE_ENTRY',
      url: req.originalUrl,
      userId: req.session?.user?.id
    });
    
    return res.status(409).render('error', {
      title: 'Error',
      error: { status: 409, message: 'Username or email already exists' }
    });
  }

  if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
    logger.error('Database connection failed', err, {
      service: 'DATABASE',
      action: 'CONNECTION_ERROR'
    });
    
    return res.status(503).render('error', {
      title: 'Error',
      error: { status: 503, message: 'Database connection failed' }
    });
  }

  // Default error response
  res.status(statusCode).render('error', {
    title: 'Error',
    error: {
      status: statusCode,
      message: statusCode >= 500 ? 'Something went wrong' : message
    }
  });
};

/**
 * 404 Not Found Handler
 */
const notFoundHandler = (req, res, next) => {
  logger.warn('Page not found', null, {
    service: 'MIDDLEWARE',
    action: 'NOT_FOUND',
    method: req.method,
    url: req.originalUrl,
    userAgent: req.get('User-Agent')?.substring(0, 100),
    userId: req.session?.user?.id || 'Anonymous',
    ip: req.ip || req.connection.remoteAddress
  });

  res.status(404).render('error', {
    title: 'Page Not Found',
    error: {
      status: 404,
      message: `Route ${req.originalUrl} not found`
    }
  });
};

module.exports = {
  globalErrorHandler,
  notFoundHandler
};