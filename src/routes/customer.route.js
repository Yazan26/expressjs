const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer.controller');
const requireAuth = require('../middleware/requireAuth');
const requireRole = require('../middleware/requireRole');

// Middleware
router.use(requireAuth);
router.use(requireRole('customer'));

// Dashboard and Profile Routes
router.get('/dashboard', customerController.getDashboard);
router.get('/profile', customerController.getProfile);

// Movie Browsing and Rental Routes
router.get('/movies', customerController.getMovies);
router.get('/movies/:filmId', customerController.getMovieDetails);
router.post('/movies/:filmId/rent', customerController.rentMovie);

// Spending History Route
router.get('/spending', customerController.getSpending);

module.exports = router;