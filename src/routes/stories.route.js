const express = require('express');
const router = express.Router();
const storiesController = require('../controllers/stories.controller');

// GET /stories - display user stories grouped by role
router.get('/', storiesController.getStories);

module.exports = router;
