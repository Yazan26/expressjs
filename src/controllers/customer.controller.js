const customerService = require('../services/customer.service');

/**
 * Customer Controller - Simple customer endpoints
 */
const customerController = {

  /**
   * GET /customer/dashboard - Customer dashboard
   */
  getDashboard: function(req, res, next) {
    const customerId = req.session.user?.id;
    
    if (!customerId) {
      return res.redirect('/auth/login');
    }

    customerService.getDashboardData(customerId, function(err, data) {
      if (err) {
        console.error('Error fetching customer dashboard:', err);
        return next(err);
      }

      res.render('customer/dashboard', {
        title: 'Customer Dashboard',
        customer: data.customer,
        rentals: data.rentals,
        spending: data.spending,
        recommendations: data.recommendations,
        summary: {
          totalRentals: data.rentals ? data.rentals.length : 0,
          totalSpent: data.spending ? data.spending.total : 0,
          activeRentals: 0,
          favoriteFilms: 0
        }
      });
    });
  },

  /**
   * GET /customer/profile - Customer profile
   */
  getProfile: function(req, res, next) {
    const customerId = req.session.user?.id;
    
    if (!customerId) {
      return res.redirect('/auth/login');
    }

    customerService.getCustomerProfile(customerId, function(err, customer) {
      if (err) {
        console.error('Error fetching customer profile:', err);
        return next(err);
      }

      res.render('customer/profile', {
        title: 'Customer Profile',
        customer: customer
      });
    });
  },

  /**
   * GET /customer/movies - Browse movies
   */
  getMovies: function(req, res, next) {
    const options = {
      search: req.query.search || '',
      category: req.query.category || 'all',
      page: parseInt(req.query.page) || 1,
      limit: 12
    };

    customerService.getMoviesData(options, function(err, data) {
      if (err) {
        console.error('Error fetching movies:', err);
        return next(err);
      }

      res.render('customer/movies', {
        title: 'Browse Movies',
        movies: data.movies || [],
        categories: data.categories || [],
        pagination: data.pagination || null,
        currentSearch: options.search,
        currentCategory: options.category
      });
    });
  },

  /**
   * GET /customer/movies/:id - Movie details
   */
  getMovieDetails: function(req, res, next) {
    const movieId = parseInt(req.params.id);
    const customerId = req.session.user?.id;

    customerService.getMovieDetails(movieId, customerId, function(err, data) {
      if (err) {
        console.error('Error fetching movie details:', err);
        return next(err);
      }

      res.render('customer/movie-details', {
        title: data.movie.title,
        movie: data.movie,
        available: data.available,
        recommendations: data.recommendations || []
      });
    });
  },

  /**
   * POST /customer/rent/:id - Rent a movie
   */
  postRentMovie: function(req, res, next) {
    const movieId = parseInt(req.params.id);
    const customerId = req.session.user?.id;

    if (!customerId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    customerService.rentMovie(customerId, movieId, function(err, result) {
      if (err) {
        console.error('Error renting movie:', err);
        req.flash('error', err.message || 'Failed to rent movie');
        return res.redirect('/customer/movies/' + movieId);
      }

      req.flash('success', 'Movie rented successfully!');
      res.redirect('/customer/dashboard');
    });
  },

  /**
   * GET /customer/spending - Spending history
   */
  getSpending: function(req, res, next) {
    const customerId = req.session.user?.id;
    const period = req.query.period || 'all';

    if (!customerId) {
      return res.redirect('/auth/login');
    }

    customerService.getSpendingData(customerId, period, function(err, data) {
      if (err) {
        console.error('Error fetching spending data:', err);
        return next(err);
      }

      res.render('customer/spending', {
        title: 'Spending History',
        spending: data.spending || [],
        summary: data.summary || {},
        currentPeriod: period
      });
    });
  }

};

module.exports = customerController;