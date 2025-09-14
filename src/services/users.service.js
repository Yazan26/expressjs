const { expect } = require("chai");
const { update } = require("../controllers/users.controller");
const usersDao = require("../dao/users.dao");

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
    if(users) {
        if(userId==undefined) return callback(undefined,users);
        let user = users.filter((user)=>user.customer_id == userId)[0];
        console.log(user)
        return callback(undefined,[user])};
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
  
}

module.exports = userService;