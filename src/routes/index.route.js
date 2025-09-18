var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { 
    title: 'Movie Rental Service',
    user: req.session.user || null,
    messages: {
      success: req.flash('success') || [],
      error: req.flash('error') || []
    },
    featuredFilms: [] // Can be populated later with actual featured films
  });
});

/* GET health check endpoint for CI/CD */
router.get('/health', function(req, res, next) {
  res.status(200).json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

module.exports = router;
