const database = require('../db/sql/connection');

/**
 * Offers Data Access Object - Simple offers operations
 */
const offersDao = {

  /**
   * Get all active offers (simplified)
   */
  getActiveOffers: function(callback) {
    const query = `
      SELECT f.film_id, f.title, f.description, f.rental_rate,
             c.name as category_name, 'active' as status
      FROM film f
      LEFT JOIN film_category fc ON f.film_id = fc.film_id
      LEFT JOIN category c ON fc.category_id = c.category_id
      WHERE f.rental_rate < 3.00
      ORDER BY f.title ASC
      LIMIT 20
    `;
    
    database.query(query, [], callback);
  },

  /**
   * Get offers for staff view
   */
  getOffersForStaff: function(options, callback) {
    const { category, status } = options;
    
    let query = `
      SELECT f.film_id, f.title, f.description, f.rental_rate,
             c.name as category_name, 'active' as status
      FROM film f
      LEFT JOIN film_category fc ON f.film_id = fc.film_id
      LEFT JOIN category c ON fc.category_id = c.category_id
      WHERE f.rental_rate < 4.00
    `;
    
    let params = [];
    
    if (category && category !== 'all') {
      query += ' AND c.category_id = ?';
      params.push(category);
    }
    
    query += ' ORDER BY f.title ASC LIMIT 50';
    
    database.query(query, params, callback);
  }

};

module.exports = offersDao;