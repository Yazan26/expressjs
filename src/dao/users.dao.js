const database = require('../db/sql/connection');


const usersDao = {
    get: (userId, callback) => {
       database.query(
           userId == undefined
               ? `SELECT * FROM ??`
               : `SELECT * FROM ?? WHERE ?? = ?`,

        userId == undefined ? ['customer'] : ['customer', 'customer_id', userId],
         (error, results) => {
           if (error) return callback(error, undefined);
           if (results) return callback(undefined, results);
       });
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
