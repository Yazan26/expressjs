const AuthController = {

validate: (req, res, next) => {
 next();
},

  login: (req, res, next) => {
    let {email, password} = req.body;
    req.method == 'GET'
    ? res.render('auth/login')
    : auth.Service.login(email, password, (error, user) => {
        if (error) return next(error);
        req.session.authenticated = true;
        req.session.user = user;
        res.redirect('/users');
      });
  },
  logout: (req, res, next) => {
    req.session.destroy((err) => {
    res.redirect('/auth/login');
    });

  },
  register: (req, res, next) => {
    let { email, password } = req.body;
    auth.Service.register(email, password, (error, user) => {
      if (error) return next(error);
      req.session.isLoggedIn = true;
      req.session.user = user;
      res.redirect('/users');
    });
  },


};

module.exports = AuthController;
