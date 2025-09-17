const adminService = require('../services/admin.service');

/**
 * Admin Controller - Simple admin endpoints
 */
const adminController = {

  /**
   * GET /admin/films - Admin films management page
   */
  getFilms: function(req, res, next) {
    const options = {
      search: req.query.search || '',
      category: req.query.category || 'all',
      page: parseInt(req.query.page) || 1,
      limit: 12
    };

    adminService.getFilmsData(options, function(err, data) {
      if (err) {
        console.error('Error fetching admin films data:', err);
        return next(err);
      }

      res.render('admin/films', {
        title: 'Film Management - Admin',
        films: data.films,
        categories: data.categories,
        pagination: data.pagination,
        currentSearch: options.search,
        currentCategory: options.category
      });
    });
  },

  /**
   * GET /admin/staff - Admin staff management page
   */
  getStaff: function(req, res, next) {
    adminService.getStaffData(function(err, staff) {
      if (err) {
        console.error('Error fetching staff data:', err);
        return next(err);
      }

      res.render('admin/staff', {
        title: 'Staff Management - Admin',
        staff: staff
      });
    });
  }

};

module.exports = adminController;