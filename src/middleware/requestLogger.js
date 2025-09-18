const logger = require('../util/logger');

/**
 * Enhanced request logging middleware to replace Morgan
 * Filters out static assets to reduce noise
 */
const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  
  // Skip logging for static assets
  const isStaticAsset = (url) => {
    const staticExtensions = ['.css', '.js', '.ico', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.woff', '.woff2', '.ttf', '.eot'];
    const staticPaths = ['/bootstrap/', '/stylesheets/', '/javascripts/', '/images/', '/fonts/'];
    
    return staticExtensions.some(ext => url.endsWith(ext)) || 
           staticPaths.some(path => url.includes(path));
  };

  // Skip logging for static assets
  if (isStaticAsset(req.originalUrl)) {
    return next();
  }
  
  // Log the incoming request for important routes only
  logger.info(`📥 Incoming ${req.method} ${req.originalUrl}`, {
    service: 'HTTP',
    action: 'REQUEST_START',
    method: req.method,
    url: req.originalUrl,
    ip: req.ip || req.connection.remoteAddress,
    userId: req.session?.user?.id || 'Anonymous'
  });

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const responseTime = Date.now() - startTime;
    
    // Call original end method
    originalEnd.call(this, chunk, encoding);
    
    // Log the completed request (only for non-static assets)
    if (!isStaticAsset(req.originalUrl)) {
      logger.request(req, res, responseTime);
    }
  };

  next();
};

module.exports = requestLogger;