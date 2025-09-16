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
        req.session.isLoggedIn = true;
        req.session.user = user;
        res.redirect('/users');
      });
  },
  logout: (req, res, next) => {
    req.method === 'GET' 
    ? res.redirect('/auth/login', { title: 'Logout' }) 
    : next();
  },

  isLoggedIn(req, res, next) {
    req.method === 'GET' 
    ? res.render('isLoggedIn', { title: 'Check Login' }) 
    : next();
  },

};

module.exports = AuthController;
