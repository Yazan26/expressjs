const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staff.controller');
const requireAuth = require('../middleware/requireAuth');
const requireRole = require('../middleware/requireRole');

/**
 * Staff Routes - Staff operations and offers
 */

// Middleware: Require authentication and staff/manager role
router.use(requireAuth);
router.use(requireRole(['staff', 'manager']));

// GET /staff/offers - Staff offers dashboard
router.get('/offers', staffController.getOffers);

// GET /staff/selections - View staff selections
router.get('/selections', staffController.getSelections);

module.exports = router;