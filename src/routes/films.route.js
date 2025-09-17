const express = require('express');
const router = express.Router();
const filmsController = require('../controllers/films.controller');

/**
 * Films Routes - Public film browsing and search
 */

// GET /films - Browse and search films (public)
router.get('/', filmsController.getFilms);

// GET /films/:id - Film details with recommendations (public)
router.get('/:id', filmsController.getFilmDetails);

module.exports = router;