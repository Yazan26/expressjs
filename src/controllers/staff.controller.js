const staffService = require('../services/staff.service');

/**
 * Staff Controller - Simple staff endpoints
 */
const staffController = {

  /**
   * GET /staff/offers - Staff offers page
   */
  getOffers: function(req, res, next) {
    const options = {
      category: req.query.category || 'all',
      status: req.query.status || 'all'
    };

    staffService.getOffersData(options, function(err, data) {
      if (err) {
        console.error('Error fetching staff offers:', err);
        return next(err);
      }

      res.render('staff/offers', {
        title: 'Staff Offers',
        offers: data.offers,
        categories: data.categories,
        currentCategory: options.category,
        currentStatus: options.status
      });
    });
  },

  /**
   * GET /staff/selections - Staff selections page
   */
  getSelections: function(req, res, next) {
    const staffId = req.session.user?.id;

    staffService.getSelections(staffId, function(err, data) {
      if (err) {
        console.error('Error fetching staff selections:', err);
        return next(err);
      }

      res.render('staff/selections', {
        title: 'My Film Selections',
        selections: data.selections,
        stats: data.stats
      });
    });
  }

};

module.exports = staffController;