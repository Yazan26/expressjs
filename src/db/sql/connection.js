const mysql = require('mysql2');
 
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'yazan',
    password: process.env.DB_PASSWORD || '3S2>2wdU0p2',
    database: process.env.DB_DATABASE || 'sakila',
    port: process.env.DB_PORT || 3306,
    connectionLimit: 10,
    maxIdle: 10,
    idleTimeout: 60000,
    queueLimit: 0
 
});
 
module.exports = pool;