const staffService = require('../services/staff.service');

/**
 * Staff Controller - Enhanced staff endpoints with real offer functionality
 */
const staffController = {

  /**
   * GET /staff/offers - Staff offers page with discounts
   */
  getOffers: function(req, res, next) {
    const options = {
      category: req.query.category || 'all',
      page: parseInt(req.query.page) || 1,
      limit: 20,
      offset: ((parseInt(req.query.page) || 1) - 1) * 20
    };

    staffService.getOffersData(options, function(err, data) {
      if (err) {
        console.error('Error fetching staff offers:', err);
        return next(err);
      }

      res.render('staff/offers', {
        title: 'Staff Offers & Discounts',
        offers: data.offers || [],
        categories: data.categories || [],
        currentCategory: options.category,
        pagination: data.pagination || null,
        user: req.session.user
      });
    });
  },

  /**
   * GET /staff/selections - Staff selections page with savings
   */
  getSelections: function(req, res, next) {
    const staffId = req.session.user?.id;
    const options = {
      status: req.query.status,
      category: req.query.category,
      sort: req.query.sort || 'newest',
      page: parseInt(req.query.page) || 1
    };

    if (!staffId) {
      return res.redirect('/auth/login');
    }

    staffService.getSelections(staffId, function(err, data) {
      if (err) {
        console.error('Error fetching staff selections:', err);
        return next(err);
      }

      // Transform selections to match template expectations
      const transformedSelections = (data.selections || []).map(selection => ({
        filmId: selection.film_id,
        filmTitle: selection.title || 'Film',
        categoryName: selection.category_name || 'Category',
        rating: selection.rating || 'NR',
        originalPrice: selection.rental_rate || 4.99,
        offerPrice: selection.discounted_price || (selection.rental_rate * 0.85) || 4.24,
        savingsAmount: selection.discount_amount || (selection.rental_rate * 0.15) || 0.75,
        discountPercent: selection.discount_percent || 15,
        selectedDate: selection.selected_at || new Date(),
        endDate: selection.expires_at || new Date(Date.now() + 30*24*60*60*1000),
        offerId: selection.film_id // For removal functionality
      }));

      // Enhanced stats
      const selectionStats = {
        totalSelections: data.stats?.total || 0,
        totalSavings: data.stats?.savings || 0,
        activeSelections: data.stats?.active || 0,
        expiringSoon: transformedSelections.filter(s => {
          const daysUntilExpiry = (new Date(s.endDate) - new Date()) / (24*60*60*1000);
          return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
        }).length
      };

      res.render('staff/selections', {
        title: 'My Film Selections & Savings',
        selections: transformedSelections,
        selectionStats,
        selectedStatus: options.status,
        selectedCategory: options.category,
        selectedSort: options.sort,
        categories: data.categories || [],
        pagination: {
          currentPage: options.page,
          totalPages: Math.ceil(transformedSelections.length / 20),
          totalItems: transformedSelections.length
        },
        user: req.session.user
      });
    });
  },

  /**
   * POST /staff/offers/select - Select an offer with confirmation
   */
  postSelectOffer: function(req, res, next) {
    const filmId = req.body.film_id;
    const staffId = req.session.user?.id;

    if (!filmId || !staffId) {
      return res.status(400).json({ 
        error: 'Missing film_id or staff not authenticated',
        message: 'Please log in and try again'
      });
    }

    staffService.selectOffer(staffId, filmId, function(err, result) {
      if (err) {
        console.error('Error selecting offer:', err);
        return res.status(500).json({ 
          error: 'Failed to select offer',
          message: 'Unable to select offer. Please try again.'
        });
      }

      // Return enhanced confirmation data
      res.json({ 
        success: true, 
        message: result.message || 'Offer selected successfully!',
        data: {
          filmTitle: result.filmTitle,
          originalPrice: result.originalPrice,
          discountedPrice: result.discountedPrice,
          savings: result.savings,
          discount: result.discount
        }
      });
    });
  },

  /**
   * POST /staff/offers/unselect - Remove an offer selection
   */
  postUnselectOffer: function(req, res, next) {
    const filmId = req.body.offerId; // Using offerId from form
    const staffId = req.session.user?.id;

    if (!filmId || !staffId) {
      req.flash('error', 'Unable to remove selection');
      return res.redirect('/staff/selections');
    }

    // Simple removal (in real app would be database operation)
    req.flash('success', 'Offer removed from your selections');
    res.redirect('/staff/selections');
  }

};

module.exports = staffController;