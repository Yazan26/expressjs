const winston = require('winston');
const { combine, timestamp, printf, colorize, errors, json } = winston.format;

// Custom format for better readability
const customFormat = printf(({ level, message, timestamp, service, action, userId, error, ...meta }) => {
  let logMessage = `] ${timestamp}`;
  
  // Add service context if provided
  if (service) {
    logMessage += ` 📂 ${service}`;
  }
  
  // Add action context if provided
  if (action) {
    logMessage += ` ⚡ ${action}`;
  }
  
  // Add user context if provided (only if not Anonymous)
  if (userId && userId !== 'Anonymous') {
    logMessage += ` 👤 User:${userId}`;
  }
  
  logMessage += ` | ${message}`;
  
  // Add error details if present
  if (error) {
    logMessage += `\n   💥 Error: ${error.message}`;
    if (error.stack && process.env.NODE_ENV !== 'production') {
      logMessage += `\n   📍 Stack: ${error.stack}`;
    }
  }
  
  // Add metadata if present (but filter out verbose data)
  if (Object.keys(meta).length > 0) {
    // Filter out noisy metadata
    const filteredMeta = { ...meta };
    delete filteredMeta.userAgent; // Too verbose
    delete filteredMeta.referer; // Usually not needed
    
    if (Object.keys(filteredMeta).length > 0) {
      logMessage += `\n   📊 Data: ${JSON.stringify(filteredMeta, null, 2)}`;
    }
  }
  
  return logMessage;
});

// Create logger with multiple transports
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    errors({ stack: true }),
    timestamp({ format: 'HH:mm:ss' }),
    customFormat
  ),
  transports: [
    // Console transport with colors
    new winston.transports.Console({
      format: combine(
        colorize({
          all: true,
          colors: {
            error: 'red',
            warn: 'yellow', 
            info: 'cyan',
            debug: 'magenta',
            verbose: 'blue'
          }
        }),
        customFormat
      )
    }),
    
    // File transport for errors (without colors)
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        json()
      ),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    
    // File transport for all logs
    new winston.transports.File({
      filename: 'logs/app.log',
      format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        json()
      ),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  ]
});

// Enhanced logger with utility methods
const enhancedLogger = {
  // Basic logging methods
  error: (message, error = null, context = {}) => {
    logger.error(message, { error, ...context });
  },
  
  warn: (message, context = {}) => {
    logger.warn(message, context);
  },
  
  info: (message, context = {}) => {
    logger.info(message, context);
  },
  
  debug: (message, context = {}) => {
    logger.debug(message, context);
  },
  
  // HTTP request logging
  request: (req, res, responseTime) => {
    const { method, url } = req;
    const { statusCode } = res;
    const userId = req.session?.user?.id || 'Anonymous';
    
    const statusEmoji = statusCode >= 500 ? '🔴' : statusCode >= 400 ? '🟡' : '🟢';
    
    // Simplified request logging
    logger.info(`${statusEmoji} ${method} ${url} - ${statusCode}`, {
      service: 'HTTP',
      action: 'REQUEST',
      method,
      url,
      statusCode,
      responseTime: `${responseTime}ms`,
      userId: userId !== 'Anonymous' ? userId : undefined
    });
  },
  
  // Database operation logging
  database: (operation, table, success = true, error = null, context = {}) => {
    const emoji = success ? '✅' : '❌';
    const level = success ? 'info' : 'error';
    
    logger[level](`${emoji} Database ${operation} on ${table}`, {
      service: 'DATABASE',
      action: operation.toUpperCase(),
      table,
      success,
      error,
      ...context
    });
  },
  
  // Authentication logging
  auth: (action, username, success = true, error = null, context = {}) => {
    const emoji = success ? '🔐' : '🚫';
    const level = success ? 'info' : 'warn';
    
    logger[level](`${emoji} Auth ${action} for ${username}`, {
      service: 'AUTH',
      action: action.toUpperCase(),
      username,
      success,
      error,
      ...context
    });
  },
  
  // Service operation logging
  service: (serviceName, action, success = true, error = null, context = {}) => {
    const emoji = success ? '⚙️' : '🔧';
    const level = success ? 'info' : 'error';
    
    logger[level](`${emoji} ${serviceName} ${action}`, {
      service: serviceName.toUpperCase(),
      action: action.toUpperCase(),
      success,
      error,
      ...context
    });
  },
  
  // Performance logging
  performance: (operation, duration, context = {}) => {
    const emoji = duration > 1000 ? '🐌' : duration > 500 ? '⏱️' : '⚡';
    
    logger.info(`${emoji} ${operation} completed in ${duration}ms`, {
      service: 'PERFORMANCE',
      action: 'TIMING',
      operation,
      duration,
      ...context
    });
  },
  
  // Application lifecycle logging
  lifecycle: (event, context = {}) => {
    const emoji = event === 'start' ? '🚀' : event === 'stop' ? '🛑' : '📋';
    
    logger.info(`${emoji} Application ${event}`, {
      service: 'APP',
      action: event.toUpperCase(),
      ...context
    });
  }
};

module.exports = enhancedLogger;