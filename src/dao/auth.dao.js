const pool = require('../db/sql/connection');
const logger = require('../util/logger');

/**
 * Auth DAO - Simple database access with minimal error handling
 */
const authDao = {

  getUserByUsername: function(username, callback) {
    // First try to find the user in the staff table
    const staffSql = `
      SELECT 
        staff_id as id, 
        username, 
        password_hash, 
        role,
        'staff' as user_type,
        first_name,
        last_name,
        email,
        active as is_active
      FROM staff 
      WHERE username = ? AND active = 1
    `;
    
    pool.query(staffSql, [username], function(err, staffRows) {
      if (err) {
        logger.database('SELECT', 'staff', false, err, {
          action: 'GET_USER_BY_USERNAME_STAFF',
          username: username
        });
        return callback(err);
      }
      
      if (staffRows.length > 0) {
        logger.database('SELECT', 'staff', true, null, {
          action: 'GET_USER_BY_USERNAME_STAFF',
          username: username,
          found: true,
          role: staffRows[0].role
        });
        return callback(null, staffRows[0]);
      }
      
      // If not found in staff, try customer table
      const customerSql = `
        SELECT 
          customer_id as id, 
          username, 
          password_hash, 
          'customer' as role,
          'customer' as user_type,
          first_name,
          last_name,
          email,
          active as is_active
        FROM customer 
        WHERE username = ? AND active = 1
      `;
      
      pool.query(customerSql, [username], function(err, customerRows) {
        if (err) {
          logger.database('SELECT', 'customer', false, err, {
            action: 'GET_USER_BY_USERNAME_CUSTOMER',
            username: username
          });
          return callback(err);
        }
        
        logger.database('SELECT', 'customer', true, null, {
          action: 'GET_USER_BY_USERNAME_CUSTOMER',
          username: username,
          found: customerRows.length > 0
        });
        
        callback(null, customerRows.length > 0 ? customerRows[0] : null);
      });
    });
  },

  registerCustomer: function(data, callback) {
    const { firstName, lastName, email, username, passwordHash } = data;

    // Insert customer with authentication data directly
    const customerSql = `
      INSERT INTO customer (
        store_id, 
        first_name, 
        last_name, 
        email, 
        username, 
        password_hash, 
        address_id, 
        active, 
        create_date
      ) VALUES (1, ?, ?, ?, ?, ?, 1, 1, NOW())
    `;
    
    pool.query(customerSql, [firstName, lastName, email, username, passwordHash], function(err, result) {
      if (err) {
        logger.database('INSERT', 'customer', false, err, {
          action: 'REGISTER_CUSTOMER',
          username: username,
          email: email
        });
        
        if (err.code === 'ER_DUP_ENTRY') {
          if (err.message.includes('email')) {
            return callback(new Error('Email already registered'));
          } else if (err.message.includes('username')) {
            return callback(new Error('Username already taken'));
          }
        }
        return callback(err);
      }
      
      const customerId = result.insertId;
      
      logger.database('INSERT', 'customer', true, null, {
        action: 'REGISTER_CUSTOMER',
        username: username,
        email: email,
        customerId: customerId
      });
      
      callback(null, { customerId: customerId });
    });
  },

  // New method to create staff accounts
  createStaff: function(data, callback) {
    const { firstName, lastName, email, username, passwordHash, role = 'staff', storeId = 1 } = data;

    const staffSql = `
      INSERT INTO staff (
        first_name, 
        last_name, 
        address_id, 
        email, 
        store_id, 
        active, 
        username, 
        password_hash, 
        role
      ) VALUES (?, ?, 1, ?, ?, 1, ?, ?, ?)
    `;
    
    pool.query(staffSql, [firstName, lastName, email, storeId, username, passwordHash, role], function(err, result) {
      if (err) {
        logger.database('INSERT', 'staff', false, err, {
          action: 'CREATE_STAFF',
          username: username,
          email: email,
          role: role
        });
        
        if (err.code === 'ER_DUP_ENTRY') {
          if (err.message.includes('email')) {
            return callback(new Error('Email already registered'));
          } else if (err.message.includes('username')) {
            return callback(new Error('Username already taken'));
          }
        }
        return callback(err);
      }
      
      const staffId = result.insertId;
      
      logger.database('INSERT', 'staff', true, null, {
        action: 'CREATE_STAFF',
        username: username,
        email: email,
        role: role,
        staffId: staffId
      });
      
      callback(null, { staffId: staffId });
    });
  }
};

module.exports = authDao;