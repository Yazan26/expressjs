const usersDao = require('../dao/users.dao');

/**
 * Customer Service - Simple customer operations
 */
const customerService = {

  /**
   * Get customer dashboard data
   */
  getDashboardData: function(customerId, callback) {
    // Get customer basic info
    usersDao.getUserById(customerId, function(err, customer) {
      if (err) return callback(err);
      
      // Simple mock data for now
      const dashboardData = {
        customer: customer,
        rentals: [],
        spending: {
          thisMonth: 0,
          lastMonth: 0,
          total: 0
        },
        recommendations: []
      };
      
      callback(null, dashboardData);
    });
  },

  /**
   * Get customer profile data
   */
  getCustomerProfile: function(customerId, callback) {
    usersDao.getUserById(customerId, callback);
  }

};

module.exports = customerService;