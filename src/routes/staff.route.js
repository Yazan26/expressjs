const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staff.controller');
const requireAuth = require('../middleware/requireAuth');
const requireRole = require('../middleware/requireRole');

/**
 * Staff Routes - Staff operations and offers
 */

// Middleware: Require authentication and staff or admin role
router.use(requireAuth);
router.use(requireRole(['staff', 'admin']));

// GET /staff/offers - Staff offers dashboard
router.get('/offers', staffController.getOffers);

// POST /staff/offers/select - Select an offer
router.post('/offers/select', staffController.postSelectOffer);

// GET /staff/selections - View staff selections
router.get('/selections', staffController.getSelections);

module.exports = router;