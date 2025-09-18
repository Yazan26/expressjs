const db = require('../db/sql/connection');

const customerDao = {

  getActiveRentals: function(customerId, callback) {
    const query = `
      SELECT r.rental_id, r.rental_date, r.return_date,
             f.film_id, f.title, f.description, f.rating,
             p.amount
      FROM rental r
      JOIN inventory i ON r.inventory_id = i.inventory_id
      JOIN film f ON i.film_id = f.film_id
      LEFT JOIN payment p ON r.rental_id = p.rental_id
      WHERE r.customer_id = ? AND r.return_date IS NULL
      ORDER BY r.rental_date DESC
    `;
    
    db.query(query, [customerId], function(err, results) {
      if (err) {
        return callback(err);
      }
      
      callback(null, results);
    });
  },

  hasActiveRental: function(customerId, filmId, callback) {
    const query = `
      SELECT COUNT(*) as count
      FROM rental r
      JOIN inventory i ON r.inventory_id = i.inventory_id
      WHERE r.customer_id = ? AND i.film_id = ? AND r.return_date IS NULL
    `;
    
    db.query(query, [customerId, filmId], function(err, results) {
      if (err) {
        return callback(err);
      }
      
      const hasRental = results[0].count > 0;
      callback(null, hasRental);
    });
  },

  createRental: function(customerId, filmId, callback) {
    // First, find an available inventory item for the film
    const findInventoryQuery = `
      SELECT i.inventory_id
      FROM inventory i
      LEFT JOIN rental r ON i.inventory_id = r.inventory_id AND r.return_date IS NULL
      WHERE i.film_id = ? AND r.rental_id IS NULL
      LIMIT 1
    `;
    
    db.query(findInventoryQuery, [filmId], function(err, inventoryResults) {
      if (err) {
        return callback(err);
      }
      
      if (inventoryResults.length === 0) {
        return callback(new Error('No available copies of this movie'));
      }
      
      const inventoryId = inventoryResults[0].inventory_id;
      
      // Create the rental
      const createRentalQuery = `
        INSERT INTO rental (rental_date, inventory_id, customer_id, staff_id)
        VALUES (NOW(), ?, ?, 1)
      `;
      
      db.query(createRentalQuery, [inventoryId, customerId], function(err, result) {
        if (err) {
          return callback(err);
        }
        
        const rentalId = result.insertId;
        
        // Create payment record
        const createPaymentQuery = `
          INSERT INTO payment (customer_id, staff_id, rental_id, amount, payment_date)
          VALUES (?, 1, ?, 4.99, NOW())
        `;
        
        db.query(createPaymentQuery, [customerId, rentalId], function(err, paymentResult) {
          if (err) {
            return callback(err);
          }
          
          callback(null, {
            rentalId: rentalId,
            paymentId: paymentResult.insertId
          });
        });
      });
    });
  },

  getSpendingHistory: function(customerId, period, callback) {
    let dateFilter = '';
    let params = [customerId];
    
    if (period !== 'all') {
      if (period.match(/^\d{4}-\d{2}$/)) {
        // Monthly format: YYYY-MM
        dateFilter = 'AND DATE_FORMAT(p.payment_date, "%Y-%m") = ?';
        params.push(period);
      } else if (period === '30') {
        // Last 30 days
        dateFilter = 'AND p.payment_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)';
      } else if (period === '90') {
        // Last 90 days
        dateFilter = 'AND p.payment_date >= DATE_SUB(NOW(), INTERVAL 90 DAY)';
      }
    }
    
    const query = `
      SELECT p.payment_id, p.amount, p.payment_date,
             f.film_id, f.title, f.rating,
             r.rental_date, r.return_date
      FROM payment p
      JOIN rental r ON p.rental_id = r.rental_id
      JOIN inventory i ON r.inventory_id = i.inventory_id
      JOIN film f ON i.film_id = f.film_id
      WHERE p.customer_id = ? ${dateFilter}
      ORDER BY p.payment_date DESC
    `;
    
    db.query(query, params, function(err, results) {
      if (err) {
        return callback(err);
      }
      
      callback(null, results);
    });
  }

};

module.exports = customerDao;