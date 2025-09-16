var express = require('express');
var router = express.Router();

const authController = require("../controllers/auth.controller")

// GET /auth/login
router.get('/login', authController.validate, authController.login);

// POST /auth/login
router.post('/login', authController.validate, authController.login);


router.get('/logout', authController.logout);

module.exports = router;