const customerService = require('../services/customer.service');

/**
 * Customer Controller - Simple customer endpoints
 */
const customerController = {

  /**
   * GET /customer/dashboard - Customer dashboard
   */
  getDashboard: function(req, res, next) {
    const customerId = req.session.user?.id;
    
    if (!customerId) {
      return res.redirect('/auth/login');
    }

    customerService.getDashboardData(customerId, function(err, data) {
      if (err) {
        console.error('Error fetching customer dashboard:', err);
        return next(err);
      }

      res.render('customer/dashboard', {
        title: 'Customer Dashboard',
        customer: data.customer,
        rentals: data.rentals,
        spending: data.spending,
        recommendations: data.recommendations,
        summary: {
          totalRentals: data.rentals ? data.rentals.length : 0,
          totalSpent: data.spending ? data.spending.total : 0,
          activeRentals: 0,
          favoriteFilms: 0
        }
      });
    });
  },

  /**
   * GET /customer/profile - Customer profile
   */
  getProfile: function(req, res, next) {
    const customerId = req.session.user?.id;
    
    if (!customerId) {
      return res.redirect('/auth/login');
    }

    customerService.getCustomerProfile(customerId, function(err, customer) {
      if (err) {
        console.error('Error fetching customer profile:', err);
        return next(err);
      }

      res.render('customer/profile', {
        title: 'Customer Profile',
        customer: customer
      });
    });
  }

};

module.exports = customerController;