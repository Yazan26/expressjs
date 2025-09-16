const AuthController = {


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
  }
};

module.exports = AuthController;
