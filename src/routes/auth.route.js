var express = require('express');
var router = express.Router();

const authController = require('../controllers/auth.controller');
const { redirectAuthenticated } = require('../middleware/requireAuth');

/**
 * Auth Routes
 */

// Login routes
router.get('/login', redirectAuthenticated, authController.getLogin);
router.post('/login', authController.postLogin);

// Register routes
router.get('/register', redirectAuthenticated, authController.getRegister);
router.post('/register', authController.postRegister);

// Logout route
router.post('/logout', authController.postLogout);

module.exports = router;