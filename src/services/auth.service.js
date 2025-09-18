const authDao = require('../dao/auth.dao');
const hash = require('../util/hash');

/**
 * Auth Service - Business logic with clean error handling
 */
const authService = {

  verifyLogin: (username, password, callback) => {
    if (!username || !password) {
      return callback(new Error('Username and password required'));
    }

    authDao.getUserByUsername(username, function(err, user) {
      if (err) return callback(err);
      if (!user) return callback(new Error('Invalid credentials'));

      hash.compare(password, user.password_hash, function(hashErr, isMatch) {
        if (hashErr) return callback(hashErr);
        if (!isMatch) return callback(new Error('Invalid credentials'));
        
        callback(null, {
          id: user.id,
          username: user.username,
          role: user.role
        });
      });
    });
  },

  registerCustomer: (data, callback) => {
    const { firstName, lastName, email, username, password } = data;
    
    // Basic validation
    if (!firstName || !lastName || !email || !username || !password) {
      return callback(new Error('All fields required'));
    }

    if (password.length < 6) {
      return callback(new Error('Password must be at least 6 characters'));
    }

    hash.create(password, function(err, passwordHash) {
      if (err) return callback(err);

      const customerData = { 
        firstName: firstName.trim(), 
        lastName: lastName.trim(), 
        email: email.toLowerCase().trim(), 
        username: username.trim(), 
        passwordHash 
      };
      
      authDao.registerCustomer(customerData, callback);
    });
  },

  createStaff: (data, callback) => {
    const { firstName, lastName, email, username, password, role = 'staff', storeId = 1 } = data;
    
    // Basic validation
    if (!firstName || !lastName || !email || !username || !password) {
      return callback(new Error('All fields required'));
    }

    if (password.length < 6) {
      return callback(new Error('Password must be at least 6 characters'));
    }

    if (!['staff', 'admin'].includes(role)) {
      return callback(new Error('Invalid role specified'));
    }

    hash.create(password, function(err, passwordHash) {
      if (err) return callback(err);

      const staffData = { 
        firstName: firstName.trim(), 
        lastName: lastName.trim(), 
        email: email.toLowerCase().trim(), 
        username: username.trim(), 
        passwordHash,
        role,
        storeId
      };
      
      authDao.createStaff(staffData, callback);
    });
  }
};

module.exports = authService;