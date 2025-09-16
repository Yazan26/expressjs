const AuthController = {

  validate: (req, res, next) => {
   next();
  },

  login: (req, res, next) => {
    req.method === 'GET' 
    ? res.render('login', { title: 'Login' }) 
    : next();
   
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

  }