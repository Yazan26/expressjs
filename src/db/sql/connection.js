const mysql = require('mysql2');
const logger = require('../../util/logger');
// Load dotenv only if .env file exists (safe for Azure deployment)
try {
  require('dotenv').config();
} catch (err) {
  console.log('No .env file found in database connection, using environment variables');
}

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT,
    connectionLimit: 10,
    maxIdle: 10,
    idleTimeout: 60000,
    queueLimit: 0
});

// Enhanced error logging for database connections
pool.on('error', (err) => {
    logger.error('Database pool error occurred', err, {
        service: 'DATABASE',
        action: 'POOL_ERROR'
    });
});

pool.on('connection', (connection) => {
    logger.info('New database connection established', {
        service: 'DATABASE',
        action: 'CONNECTION_CREATED',
        connectionId: connection.threadId,
    });
});

pool.on('release', (connection) => {
    logger.debug('Database connection released', {
        service: 'DATABASE',
        action: 'CONNECTION_RELEASED',
        connectionId: connection.threadId
    });
});

// Log initial connection info
logger.info('Database pool initialized', {
    service: 'DATABASE',
    action: 'POOL_INIT',
    connectionLimit: 10
});

module.exports = pool;