const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const requireAuth = require('../middleware/requireAuth');
const requireRole = require('../middleware/requireRole');

/**
 * Admin Routes - Administrative operations
 */

// Middleware: Require authentication and admin role
router.use(requireAuth);
router.use(requireRole('admin'));

// Film management
router.get('/films', adminController.getFilms);

// Staff management
router.get('/staff', adminController.getStaff);

module.exports = router;