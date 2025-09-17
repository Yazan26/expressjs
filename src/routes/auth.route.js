var express = require('express');
var router = express.Router();

const authController = require('../controllers/auth.controller');

/**
 * Auth Routes - Simplified
 */

// Login routes
router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);

// Register routes
router.get('/register', authController.getRegister);
router.post('/register', authController.postRegister);

// Logout route
router.post('/logout', authController.postLogout);

module.exports = router;