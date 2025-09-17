const authService = require('../services/auth.service');
const logger = require('../util/logger');

/**
 * Auth Controller - Clean HTTP handlers
 */
const authController = {

  getLogin: (req, res) => {
    if (req.session.user) {
      return res.redirect('/');
    }
    
    const error = req.session.error;
    delete req.session.error;

    res.render('auth/login', { 
      error,
      title: 'Login'
    });
  },

  postLogin: (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
      logger.warn('Login attempt with missing credentials', null, {
        service: 'AUTH',
        action: 'LOGIN_VALIDATION_FAILED',
        ip: req.ip,
        userAgent: req.get('User-Agent')?.substring(0, 100)
      });
      
      req.session.error = 'Username and password required';
      return res.redirect('/auth/login');
    }

    authService.verifyLogin(username, password, function(err, user) {
      if (err || !user) {
        logger.auth('login', username, false, err, {
          ip: req.ip,
          userAgent: req.get('User-Agent')?.substring(0, 100)
        });
        
        req.session.error = 'Invalid username or password';
        return res.redirect('/auth/login');
      }

      logger.auth('login', username, true, null, {
        userId: user.id,
        role: user.role,
        ip: req.ip
      });

      req.session.user = user;
      res.redirect('/');
    });
  },

  getRegister: (req, res) => {
    if (req.session.user) {
      return res.redirect('/');
    }
    
    const error = req.session.error;
    delete req.session.error;

    res.render('auth/register', { 
      error,
      title: 'Register'
    });
  },

  postRegister: (req, res) => {
    const { firstName, lastName, email, username, password, confirmPassword } = req.body;
    
    if (!firstName || !lastName || !email || !username || !password) {
      req.session.error = 'All fields required';
      return res.redirect('/auth/register');
    }

    if (password !== confirmPassword) {
      req.session.error = 'Passwords do not match';
      return res.redirect('/auth/register');
    }

    const data = { firstName, lastName, email, username, password };

    authService.registerCustomer(data, function(err, user) {
      if (err) {
        req.session.error = err.message;
        return res.redirect('/auth/register');
      }
      
      // Auto-login after registration
      req.session.user = {
        id: user.id || user.authId,
        username: user.username,
        role: 'customer'
      };
      
      res.redirect('/');
    });
  },

  postLogout: (req, res) => {
    req.session.destroy(function(err) {
      res.clearCookie('sakila.session.id');
      res.redirect('/auth/login');
    });
  }
};

module.exports = authController;
