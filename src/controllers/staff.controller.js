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
      page: parseInt(req.query.page) || 1,
      limit: 20
    };

    staffService.getOffersData(options, function(err, data) {
      if (err) {
        console.error('Error fetching staff offers:', err);
        return next(err);
      }

      res.render('staff/offers', {
        title: 'Staff Offers',
        offers: data.offers || [],
        categories: data.categories || [],
        currentCategory: options.category,
        pagination: data.pagination || null
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
  },

  /**
   * POST /staff/offers/select - Select an offer
   */
  postSelectOffer: function(req, res, next) {
    const filmId = req.body.film_id;
    const staffId = req.session.user?.id;

    if (!filmId || !staffId) {
      return res.status(400).json({ error: 'Missing film_id or staff not authenticated' });
    }

    staffService.selectOffer(staffId, filmId, function(err, result) {
      if (err) {
        console.error('Error selecting offer:', err);
        return res.status(500).json({ error: 'Failed to select offer' });
      }

      res.json({ success: true, message: 'Offer selected successfully' });
    });
  }

};

module.exports = staffController;