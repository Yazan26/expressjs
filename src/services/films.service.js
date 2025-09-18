const filmsDao = require('../dao/films.dao');

/**
 * Films Service - Unified film operations for both public and customer use
 */
const filmsService = {

  /**
   * Get films data with categories and ratings for display
   */
  getFilmsData: function(options, callback) {
    filmsDao.getAllFilms(options, function(err, result) {
      if (err) return callback(err);
      
      filmsDao.getCategories(function(catErr, categories) {
        if (catErr) return callback(catErr);
        
        filmsDao.getRatings(function(ratErr, ratings) {
          if (ratErr) return callback(ratErr);
          
          callback(null, {
            films: result.films,
            movies: result.films, // Alias for customer controller
            categories: categories,
            ratings: ratings,
            pagination: result.pagination
          });
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