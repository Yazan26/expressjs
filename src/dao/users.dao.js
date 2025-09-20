const database = require('../db/sql/connection');

const usersDao = {
    
    // Get user by ID
    getUserById: function(userId, callback) {
        database.query(
            'SELECT customer_id as id, first_name, last_name, email, active FROM customer WHERE customer_id = ?',
            [userId],
            (error, results) => {
                if (error) return callback(error, undefined);
                if (results && results.length > 0) {
                    return callback(undefined, results[0]);
                }
                return callback(new Error('User not found'), undefined);
            }
        );
    },
    
    // Get all users or user by ID
    get: function(userId, callback) {
        if (userId == undefined) {
            database.query('SELECT customer_id as id, first_name, last_name, email, active, CONCAT(LOWER(first_name), LOWER(last_name)) as username FROM customer', callback);
        } else {
            this.getUserById(userId, callback);
        }
    },
    
    // Direct query method for custom queries
    query: function(sql, params, callback) {
        database.query(sql, params, callback);
    },


    // check ff voor verhuurde items voordat een klant verwijderd wordt, zodat mensen niet kunnen stelen aub
  HasActiveRentals: function(userId, callback) {
    database.query(
      "SELECT COUNT(*) AS ?? FROM ?? WHERE ?? = ? AND ?? IS NULL",
      ["active_rentals", "rental", "customer_id", userId, "return_date"],
      (error, results) => {
        if (error) return callback(error, undefined);
        if (results) return callback(undefined, results[0].active_rentals > 0);
      }
    );
  },
  // delete data in de juiste volgorde om foreign key constraints te respecteren
  deletePayments: function(userId, callback) {
    database.query(
      "DELETE FROM ?? WHERE ?? = ?",
      ["payment", "customer_id", userId], callback);
  },
  deleteRentals: function(userId, callback) {
    database.query(
      "DELETE FROM ?? WHERE ?? = ?",
      ["rental", "customer_id", userId], callback);
  },
  deleteCustomer: function(userId, callback) {
    database.query(
      "DELETE FROM ?? WHERE ?? = ?",
      ["customer", "customer_id", userId], callback);
  },

  update: (email, userId, first_name, last_name, active, callback) => {
    database.query(
      "UPDATE ?? SET ?? = ?, ?? = ?, ?? = ?, ?? = ? WHERE ?? = ?",
      ["customer", "email", email, "first_name", first_name, "last_name", last_name, "active", active, "customer_id", userId],
      (error, results) => {
        if (error) return callback(error, undefined);
        if (results) return callback(undefined, results);
      }
    );
  },

  // Get rental history for a user
  getRentals: function(userId, callback) {
    const sql = `SELECT r.rental_id, f.title, r.rental_date, r.return_date,
                        COALESCE(p.amount, 0) as amount
                 FROM rental r
                 JOIN inventory i ON r.inventory_id = i.inventory_id
                 JOIN film f ON i.film_id = f.film_id
                 LEFT JOIN payment p ON p.rental_id = r.rental_id AND p.customer_id = r.customer_id
                 WHERE r.customer_id = ?
                 ORDER BY r.rental_date DESC`;
    database.query(sql, [userId], callback);
  },

  // Get spending summary for a user
  getSpendingSummary: function(userId, callback) {
    const sql = `SELECT COALESCE(SUM(amount),0) as total, COUNT(*) as payments
                 FROM payment WHERE customer_id = ?`;
    database.query(sql, [userId], callback);
  },

  // Get monthly spending breakdown for a user
  getMonthlySpending: function(userId, callback) {
    const sql = `SELECT DATE_FORMAT(payment_date, '%Y-%m') as period,
                        COALESCE(SUM(amount),0) as total,
                        COUNT(*) as count
                 FROM payment WHERE customer_id = ?
                 GROUP BY DATE_FORMAT(payment_date, '%Y-%m')
                 ORDER BY period DESC`;
    database.query(sql, [userId], callback);
  },
};

module.exports = usersDao;
