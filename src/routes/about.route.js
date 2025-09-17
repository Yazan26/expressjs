const express = require('express');
const router = express.Router();
const aboutController = require('../controllers/about.controller');

/**
 * About Routes - About page with user stories
 */

// GET /about - About page (public)
router.get('/', aboutController.getAbout);

module.exports = router;