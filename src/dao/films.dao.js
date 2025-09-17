const database = require('../db/sql/connection');

/**
 * Films Data Access Object - Simple and focused film operations
 */
const filmsDao = {

  /**
   * Get all films with basic pagination and filtering
   */
  getAllFilms: function(options, callback) {
    const { search, category, page = 1, limit = 12 } = options;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT f.film_id, f.title, f.description, f.release_year, f.rating, 
             f.rental_rate, c.name as category_name
      FROM film f
      LEFT JOIN film_category fc ON f.film_id = fc.film_id
      LEFT JOIN category c ON fc.category_id = c.category_id
    `;
    
    let params = [];
    let whereConditions = [];
    
    if (search && search.trim()) {
      whereConditions.push('f.title LIKE ?');
      params.push(`%${search.trim()}%`);
    }
    
    if (category && category !== 'all') {
      whereConditions.push('c.category_id = ?');
      params.push(category);
    }
    
    if (whereConditions.length > 0) {
      query += ' WHERE ' + whereConditions.join(' AND ');
    }
    
    query += ' ORDER BY f.title ASC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    // Get count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM film f';
    if (whereConditions.length > 0) {
      countQuery += ' LEFT JOIN film_category fc ON f.film_id = fc.film_id LEFT JOIN category c ON fc.category_id = c.category_id';
      countQuery += ' WHERE ' + whereConditions.join(' AND ');
    }
    
    database.query(countQuery, params.slice(0, -2), function(err, countResult) {
      if (err) return callback(err);
      
      const total = countResult[0].total;
      const totalPages = Math.ceil(total / limit);
      
      database.query(query, params, function(err, films) {
        if (err) return callback(err);
        
        callback(null, {
          films: films,
          pagination: {
            currentPage: parseInt(page),
            totalPages: totalPages,
            totalCount: total,
            hasNext: page < totalPages,
            hasPrev: page > 1
          }
        });
      });
    });
  },

  /**
   * Get film by ID
   */
  getFilmById: function(filmId, callback) {
    const query = `
      SELECT f.*, c.name as category_name, l.name as language_name
      FROM film f
      LEFT JOIN film_category fc ON f.film_id = fc.film_id
      LEFT JOIN category c ON fc.category_id = c.category_id
      LEFT JOIN language l ON f.language_id = l.language_id
      WHERE f.film_id = ?
    `;
    
    database.query(query, [filmId], function(err, results) {
      if (err) return callback(err);
      if (results.length === 0) return callback(new Error('Film not found'));
      callback(null, results[0]);
    });
  },

  /**
   * Get all categories
   */
  getCategories: function(callback) {
    database.query('SELECT category_id, name FROM category ORDER BY name ASC', callback);
  }

};

module.exports = filmsDao;