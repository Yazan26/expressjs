const db = require('../db/sql/connection');

const customerDao = {

  getActiveRentals: function(customerId, callback) {
    const query = `
      SELECT r.rental_id, r.rental_date, r.return_date,
             f.film_id, f.title, f.description, f.rating, f.rental_rate,
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
    // First, find an available inventory item for the film and get the rental rate
    const findInventoryQuery = `
      SELECT i.inventory_id, f.rental_rate
      FROM inventory i
      JOIN film f ON i.film_id = f.film_id
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
      const rentalRate = inventoryResults[0].rental_rate;
      
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
        
        // Create payment record with actual rental rate
        const createPaymentQuery = `
          INSERT INTO payment (customer_id, staff_id, rental_id, amount, payment_date)
          VALUES (?, 1, ?, ?, NOW())
        `;
        
        db.query(createPaymentQuery, [customerId, rentalId, rentalRate], function(err, paymentResult) {
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

  getRentalById: function(rentalId, callback) {
    const query = `
      SELECT r.rental_id, r.rental_date, r.return_date, r.customer_id,
             f.film_id, f.title
      FROM rental r
      JOIN inventory i ON r.inventory_id = i.inventory_id
      JOIN film f ON i.film_id = f.film_id
      WHERE r.rental_id = ?
    `;
    
    db.query(query, [rentalId], function(err, results) {
      if (err) {
        return callback(err);
      }
      
      callback(null, results[0] || null);
    });
  },

  cancelRental: function(rentalId, callback) {
    // Set the return_date to now to "return" the movie
    const query = `
      UPDATE rental
      SET return_date = NOW()
      WHERE rental_id = ? AND return_date IS NULL
    `;
    
    db.query(query, [rentalId], function(err, result) {
      if (err) {
        return callback(err);
      }
      
      if (result.affectedRows === 0) {
        return callback(new Error('Rental not found or already returned'));
      }
      
      callback(null, { rentalId: rentalId, returnedAt: new Date() });
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
  },

  getCustomerById: function(customerId, callback) {
    const query = `
      SELECT c.customer_id, c.first_name, c.last_name, c.email, 
             a.address, ci.city, a.postal_code, co.country, a.phone,
             c.active, c.create_date, c.last_update
      FROM customer c
      LEFT JOIN address a ON c.address_id = a.address_id
      LEFT JOIN city ci ON a.city_id = ci.city_id
      LEFT JOIN country co ON ci.country_id = co.country_id
      WHERE c.customer_id = ?
    `;
    
    db.query(query, [customerId], function(err, results) {
      if (err) {
        return callback(err);
      }
      
      if (results.length === 0) {
        return callback(null, null);
      }
      
      const customer = results[0];
      // Transform database fields to template-friendly names
      const transformedCustomer = {
        customerId: customer.customer_id,
        firstName: customer.first_name,
        lastName: customer.last_name,
        email: customer.email,
        address: customer.address,
        city: customer.city,
        postalCode: customer.postal_code,
        country: customer.country,
        phone: customer.phone,
        active: customer.active,
        createDate: customer.create_date,
        lastUpdate: customer.last_update
      };
      
      callback(null, transformedCustomer);
    });
  },

  getCustomerStats: function(customerId, callback) {
    const query = `
      SELECT 
        COUNT(CASE WHEN r.return_date IS NULL THEN 1 END) as active_rentals,
        COALESCE(SUM(p.amount), 0) as total_spent,
        COUNT(DISTINCT p.payment_id) as total_rentals,
        0 as overdue_fees
      FROM rental r
      LEFT JOIN payment p ON r.rental_id = p.rental_id
      WHERE r.customer_id = ?
    `;
    
    db.query(query, [customerId], function(err, results) {
      if (err) {
        return callback(err);
      }
      
      const stats = results[0] || {};
      callback(null, {
        activeRentals: parseInt(stats.active_rentals) || 0,
        totalSpent: parseFloat(stats.total_spent) || 0,
        totalRentals: parseInt(stats.total_rentals) || 0,
        overdueFees: parseFloat(stats.overdue_fees) || 0
      });
    });
  },

  updateCustomer: function(customerId, profileData, callback) {
    // First get the customer's current address_id
    const getAddressQuery = 'SELECT address_id FROM customer WHERE customer_id = ?';

    db.query(getAddressQuery, [customerId], function(err, results) {
      if (err) {
        return callback(err);
      }
      
      if (results.length === 0) {
        return callback(new Error('Customer not found'));
      }
      
      const addressId = results[0].address_id;
      
      // Update customer basic info
      const updateCustomerQuery = `
        UPDATE customer 
        SET first_name = ?, last_name = ?, email = ?, last_update = NOW()
        WHERE customer_id = ?
      `;
      
      db.query(updateCustomerQuery, [profileData.firstName, profileData.lastName, profileData.email, customerId], function(err, result) {
        if (err) {
          return callback(err);
        }
        
        // Update address if addressId exists
        if (addressId) {
          const updateAddressQuery = `
            UPDATE address 
            SET address = ?, postal_code = ?, phone = ?, last_update = NOW()
            WHERE address_id = ?
          `;
          
          db.query(updateAddressQuery, [profileData.address, profileData.postalCode || null, profileData.phone || null, addressId], function(err, addressResult) {
            if (err) {
              console.error('Error updating address:', err);
              // Continue even if address update fails
            }
            
            callback(null, { customerId: customerId, updated: true });
          });
        } else {
          callback(null, { customerId: customerId, updated: true });
        }
      });
    });
  },

  getDiscountedOffersForFilms: function(filmIds, callback) {
    if (!filmIds || filmIds.length === 0) return callback(null, []);
    const placeholders = filmIds.map(() => '?').join(',');
    const query = `SELECT film_id, discount_percentage FROM film_offers WHERE is_active = 1 AND film_id IN (${placeholders})`;
    db.query(query, filmIds, callback);
  },

  getOfferDiscount: function(filmId, callback) {
    db.query('SELECT discount_percentage FROM film_offers WHERE film_id = ? AND is_active = 1 LIMIT 1', [filmId], callback);
  }

};

module.exports = customerDao;
