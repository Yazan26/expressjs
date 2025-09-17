const database = require('../db/sql/connection');

const usersDao = {
    
    // Get user by ID
    getUserById: function(userId, callback) {
        database.query(
            'SELECT customer_id as id, first_name, last_name, email FROM customer WHERE customer_id = ?',
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
            database.query('SELECT customer_id as id, first_name, last_name, email, active FROM customer LIMIT 50', callback);
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
};

module.exports = usersDao;
