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

// GET /staff - Staff dashboard (redirect to dashboard)
router.get('/', function(req, res) {
  res.redirect('/staff/dashboard');
});

// GET /staff/dashboard - Staff dashboard with stats
router.get('/dashboard', staffController.getDashboard);

// GET /staff/offers - Staff offers dashboard with discounts
router.get('/offers', staffController.getOffers);

// POST /staff/offers/select - Select an offer for discount
router.post('/offers/select', staffController.postSelectOffer);

// POST /staff/offers/unselect - Remove an offer selection
router.post('/offers/unselect', staffController.postUnselectOffer);

// GET /staff/selections - View staff selections with savings
router.get('/selections', staffController.getSelections);

module.exports = router;