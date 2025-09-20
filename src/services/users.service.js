const { expect } = require("chai");
const usersDao = require("../dao/users.dao");
const logger = require("../util/logger");

const userService={
    validate:(email, first_name, last_name, active, callback)=>{
        try{
            expect(first_name).to.be.a('string','first name moet een waarde hebben');
            expect(last_name).to.be.a('string','last name moet een waarde hebben');
            expect(email).to.be.a('string','email moet een waarde hebben');
            expect(email).to.include('@','email moet een geldig email adres zijn');
            expect(active).to.be.a('number','active moet 1 of 0 zijn');

            callback(undefined);
        }
        catch(error){
        return callback(error);
        }

    },


    get:(userId,callback)=>{
      usersDao.get(userId,(error,users)=>{
        if(error) return callback(error,undefined);
        if(!users) return callback(undefined, undefined);

        // If no userId, users is an array (list view)
        if(userId == undefined) return callback(undefined, users);

        // When userId is provided, DAO returns a single object
        let user;
        if (Array.isArray(users)) {
          user = users.find(u => String(u.customer_id || u.id) === String(userId));
        } else {
          user = users; // already a single record from DAO
        }

        logger.debug('User filtered from results', {
          service: 'USERS',
          action: 'GET_USER_FILTERED',
          userId: userId,
          found: !!user
        });

        return callback(undefined, user ? [user] : []);
      });
    },
    update:(email,userId,first_name,last_name, active, callback)=>{
            usersDao.update(email,userId,first_name,last_name,active,(error,result)=>{
                if(error) return callback(error,undefined);
                if(result) return callback(undefined,result);

            });
        },

    
  delete: function(userId, callback) {
    // First, check for active rentals
    usersDao.HasActiveRentals(userId, (error, hasRentals) => {
      if (error) return callback(error, undefined);
      if (hasRentals) return callback(new Error("User has active rentals and cannot be deleted."), undefined);
      // If no active rentals, proceed with deletion
      usersDao.deletePayments(userId, (error) => {
        if (error) return callback(error, undefined);
        usersDao.deleteRentals(userId, (error) => {
          if (error) return callback(error, undefined);
          usersDao.deleteCustomer(userId, (error) => {
            if (error) return callback(error, undefined);
            callback(undefined, { message: "User deleted successfully." });
          });
        });
      });
    });
  },
  
  // Check if user has active rentals before deletion
  CheckRentals: function(userId, callback) {
    usersDao.HasActiveRentals(userId, (error, hasActive) => {
      if (error) return callback(error, undefined);
      // Controller expects an array; return non-empty array if has active rentals
      return callback(undefined, hasActive ? [{}] : []);
    });
  },

  // Get rental history for a user
  getRentals: function(userId, callback) {
    usersDao.getRentals(userId, (error, rentals) => {
      if (error) return callback(error, undefined);
      return callback(undefined, rentals || []);
    });
  },

  // Get spending information for a user
  getSpending: function(userId, callback) {
    usersDao.getSpendingSummary(userId, (error, summary) => {
      if (error) return callback(error, undefined);

      usersDao.getMonthlySpending(userId, (error2, monthly) => {
        if (error2) return callback(error2, undefined);

        const spendingData = {
          total: summary && summary[0] ? summary[0].total : 0,
          paymentsCount: summary && summary[0] ? summary[0].payments : 0,
          monthly: monthly || []
        };

        return callback(undefined, spendingData);
      });
    });
  },
}

module.exports = userService;
