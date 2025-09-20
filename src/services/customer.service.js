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
    const customerDao = require('../dao/customer.dao');
    
    filmsService.getFilmsData(options, function(err, result){
      if (err) return callback(err);
      const movies = result.films || result.movies || [];
      if (!movies.length) return callback(null, { ...result, movies });

      const filmIds = movies.map(m => m.film_id).filter(Boolean);
      if (!filmIds.length) return callback(null, { ...result, movies });

      customerDao.getDiscountedOffersForFilms(filmIds, function(qErr, rows){
        // If offers table missing or error, just return base data gracefully
        if (qErr) return callback(null, { ...result, movies });

        const byId = new Map(rows.map(r => [r.film_id, parseFloat(r.discount_percentage || 0)]));
        let enriched = movies.map(m => {
          const rate = parseFloat(m.rental_rate) || 0;
          const pct = byId.get(m.film_id) || 0;
          const discAmt = +(rate * pct / 100).toFixed(2);
          const discPrice = +(rate - discAmt).toFixed(2);
          return {
            ...m,
            discount_percent: pct,
            discount_amount: discAmt,
            discounted_price: pct > 0 ? discPrice : undefined
          };
        });

        // Optional client-side sorting within current page
        if (options.sort === 'discount_desc') {
          enriched = enriched.sort((a, b) => (b.discount_percent || 0) - (a.discount_percent || 0) || String(a.title).localeCompare(String(b.title)));
        } else if (options.sort === 'discount_asc') {
          enriched = enriched.sort((a, b) => (a.discount_percent || 0) - (b.discount_percent || 0) || String(a.title).localeCompare(String(b.title)));
        } else if (options.sort === 'price_asc') {
          enriched = enriched.sort((a, b) => {
            const pa = (a.discounted_price != null ? parseFloat(a.discounted_price) : parseFloat(a.rental_rate) || 0);
            const pb = (b.discounted_price != null ? parseFloat(b.discounted_price) : parseFloat(b.rental_rate) || 0);
            if (pa === pb) return String(a.title).localeCompare(String(b.title));
            return pa - pb;
          });
        } else if (options.sort === 'price_desc') {
          enriched = enriched.sort((a, b) => {
            const pa = (a.discounted_price != null ? parseFloat(a.discounted_price) : parseFloat(a.rental_rate) || 0);
            const pb = (b.discounted_price != null ? parseFloat(b.discounted_price) : parseFloat(b.rental_rate) || 0);
            if (pa === pb) return String(a.title).localeCompare(String(b.title));
            return pb - pa;
          });
        }

        callback(null, { ...result, movies: enriched, films: enriched });
      });
    });
  },

  getMovieDetails: function(movieId, customerId, callback) {
    const filmsService = require('./films.service');
    const filmsDao = require('../dao/films.dao');
    const customerDao = require('../dao/customer.dao');
    
    filmsService.getFilmDetails(movieId, function(err, movie) {
      if (err) return callback(err);

      const applyDiscountAndAssemble = function(baseMovie){
        // Add customer-specific data: availability, actors, recommendations
        filmsDao.isFilmAvailable(movieId, function(avErr, availability) {
          if (avErr) return callback(avErr);
          
          filmsDao.getFilmActors(movieId, function(actErr, actors) {
            if (actErr) return callback(actErr);
            
          filmsDao.getRecommendations(movieId, function(recErr, recommendations) {
            if (recErr) return callback(recErr);

            // Enrich recommendations with active offers if any
            const recIds = (recommendations || []).map(r => r.film_id);
            if (!recIds.length) {
              return callback(null, {
                movie: { ...baseMovie, ...availability },
                actors: actors,
                recommendations: recommendations
              });
            }

            const ph = recIds.map(() => '?').join(',');
            customerDao.getDiscountedOffersForFilms(recIds, function(rqErr, rows){
              if (rqErr) {
                return callback(null, {
                  movie: { ...baseMovie, ...availability },
                  actors: actors,
                  recommendations: recommendations
                });
              }
              const mapPct = new Map(rows.map(x => [x.film_id, parseFloat(x.discount_percentage || 0)]));
              const enrichedRecs = recommendations.map(rec => {
                const rate = parseFloat(rec.rental_rate) || 0;
                const pct = mapPct.get(rec.film_id) || 0;
                const amt = +(rate * pct / 100).toFixed(2);
                const price = +(rate - amt).toFixed(2);
                return pct > 0 ? { ...rec, discount_percent: pct, discount_amount: amt, discounted_price: price } : rec;
              });

              callback(null, {
                movie: { ...baseMovie, ...availability },
                actors: actors,
                recommendations: enrichedRecs
              });
            });
          });
          });
        });
      };

      // Try to enrich with active offer
      customerDao.getOfferDiscount(movieId, function(qErr, rows){
        if (qErr || !rows || !rows.length) return applyDiscountAndAssemble(movie);

        const pct = parseFloat(rows[0].discount_percentage || 0);
        if (!pct) return applyDiscountAndAssemble(movie);

        const rate = parseFloat(movie.rental_rate) || 0;
        const discAmt = +(rate * pct / 100).toFixed(2);
        const discPrice = +(rate - discAmt).toFixed(2);
        applyDiscountAndAssemble({
          ...movie,
          discount_percent: pct,
          discount_amount: discAmt,
          discounted_price: discPrice
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
