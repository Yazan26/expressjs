const customerService = require('../services/customer.service');

const customerController = {

  getDashboard: function(req, res, next) {
    const customerId = req.session.user?.id;
    
    if (!customerId) {
      return res.redirect('/auth/login');
    }
    
    customerService.getDashboardData(customerId, function(err, data) {
      if (err) {
        console.error('Dashboard error:', err);
        return next(err);
      }
      
      res.render('customer/dashboard', {
        title: 'Customer Dashboard',
        user: req.session.user,
        activeRentals: data.activeRentals || [],
        summary: data.summary || {}
      });
    });
  },

  getProfile: function(req, res, next) {
    const customerId = req.session.user?.id;

    if (!customerId) {
      return res.redirect('/auth/login');
    }

    customerService.getCustomerProfile(customerId, function(err, data) {
      if (err) {
        console.error('Profile error:', err);
        return next(err);
      }

      res.render('customer/profile', {
        title: 'Customer Profile',
        user: req.session.user,
        customer: data.customer || null,
        accountStats: data.accountStats || null,
        messages: {
          success: req.flash('success') || [],
          error: req.flash('error') || []
        }
      });
    });
  },

  updateProfile: function(req, res, next) {
    const customerId = req.session.user?.id;
    const profileData = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      address: req.body.address || null,
      postalCode: req.body.postalCode || null,
      phone: req.body.phone || null
    };

    if (!customerId) {
      return res.redirect('/auth/login');
    }

    customerService.updateCustomerProfile(customerId, profileData, function(err, result) {
      if (err) {
        req.flash('error', err.message || 'Failed to update profile');
        return res.redirect('/customer/profile');
      }

      req.flash('success', 'Profile updated successfully!');
      res.redirect('/customer/profile');
    });
  },

  getMovies: function(req, res, next) {
    const options = {
      search: req.query.search || '',
      category: req.query.category || 'all',
      rating: req.query.rating || 'all',
      available: req.query.available || '',
      sort: req.query.sort || 'title',
      page: parseInt(req.query.page) || 1,
      limit: 12
    };

    customerService.getMovies(options, function(err, data) {
      if (err) return next(err);

      res.render('customer/movies', {
        title: 'Browse Movies',
        movies: data.movies || data.films || [],
        categories: data.categories || [],
        ratings: data.ratings || [],
        search: options.search,
        category: options.category,
        rating: options.rating,
        available: options.available,
        sort: options.sort,
        page: options.page,
        totalPages: (data.pagination && (data.pagination.totalPages || data.pagination.totalFilms && Math.ceil(data.pagination.totalFilms / (data.pagination.limit || options.limit)))) || 1
      });
    });
  },

  getMovieDetails: function(req, res, next) {
    const movieId = parseInt(req.params.filmId);
    const customerId = req.session.user?.id;

    if (!movieId) return next(new Error('Invalid movie ID'));

    customerService.getMovieDetails(movieId, customerId, function(err, data) {
      if (err) return next(err);

      res.render('customer/movie-details', {
        title: data.movie.title,
        movie: data.movie,
        actors: data.actors || [],
        recommendations: data.recommendations || []
      });
    });
  },

  rentMovie: function(req, res, next) {
    const movieId = parseInt(req.params.filmId);
    const customerId = req.session.user?.id;

    if (!customerId) {
      req.flash('error', 'You must be logged in to rent movies');
      return res.redirect('/auth/login');
    }

    customerService.rentMovie(customerId, movieId, function(err, result) {
      if (err) {
        req.flash('error', err.message || 'Failed to rent movie');
        return res.redirect('/customer/movies/' + movieId);
      }

      req.flash('success', 'Movie rented successfully!');
      res.redirect('/customer/dashboard');
    });
  },

  cancelRental: function(req, res, next) {
    const rentalId = parseInt(req.params.rentalId);
    const customerId = req.session.user?.id;

    if (!customerId) {
      req.flash('error', 'You must be logged in to cancel rentals');
      return res.redirect('/auth/login');
    }

    customerService.cancelRental(customerId, rentalId, function(err, result) {
      if (err) {
        req.flash('error', err.message || 'Failed to cancel rental');
        return res.redirect('/customer/dashboard');
      }

      req.flash('success', 'Rental cancelled successfully!');
      res.redirect('/customer/dashboard');
    });
  },

  getSpending: function(req, res, next) {
    const customerId = req.session.user?.id;
    const period = req.query.period || 'all';

    if (!customerId) {
      return res.redirect('/auth/login');
    }

    customerService.getSpendingData(customerId, period, function(err, data) {
      if (err) {
        console.error('Spending error:', err);
        return next(err);
      }

      res.render('customer/spending', {
        title: 'Spending History',
        user: req.session.user,
        spending: data.spending || [],
        summary: data.summary || {},
        currentPeriod: period,
        messages: {
          success: req.flash('success') || [],
          error: req.flash('error') || []
        }
      });
    });
  }

};

module.exports = customerController;
