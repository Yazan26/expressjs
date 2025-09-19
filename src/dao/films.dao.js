const database = require('../db/sql/connection');

const filmsDao = {

  // Enhanced getAllFilms with search, filters, and pagination
  getAllFilms: function(options = {}, callback) {
    const filters = [];
    const params = [];
    
    // Base query with availability status
    let query = `
      SELECT DISTINCT f.film_id, f.title, f.description, f.rating, f.rental_rate,
             f.length, f.release_year, c.name as category,
             COUNT(DISTINCT i.inventory_id) as total_copies,
             COUNT(DISTINCT CASE WHEN r.return_date IS NULL THEN r.rental_id END) as rented_copies,
             (COUNT(DISTINCT i.inventory_id) - COUNT(DISTINCT CASE WHEN r.return_date IS NULL THEN r.rental_id END)) as available_copies
      FROM film f
      LEFT JOIN film_category fc ON f.film_id = fc.film_id
      LEFT JOIN category c ON fc.category_id = c.category_id
      LEFT JOIN inventory i ON f.film_id = i.film_id
      LEFT JOIN rental r ON i.inventory_id = r.inventory_id
    `;
    
    // Add search filter
    if (options.search && options.search.trim()) {
      filters.push('(f.title LIKE ? OR f.description LIKE ?)');
      const searchTerm = '%' + options.search.trim() + '%';
      params.push(searchTerm, searchTerm);
    }
    
    // Add category filter
    if (options.category && options.category !== 'all' && options.category !== '') {
      filters.push('c.name = ?');
      params.push(options.category);
    }
    
    // Add rating filter
    if (options.rating && options.rating !== 'all' && options.rating !== '') {
      filters.push('f.rating = ?');
      params.push(options.rating);
    }
    
    // Add availability filter
    if (options.available === 'true') {
      filters.push('EXISTS (SELECT 1 FROM inventory i2 WHERE i2.film_id = f.film_id AND i2.inventory_id NOT IN (SELECT COALESCE(r2.inventory_id, 0) FROM rental r2 WHERE r2.return_date IS NULL))');
    }
    
    // Add WHERE clause if filters exist
    if (filters.length > 0) {
      query += ' WHERE ' + filters.join(' AND ');
    }
    
    // Add grouping and ordering
    query += ' GROUP BY f.film_id, f.title, f.description, f.rating, f.rental_rate, f.length, f.release_year, c.name';
    
    // Add sorting
    switch (options.sort) {
      case 'year':
        query += ' ORDER BY f.release_year DESC, f.title';
        break;
      case 'length':
        query += ' ORDER BY f.length DESC, f.title';
        break;
      case 'copies':
        query += ' ORDER BY total_copies ASC, f.title';
        break;
      default:
        query += ' ORDER BY f.title';
    }
    
    // Count total films for pagination
    const countQuery = query.replace(/SELECT.*?FROM/s, 'SELECT COUNT(DISTINCT f.film_id) as total FROM');
    const countParams = [...params];
    
    database.query(countQuery, countParams, function(countErr, countResult) {
      if (countErr) return callback(countErr);
      
      const totalFilms = countResult[0]?.total || 0;
      const limit = parseInt(options.limit) || 12;
      const currentPage = parseInt(options.page) || 1;
      const totalPages = Math.ceil(totalFilms / limit);
      const offset = (currentPage - 1) * limit;
      
      // Add pagination to main query
      query += ' LIMIT ? OFFSET ?';
      params.push(limit, offset);
      
      database.query(query, params, function(err, films) {
        if (err) return callback(err);
        
        callback(null, {
          films: films || [],
          pagination: {
            currentPage: currentPage,
            totalPages: totalPages,
            totalFilms: totalFilms,
            limit: limit,
            hasNext: currentPage < totalPages,
            hasPrev: currentPage > 1
          }
        });
      });
    });
  },

  // Enhanced getFilmById with detailed information
  getFilmById: function(filmId, callback) {
    const query = `
      SELECT f.*, 
             (SELECT c.name FROM film_category fc 
              JOIN category c ON fc.category_id = c.category_id 
              WHERE fc.film_id = f.film_id LIMIT 1) as category,
             (SELECT COUNT(*) FROM inventory i WHERE i.film_id = f.film_id) as total_copies,
             (SELECT COUNT(*) FROM inventory i 
              JOIN rental r ON i.inventory_id = r.inventory_id 
              WHERE i.film_id = f.film_id AND r.return_date IS NULL) as rented_copies,
             ((SELECT COUNT(*) FROM inventory i WHERE i.film_id = f.film_id) - 
              (SELECT COUNT(*) FROM inventory i 
               JOIN rental r ON i.inventory_id = r.inventory_id 
               WHERE i.film_id = f.film_id AND r.return_date IS NULL)) as available_copies
      FROM film f
      WHERE f.film_id = ?
    `;
    
    database.query(query, [filmId], function(err, results) {
      if (err) return callback(err);
      if (results.length === 0) return callback(new Error('Film not found'));
      callback(null, results[0]);
    });
  },

  // Get film recommendations based on category and actors
  getRecommendations: function(filmId, callback) {
    const query = `
      SELECT DISTINCT f.film_id, f.title, f.description, f.rating, f.rental_rate,
             c.name as category,
             COUNT(i.inventory_id) as total_copies,
             (COUNT(i.inventory_id) - COUNT(CASE WHEN r.return_date IS NULL THEN 1 END)) as available_copies
      FROM film f
      LEFT JOIN film_category fc ON f.film_id = fc.film_id
      LEFT JOIN category c ON fc.category_id = c.category_id
      LEFT JOIN inventory i ON f.film_id = i.film_id
      LEFT JOIN rental r ON i.inventory_id = r.inventory_id
      WHERE f.film_id != ? AND (
        fc.category_id IN (
          SELECT fc2.category_id 
          FROM film_category fc2 
          WHERE fc2.film_id = ?
        )
        OR f.film_id IN (
          SELECT fa2.film_id
          FROM film_actor fa1
          JOIN film_actor fa2 ON fa1.actor_id = fa2.actor_id
          WHERE fa1.film_id = ? AND fa2.film_id != ?
        )
      )
      GROUP BY f.film_id, f.title, f.description, f.rating, f.rental_rate, c.name
      ORDER BY available_copies DESC, f.title
      LIMIT 6
    `;
    
    database.query(query, [filmId, filmId, filmId, filmId], function(err, films) {
      if (err) return callback(err);
      callback(null, films);
    });
  },

  // Check if a specific film is available for rental
  isFilmAvailable: function(filmId, callback) {
    const query = `
      SELECT i.inventory_id
      FROM inventory i
      WHERE i.film_id = ? 
        AND i.inventory_id NOT IN (
          SELECT r.inventory_id 
          FROM rental r 
          WHERE r.return_date IS NULL
        )
      LIMIT 1
    `;
    
    database.query(query, [filmId], function(err, results) {
      if (err) return callback(err);
      callback(null, {
        available: results.length > 0,
        inventory_id: results.length > 0 ? results[0].inventory_id : null
      });
    });
  },

  // Get film actors
  getFilmActors: function(filmId, callback) {
    const query = `
      SELECT a.actor_id, a.first_name, a.last_name
      FROM actor a
      JOIN film_actor fa ON a.actor_id = fa.actor_id
      WHERE fa.film_id = ?
      ORDER BY a.first_name, a.last_name
    `;
    
    database.query(query, [filmId], function(err, actors) {
      if (err) return callback(err);
      callback(null, actors);
    });
  },

  getCategories: function(callback) {
    database.query('SELECT category_id, name FROM category ORDER BY name', callback);
  },

  // Get all unique ratings
  getRatings: function(callback) {
    database.query('SELECT DISTINCT rating FROM film ORDER BY rating', function(err, results) {
      if (err) return callback(err);
      const ratings = results.map(r => r.rating);
      callback(null, ratings);
    });
  }

};

module.exports = filmsDao;