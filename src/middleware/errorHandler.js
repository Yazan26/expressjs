/**
 * Simple Error Handling Middleware
 */

/**
 * Global Error Handler
 */
const globalErrorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Something went wrong';

  // Handle specific database errors
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).render('error', {
      title: 'Error',
      error: { status: 409, message: 'Username or email already exists' }
    });
  }

  if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
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