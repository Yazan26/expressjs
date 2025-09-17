const logger = require('../util/logger');

/**
 * Enhanced request logging middleware to replace Morgan
 */
const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  
  // Log the incoming request
  logger.info(`📥 Incoming ${req.method} ${req.originalUrl}`, {
    service: 'HTTP',
    action: 'REQUEST_START',
    method: req.method,
    url: req.originalUrl,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent')?.substring(0, 100),
    userId: req.session?.user?.id || 'Anonymous',
    referer: req.get('Referer') || 'Direct'
  });

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const responseTime = Date.now() - startTime;
    
    // Call original end method
    originalEnd.call(this, chunk, encoding);
    
    // Log the completed request
    logger.request(req, res, responseTime);
  };

  next();
};

module.exports = requestLogger;