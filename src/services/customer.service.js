const customerService = {
  
  getDashboardData: function(customerId, callback) {
    const customerDao = require('../dao/customer.dao');
    
    customerDao.getActiveRentals(customerId, function(err, rentals) {
      if (err) return callback(err);

      // Simple processing - add due dates and overdue flags
      const processedRentals = rentals.map(rental => {
        const dueDate = new Date(new Date(rental.rental_date).getTime() + (3 * 24 * 60 * 60 * 1000));
        return {
          ...rental,
          due_date: dueDate,
          is_overdue: new Date() > dueDate
        };
      });

      const summary = {
        total_active: processedRentals.length,
        total_overdue: processedRentals.filter(r => r.is_overdue).length,
        current_month_total: rentals.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0),
        total_spent: rentals.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0)
      };

      callback(null, { activeRentals: processedRentals, summary });
    });
  },

  getCustomerProfile: function(customerId, callback) {
    const customerDao = require('../dao/customer.dao');
    
    customerDao.getCustomerById(customerId, function(err, customer) {
      if (err) {
        return callback(err);
      }
      
      // Get account statistics
      customerDao.getCustomerStats(customerId, function(err, stats) {
        if (err) {
          console.error('Error getting customer stats:', err);
          // Continue without stats rather than failing
        }
        
        callback(null, {
          customer: customer,
          accountStats: stats || {
            activeRentals: 0,
            totalSpent: 0,
            totalRentals: 0,
            overdueFees: 0
          }
        });
      });
    });
  },

  updateCustomerProfile: function(customerId, profileData, callback) {
    const customerDao = require('../dao/customer.dao');
    
    // Basic validation
    if (!profileData.firstName || !profileData.lastName || !profileData.email) {
      return callback(new Error('Please fill in all required fields (First Name, Last Name, Email)'));
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profileData.email)) {
      return callback(new Error('Please enter a valid email address'));
    }

    customerDao.updateCustomer(customerId, profileData, function(err, result) {
      if (err) {
        return callback(err);
      }

      callback(null, result);
    });
  },

  getMovies: function(options, callback) {
    const filmsService = require('./films.service');
    filmsService.getFilmsData(options, callback);
  },

  getMovieDetails: function(movieId, customerId, callback) {
    const filmsService = require('./films.service');
    const filmsDao = require('../dao/films.dao');
    
    filmsService.getFilmDetails(movieId, function(err, movie) {
      if (err) return callback(err);
      
      // Add customer-specific data: availability, actors, recommendations
      filmsDao.isFilmAvailable(movieId, function(err, availability) {
        if (err) return callback(err);
        
        filmsDao.getFilmActors(movieId, function(err, actors) {
          if (err) return callback(err);
          
          filmsDao.getRecommendations(movieId, function(err, recommendations) {
            if (err) return callback(err);
            
            callback(null, {
              movie: {...movie, ...availability},
              actors: actors,
              recommendations: recommendations
            });
          });
        });
      });
    });
  },

  rentMovie: function(customerId, movieId, callback) {
    const customerDao = require('../dao/customer.dao');
    const filmsDao = require('../dao/films.dao');
    
    filmsDao.isFilmAvailable(movieId, function(err, availableData) {
      if (err) {
        return callback(err);
      }
      
      if (!availableData.available) {
        return callback(new Error('Movie is not available for rent'));
      }

      customerDao.hasActiveRental(customerId, movieId, function(err, hasRental) {
        if (err) {
          return callback(err);
        }
        
        if (hasRental) {
          return callback(new Error('You already have this movie rented'));
        }

        customerDao.createRental(customerId, movieId, function(err, result) {
          if (err) {
            return callback(err);
          }

          callback(null, result);
        });
      });
    });
  },

  cancelRental: function(customerId, rentalId, callback) {
    const customerDao = require('../dao/customer.dao');
    
    // Verify the rental belongs to the customer and is active
    customerDao.getRentalById(rentalId, function(err, rental) {
      if (err) {
        return callback(err);
      }
      
      if (!rental) {
        return callback(new Error('Rental not found'));
      }
      
      if (rental.customer_id !== customerId) {
        return callback(new Error('Unauthorized: This rental does not belong to you'));
      }
      
      if (rental.return_date) {
        return callback(new Error('This rental has already been returned'));
      }

      customerDao.cancelRental(rentalId, function(err, result) {
        if (err) {
          return callback(err);
        }

        callback(null, result);
      });
    });
  },

  getSpendingData: function(customerId, period, callback) {
    const customerDao = require('../dao/customer.dao');
    
    customerDao.getSpendingHistory(customerId, period, function(err, spending) {
      if (err) {
        return callback(err);
      }

      const totalAmount = spending.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
      const totalRentals = spending.length;

      const summary = {
        totalAmount: totalAmount.toFixed(2),
        totalRentals: totalRentals,
        period: period
      };

      callback(null, {
        spending: spending,
        summary: summary
      });
    });
  }

};

module.exports = customerService;