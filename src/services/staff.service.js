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
    // Get films that could be offered (affordable films)
    filmsDao.getAllFilms(options, function(err, filmResult) {
      if (err) return callback(err);
      
      filmsDao.getCategories(function(catErr, categories) {
        if (catErr) return callback(catErr);
        
        // Transform films into offers format
        const offers = filmResult.films.map(function(film) {
          return {
            film_id: film.film_id,
            title: film.title,
            description: film.description,
            rental_rate: film.rental_rate,
            category_name: film.category_name,
            rating: film.rating,
            status: 'available'
          };
        });
        
        callback(null, {
          offers: offers,
          categories: categories,
          pagination: filmResult.pagination
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
  },

  /**
   * Select an offer for staff member
   */
  selectOffer: function(staffId, filmId, callback) {
    // For now, just log the selection and return success
    // In a real implementation, this would save to a staff_selections table
    console.log('Staff', staffId, 'selected film offer', filmId);
    
    // Simple success response
    callback(null, {
      staffId: staffId,
      filmId: filmId,
      selectedAt: new Date()
    });
  }

};

module.exports = staffService;