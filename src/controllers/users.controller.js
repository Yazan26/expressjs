const userService = require("../services/users.service")

const usersController={
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
    let email = req.body.email;
    let first_name = req.body.first_name;
    let last_name = req.body.last_name;

    if (req.method === "GET") {
      userService.get(userId, (error, users) => {
        if (error) return next(error);
        if (users) return res.render("users/edit", { user: users[0] });
      });
    } else {
      userService.update(email, userId, first_name, last_name, (error, result) => {
        if (error) return next(error);
        if (result) return res.redirect(301, `/users/${userId}/details`);
      });
    }
  },

  delete: (req, res, next) => {
    let userId = req.params.userId;
    userService.delete(userId, (error, result) => {
      if (error) return next(error);
      if (result) {
        // hier was 'users' niet gedefinieerd, dus je moet opnieuw alle users ophalen
        userService.get(undefined, (error, users) => {
          if (error) return next(error);
          return res.render("users/users", { users: users });
        });
      }
    });
  },
};


module.exports = usersController