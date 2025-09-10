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
        if(error) next (error);
        if (users){
            userId == undefined
                ? res.render('users/table', {users:users})
                : res.render('users/details', {user:users[0]});
        }
    });

    },

     update: (req, res, next) => {
      let userId = req.params.userId;
      let {email, first_name, last_name, active} = req.body;

    if (req.method === "GET") {
      userService.get(userId, (error, users) => {
        if (error) return next(error);
        if (users) return res.render("users/edit", { user: users[0] });
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
    userService.delete(userId, (error, users) => {
      if (error) return next(error);
      if (users) {
        res.json({
          status: 200,
          message: `user with id ${userId} deleted successfully`,
          data: [],
        });
      }
    });
  },
  
};


module.exports = usersController