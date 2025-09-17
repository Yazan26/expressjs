const pool = require('../db/sql/connection');
const logger = require('../util/logger');

/**
 * Auth DAO - Simple database access with minimal error handling
 */
const authDao = {

  getUserByUsername: function(username, callback) {
    const sql = `
      SELECT 
        auth_id as id, username, password_hash, user_type, user_id,
        CASE 
          WHEN user_type = 'staff' THEN 'staff'
          ELSE 'customer' 
        END as role
      FROM user_auth 
      WHERE username = ? AND is_active = TRUE
    `;
    
    pool.query(sql, [username], function(err, rows) {
      if (err) {
        logger.database('SELECT', 'user_auth', false, err, {
          action: 'GET_USER_BY_USERNAME',
          username: username
        });
        return callback(err);
      }
      
      logger.database('SELECT', 'user_auth', true, null, {
        action: 'GET_USER_BY_USERNAME',
        username: username,
        found: rows.length > 0
      });
      
      callback(null, rows.length > 0 ? rows[0] : null);
    });
  },

  registerCustomer: function(data, callback) {
    const { firstName, lastName, email, username, passwordHash } = data;

    // Insert customer first
    const customerSql = `
      INSERT INTO customer (store_id, first_name, last_name, email, address_id, active, create_date) 
      VALUES (1, ?, ?, ?, 1, 1, NOW())
    `;
    
    pool.query(customerSql, [firstName, lastName, email], function(err, result) {
      if (err) {
        console.error('Database error creating customer:', err.message);
        if (err.code === 'ER_DUP_ENTRY') {
          return callback(new Error('Email already registered'));
        }
        return callback(err);
      }
      
      const customerId = result.insertId;
      
      // Insert auth record
      const authSql = `INSERT INTO user_auth (user_type, user_id, username, password_hash) VALUES ('customer', ?, ?, ?)`;
      
      pool.query(authSql, [customerId, username, passwordHash], function(authErr, authResult) {
        if (authErr) {
          console.error('Database error creating auth:', authErr.message);
          if (authErr.code === 'ER_DUP_ENTRY') {
            return callback(new Error('Username already taken'));
          }
          return callback(authErr);
        }
        
        callback(null, { customerId, authId: authResult.insertId });
      });
    });
  }
};

module.exports = authDao;