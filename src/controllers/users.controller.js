const userService = require("../services/users.service")
const logger = require("../util/logger")
const {expect} = require("chai")

const usersController={

    validate:(req,res,next)=>{
      let userId = req.params.userId;
      let {email, first_name, last_name, active} = req.body;
      active = parseInt(active)
      userService.validate(email, first_name, last_name, active, (error) => {
        if (error) next(error);
        next();
      });
    },

    get:(req,res,next)=>{
      let userId = req.params.userId;
      userService.get(userId,(error,users)=>{
        if(error) return next(error);
        if (!users) return next(new Error('No users found'));

        // Normalize fields for views (ensure customer_id exists)
        const normalize = (u) => ({
          ...u,
          customer_id: u.customer_id || u.id,
        });

        if (userId == undefined) {
          return res.render('users/table', { users: users.map(normalize) });
        } else {
          return res.render('users/details', { user: normalize(users[0]) });
        }
      });
    },

     update: (req, res, next) => {
      let userId = req.params.userId;
      let {email, first_name, last_name, active} = req.body;

    if (req.method === "GET") {
      userService.get(userId, (error, users) => {
        if (error) return next(error);
        if (!users) return next(new Error('User not found'));
        const u = users[0] || users;
        const normalized = { ...u, customer_id: u.customer_id || u.id };
        return res.render("users/edit", { user: normalized });
      });
    } else {
      userService.update(email, userId, first_name, last_name, active, (error, result) => {
        if (error) return next(error);
        if (result) return res.redirect(301, `/users/${userId}/details`);
      });
    }
  },

  delete: (req, res, next) => {
    let userId = req.params.userId;
    userService.delete(userId, (error, result) => {
      if (error) {
        return res.status(500).json({
            status: 500,
            message: error.message || "Delete failed" });
      }
      return res.json({
          status: 200,
          message: "User deleted",
          result });
    });
  },
  CheckRentals: (req, res, next) => {
    let userId = req.params.userId;
    userService.CheckRentals(userId, (error, rentals) => {
      if (error) return next(error);
      expect(rentals).to.be.an("array");
      if (rentals.length > 0) {
        return res.status(400).json({
          status: 400,
          message: "User has active rentals",
        });
      }
      next();
    });
  },
  
  getRentals: (req, res, next) => {
    const userId = req.params.userId;
    userService.getRentals(userId, function(err, rentals){
      if (err) return next(err);
      res.render('users/rentals', { userId, rentals: rentals });
    });
  },

  getSpending: (req, res, next) => {
    const userId = req.params.userId;
    userService.getSpending(userId, function(err, spendingData){
      if (err) return next(err);
      res.render('users/spending', {
        userId,
        total: spendingData.total,
        paymentsCount: spendingData.paymentsCount,
        monthly: spendingData.monthly
      });
    });
  }

};


module.exports = usersController
