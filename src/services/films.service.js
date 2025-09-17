const filmsDao = require('../dao/films.dao');

/**
 * Films Service - Simple film operations
 */
const filmsService = {

  /**
   * Get films data with categories for display
   */
  getFilmsData: function(options, callback) {
    filmsDao.getAllFilms(options, function(err, result) {
      if (err) return callback(err);
      
      filmsDao.getCategories(function(catErr, categories) {
        if (catErr) return callback(catErr);
        
        callback(null, {
          films: result.films,
          pagination: result.pagination,
          categories: categories
        });
      });
    });
  },

  /**
   * Get film details by ID
   */
  getFilmDetails: function(filmId, callback) {
    filmsDao.getFilmById(filmId, callback);
  }

};

module.exports = filmsService;