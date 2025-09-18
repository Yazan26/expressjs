const filmsDao = require('../dao/films.dao');
const usersDao = require('../dao/users.dao');

/**
 * Admin Service - Simple admin operations
 */
const adminService = {

  /**
   * Get films data for admin management
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
   * Get staff data for admin management
   */
  getStaffData: function(callback) {
    const query = `
      SELECT 
        s.staff_id, 
        s.first_name, 
        s.last_name, 
        s.email, 
        s.username,
        s.role,
        s.active,
        CONCAT(s.first_name, ' ', s.last_name) as full_name
      FROM staff s
      ORDER BY s.first_name, s.last_name
    `;
    
    // For now, use users.dao connection - should be refactored later
    usersDao.query(query, [], callback);
  }

};

module.exports = adminService;