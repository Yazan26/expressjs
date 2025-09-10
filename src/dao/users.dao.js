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
       delete: (userId, callback) => {
    database.query(
      "DELETE FROM customer WHERE customer_id = ?",
      [userId],
      (error, results) => {
        if (error) return callback(error, undefined);
        if (results) return callback(undefined, results);
      }
    );
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
