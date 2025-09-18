const filmsService = require('../services/films.service');
const logger = require('../util/logger');

/**
 * Films Controller - Simple films endpoints
 */
const filmsController = {

  /**
   * GET /films - Films directory page
   */
  getFilms: function(req, res, next) {
    const options = {
      search: req.query.q || req.query.search || '',
      category: req.query.category || 'all',
      rating: req.query.rating || 'all',
      page: parseInt(req.query.page) || 1,
      limit: 12
    };

    filmsService.getFilmsData(options, function(err, data) {
      if (err) {
        return next(err);
      }

      // Transform data to match view expectations
      const transformedFilms = (data.films || []).map(film => ({
        ...film,
        filmId: film.film_id,
        releaseYear: film.release_year,
        rentalRate: film.rental_rate
      }));

      res.render('films/index', {
        title: 'Film Directory',
        films: transformedFilms,
        categories: data.categories || [],
        ratings: data.ratings || ['G', 'PG', 'PG-13', 'R', 'NC-17'],
        searchQuery: options.search,
        currentSearch: options.search,
        currentCategory: options.category,
        currentRating: options.rating,
        pagination: data.pagination || {}
      });
    });
  },

  /**
   * GET /films/:id - Film details page
   */
  getFilmDetails: function(req, res, next) {
    const filmId = parseInt(req.params.id);
    const filmsDao = require('../dao/films.dao');

    filmsService.getFilmDetails(filmId, function(err, film) {
      if (err) {
        return next(err);
      }

      // Get actors for the film
      filmsDao.getFilmActors(filmId, function(err, actors) {
        if (err) {
          return next(err);
        }

        // Transform data to match view expectations
        const transformedFilm = {
          ...film,
          filmId: film.film_id,
          releaseYear: film.release_year,
          rentalRate: film.rental_rate,
          rentalDuration: film.rental_duration,
          replacementCost: film.replacement_cost,
          specialFeatures: film.special_features
        };

        const transformedActors = (actors || []).map(actor => ({
          ...actor,
          actorName: `${actor.first_name} ${actor.last_name}`
        }));

        res.render('films/detail', {
          title: `${film.title} - Film Details`,
          film: transformedFilm,
          actors: transformedActors,
          authenticated: !!req.session.user,
          user: req.session.user
        });
      });
    });
  },

  /**
   * POST /films/:id/rent - Rent a film
   */
  rentFilm: function(req, res, next) {
    const filmId = parseInt(req.params.id);
    const customerId = req.session.user?.id;

    // Check if user is a customer
    if (req.session.user?.role !== 'customer') {
      req.flash('error', 'Only customers can rent movies');
      return res.redirect(`/films/${filmId}`);
    }

    // Use customer service for rental logic
    const customerService = require('../services/customer.service');
    
    customerService.rentMovie(customerId, filmId, function(err, result) {
      if (err) {
        req.flash('error', err.message || 'Failed to rent movie');
        return res.redirect(`/films/${filmId}`);
      }

      req.flash('success', 'Movie rented successfully! View your rentals in the dashboard.');
      res.redirect('/customer/dashboard');
    });
  }

};

module.exports = filmsController;