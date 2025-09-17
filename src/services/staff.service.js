const offersDao = require('../dao/offers.dao');
const filmsDao = require('../dao/films.dao');

/**
 * Staff Service - Simple staff operations
 */
const staffService = {

  /**
   * Get offers data for staff
   */
  getOffersData: function(options, callback) {
    offersDao.getOffersForStaff(options, function(err, offers) {
      if (err) return callback(err);
      
      filmsDao.getCategories(function(catErr, categories) {
        if (catErr) return callback(catErr);
        
        callback(null, {
          offers: offers,
          categories: categories
        });
      });
    });
  },

  /**
   * Get staff selections (simplified)
   */
  getSelections: function(staffId, callback) {
    // Simple mock for now
    callback(null, {
      selections: [],
      stats: {
        total: 0,
        active: 0,
        savings: 0
      }
    });
  }

};

module.exports = staffService;