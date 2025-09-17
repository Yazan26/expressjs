const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer.controller');
const requireAuth = require('../middleware/requireAuth');
const requireRole = require('../middleware/requireRole');

/**
 * Customer Routes - Customer dashboard and profile
 */

// Middleware: Require authentication and customer role
router.use(requireAuth);
router.use(requireRole('customer'));

// GET /customer/dashboard - Customer dashboard
router.get('/dashboard', customerController.getDashboard);

// GET /customer/profile - Customer profile view
router.get('/profile', customerController.getProfile);

module.exports = router;