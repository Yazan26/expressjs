const adminService = require('../services/admin.service');
const authService = require('../services/auth.service');

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
        staff: staff,
        success: req.flash('success'),
        error: req.flash('error')
      });
    });
  },

  /**
   * GET /admin/staff/new - New staff form
   */
  getNewStaff: function(req, res, next) {
    res.render('admin/staff-new', {
      title: 'Create New Staff - Admin',
      error: req.flash('error'),
      formData: req.flash('formData')[0] || {}
    });
  },

  /**
   * POST /admin/staff - Create new staff account
   */
  postCreateStaff: function(req, res, next) {
    const { firstName, lastName, email, username, password, role = 'staff' } = req.body;

    // Store form data for potential error redisplay
    req.flash('formData', { firstName, lastName, email, username, role });

    authService.createStaff({
      firstName,
      lastName, 
      email,
      username,
      password,
      role
    }, function(err, result) {
      if (err) {
        req.flash('error', err.message);
        return res.redirect('/admin/staff/new');
      }

      req.flash('success', `Staff account created successfully for ${firstName} ${lastName}`);
      res.redirect('/admin/staff');
    });
  }

};

module.exports = adminController;