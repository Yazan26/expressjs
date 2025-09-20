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
      sort: req.query.sort || 'title',
      page: parseInt(req.query.page) || 1,
      limit: 12
    };

    filmsService.getFilmsData(options, function(err, data) {
      if (err) {
        return next(err);
      }

      // Transform data to match view expectations
      let transformedFilms = (data.films || []).map(film => ({
        ...film,
        filmId: film.film_id,
        releaseYear: film.release_year,
        rentalRate: film.rental_rate
      }));
      
      // Enrich with active discounts and optionally sort within page
      const usersDao = require('../dao/users.dao');
      const filmIds = transformedFilms.map(f => f.filmId).filter(Boolean);
      if (filmIds.length === 0) {
        return res.render('films/index', {
          title: 'Film Directory',
          films: transformedFilms,
          categories: data.categories || [],
          ratings: data.ratings || ['G', 'PG', 'PG-13', 'R', 'NC-17'],
          searchQuery: options.search,
          currentSearch: options.search,
          currentCategory: options.category,
          currentRating: options.rating,
          currentSort: options.sort,
          pagination: data.pagination || {}
        });
      }

      const placeholders = filmIds.map(() => '?').join(',');
      const q = `SELECT film_id, discount_percentage FROM film_offers WHERE is_active = 1 AND film_id IN (${placeholders})`;
      usersDao.query(q, filmIds, function(qErr, rows) {
        const pctMap = (!qErr && rows) ? new Map(rows.map(r => [r.film_id, parseFloat(r.discount_percentage || 0)])) : new Map();
        transformedFilms = transformedFilms.map(f => {
          const rate = parseFloat(f.rentalRate) || 0;
          const pct = pctMap.get(f.filmId) || 0;
          const discAmt = +(rate * pct / 100).toFixed(2);
          const discPrice = +(rate - discAmt).toFixed(2);
          return pct > 0 ? { ...f, discount_percent: pct, discount_amount: discAmt, discounted_price: discPrice } : f;
        });

        // Sort by requested field within current page
        switch (options.sort) {
          case 'discount_desc':
            transformedFilms.sort((a,b)=> (b.discount_percent||0)-(a.discount_percent||0) || String(a.title).localeCompare(String(b.title)));
            break;
          case 'discount_asc':
            transformedFilms.sort((a,b)=> (a.discount_percent||0)-(b.discount_percent||0) || String(a.title).localeCompare(String(b.title)));
            break;
          case 'price_asc':
            transformedFilms.sort((a,b)=> {
              const pa = (a.discounted_price != null ? a.discounted_price : a.rentalRate || 0);
              const pb = (b.discounted_price != null ? b.discounted_price : b.rentalRate || 0);
              if (pa === pb) return String(a.title).localeCompare(String(b.title));
              return pa - pb;
            });
            break;
          case 'price_desc':
            transformedFilms.sort((a,b)=> {
              const pa = (a.discounted_price != null ? a.discounted_price : a.rentalRate || 0);
              const pb = (b.discounted_price != null ? b.discounted_price : b.rentalRate || 0);
              if (pa === pb) return String(a.title).localeCompare(String(b.title));
              return pb - pa;
            });
            break;
          case 'title':
            transformedFilms.sort((a,b)=> String(a.title).localeCompare(String(b.title)));
            break;
        }

        res.render('films/index', {
          title: 'Film Directory',
          films: transformedFilms,
          categories: data.categories || [],
          ratings: data.ratings || ['G', 'PG', 'PG-13', 'R', 'NC-17'],
          searchQuery: options.search,
          currentSearch: options.search,
          currentCategory: options.category,
          currentRating: options.rating,
          currentSort: options.sort,
          pagination: data.pagination || {}
        });
      });
    });
  },

  /**
   * GET /films/:id - Film details page
   */
  getFilmDetails: function(req, res, next) {
    const filmId = parseInt(req.params.id);
    const filmsDao = require('../dao/films.dao');
    const usersDao = require('../dao/users.dao');

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
        let transformedFilm = {
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

        // Lookup any active discount for this film
        usersDao.query('SELECT discount_percentage FROM film_offers WHERE film_id = ? AND is_active = 1 LIMIT 1', [filmId], function(qErr, rows){
          if (!qErr && rows && rows.length) {
            const pct = parseFloat(rows[0].discount_percentage || 0);
            if (pct > 0) {
              const rate = parseFloat(transformedFilm.rentalRate) || 0;
              const discAmt = +(rate * pct / 100).toFixed(2);
              const discPrice = +(rate - discAmt).toFixed(2);
              transformedFilm = { ...transformedFilm, discount_percent: pct, discount_amount: discAmt, discounted_price: discPrice };
            }
          }

          res.render('films/detail', {
            title: `${film.title} - Film Details`,
            film: transformedFilm,
            actors: transformedActors,
            authenticated: !!req.session.user,
            user: req.session.user
          });
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
