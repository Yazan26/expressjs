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
      search: req.query.search || '',
      category: req.query.category || 'all',
      rating: req.query.rating || 'all',
      page: parseInt(req.query.page) || 1,
      limit: 12
    };

    filmsService.getFilmsData(options, function(err, data) {
      if (err) {
        logger.error('Failed to fetch films data', err, {
          service: 'FILMS',
          action: 'GET_FILMS',
          userId: req.session?.user?.id,
          filters: options
        });
        return next(err);
      }

      logger.info('Films data fetched successfully', {
        service: 'FILMS', 
        action: 'GET_FILMS',
        userId: req.session?.user?.id,
        filmCount: data.films?.length || 0,
        totalPages: data.pagination?.totalPages || 0
      });

      res.render('films/index', {
        title: 'Film Directory',
        films: data.films,
        categories: data.categories,
        ratings: ['G', 'PG', 'PG-13', 'R', 'NC-17'], // Standard film ratings
        pagination: data.pagination,
        currentSearch: options.search,
        currentCategory: options.category,
        currentRating: options.rating
      });
    });
  },

  /**
   * GET /films/:id - Film details page
   */
  getFilmDetails: function(req, res, next) {
    const filmId = parseInt(req.params.id);

    filmsService.getFilmDetails(filmId, function(err, film) {
      if (err) {
        logger.error('Failed to fetch film details', err, {
          service: 'FILMS',
          action: 'GET_FILM_DETAILS', 
          userId: req.session?.user?.id,
          filmId: filmId
        });
        return next(err);
      }

      logger.info('Film details fetched successfully', {
        service: 'FILMS',
        action: 'GET_FILM_DETAILS',
        userId: req.session?.user?.id,
        filmId: filmId,
        filmTitle: film?.title
      });

      res.render('films/detail', {
        title: `${film.title} - Film Details`,
        film: film
      });
    });
  }

};

module.exports = filmsController;