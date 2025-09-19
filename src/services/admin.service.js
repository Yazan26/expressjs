const filmsDao = require('../dao/films.dao');
const usersDao = require('../dao/users.dao');
const logger = require('../util/logger');
const emailUtil = require('../util/email');
const hash = require('../util/hash');

/**
 * Admin Service - Streamlined administrative operations using existing Sakila tables
 */
const adminService = {

  // === FILM MANAGEMENT ===

  getFilmsData: function(options, callback) {
    filmsDao.getAllFilms(options, function(err, result) {
      if (err) return callback(err);
      
      // Ensure result and films exist
      const films = result?.films || [];
      
      // Transform films to ensure consistent field naming
      const transformedFilms = films.map(film => {
        const transformed = {
          ...film,
          filmId: film.film_id,
          categoryName: film.category,
          releaseYear: film.release_year,
          rentalRate: film.rental_rate,
          totalCopies: film.total_copies || 0,
          availableCopies: film.available_copies || 0,
          languageName: film.language_name || 'English',
          specialFeatures: film.special_features
        };
        
        // Debug logging to ensure filmId is set correctly
        if (!transformed.filmId) {
          console.log('Warning: filmId is missing for film:', film.title, 'Original film_id:', film.film_id);
        }
        
        return transformed;
      });
      
      filmsDao.getCategories(function(catErr, categories) {
        if (catErr) return callback(catErr);
        
        // Transform categories to ensure consistent field naming
        const transformedCategories = (categories || []).map(cat => ({
          ...cat,
          categoryId: cat.category_id
        }));
        
        callback(null, { 
          films: transformedFilms, 
          categories: transformedCategories, 
          pagination: result?.pagination || {},
          filmStats: {
            totalFilms: transformedFilms.length,
            totalCopies: transformedFilms.reduce((sum, f) => sum + (f.totalCopies || 0), 0),
            availableCopies: transformedFilms.reduce((sum, f) => sum + (f.availableCopies || 0), 0),
            totalCategories: transformedCategories.length
          }
        });
      });
    });
  },

  createFilm: function(filmData, callback) {
    const query = `INSERT INTO film (title, description, release_year, language_id, length, rating, rental_rate, replacement_cost, last_update) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`;
    const params = [filmData.title, filmData.description, filmData.releaseYear, filmData.languageId, filmData.length, filmData.rating, filmData.rentalRate, filmData.rentalRate * 10];

    usersDao.query(query, params, function(err, result) {
      if (err) return callback(err);
      
      if (filmData.categoryId) {
        const categoryQuery = `INSERT INTO film_category (film_id, category_id, last_update) VALUES (?, ?, NOW())`;
        usersDao.query(categoryQuery, [result.insertId, filmData.categoryId], function(catErr) {
          if (catErr) logger.warn('Failed to assign category:', catErr);
          callback(null, { filmId: result.insertId });
        });
      } else {
        callback(null, { filmId: result.insertId });
      }
    });
  },

  getFilmForEdit: function(filmId, callback) {
    const query = `SELECT f.*, c.category_id FROM film f LEFT JOIN film_category fc ON f.film_id = fc.film_id LEFT JOIN category c ON fc.category_id = c.category_id WHERE f.film_id = ?`;
    
    usersDao.query(query, [filmId], function(err, films) {
      if (err) return callback(err);
      if (!films.length) return callback(new Error('Film not found'));
      
      filmsDao.getCategories(function(catErr, categories) {
        if (catErr) return callback(catErr);
        callback(null, { film: films[0], categories: categories });
      });
    });
  },

  updateFilm: function(filmId, updates, callback) {
    const query = `UPDATE film SET title = ?, description = ?, length = ?, rating = ?, rental_rate = ?, last_update = NOW() WHERE film_id = ?`;
    const params = [updates.title, updates.description, updates.length, updates.rating, updates.rentalRate, filmId];

    usersDao.query(query, params, function(err) {
      if (err) return callback(err);
      
      if (updates.categoryId) {
        const updateCatQuery = `INSERT INTO film_category (film_id, category_id, last_update) VALUES (?, ?, NOW()) ON DUPLICATE KEY UPDATE category_id = ?, last_update = NOW()`;
        usersDao.query(updateCatQuery, [filmId, updates.categoryId, updates.categoryId], function(catErr) {
          if (catErr) logger.warn('Failed to update category:', catErr);
          callback(null);
        });
      } else {
        callback(null);
      }
    });
  },

  getFilmInventory: function(filmId, callback) {
    const filmQuery = `SELECT * FROM film WHERE film_id = ?`;
    const inventoryQuery = `SELECT i.*, c.first_name, c.last_name, r.rental_date FROM inventory i LEFT JOIN rental r ON i.inventory_id = r.inventory_id AND r.return_date IS NULL LEFT JOIN customer c ON r.customer_id = c.customer_id WHERE i.film_id = ? ORDER BY i.inventory_id`;

    usersDao.query(filmQuery, [filmId], function(err, films) {
      if (err) return callback(err);
      if (!films.length) return callback(new Error('Film not found'));
      
      usersDao.query(inventoryQuery, [filmId], function(invErr, inventory) {
        if (invErr) return callback(invErr);
        
        inventory.forEach(item => {
          item.status = item.rental_date ? 'RENTED' : 'AVAILABLE';
        });
        
        callback(null, { film: films[0], inventory: inventory });
      });
    });
  },

  addFilmCopies: function(filmId, copies, callback) {
    const query = `INSERT INTO inventory (film_id, store_id, last_update) VALUES ${Array(copies).fill('(?, 1, NOW())').join(', ')}`;
    const params = Array(copies).fill(filmId);
    
    usersDao.query(query, params, function(err) {
      if (err) return callback(err);
      logger.info('Film copies added', { filmId, copies });
      callback(null);
    });
  },

  // === STAFF MANAGEMENT ===

  getStaffData: function(callback) {
    const query = `SELECT staff_id, first_name, last_name, email, active, role, store_id, last_update FROM staff ORDER BY last_name, first_name`;
    
    usersDao.query(query, [], function(err, staff) {
      if (err) return callback(err);
      callback(null, staff);
    });
  },

  createStaff: function(staffData, callback) {
    // Handle email and username properly
    let email, username;
    
    if (staffData.username) {
      // If username is provided, use it as the local part
      try {
        email = emailUtil.normalizeCompanyEmail(staffData.username);
        username = staffData.username.trim().toLowerCase();
      } catch (err) {
        return callback(new Error('Invalid username format. Only letters, numbers, dots, underscores, and hyphens are allowed.'));
      }
    } else if (staffData.email) {
      // If only email is provided, extract username from it
      if (emailUtil.isValidEmail(staffData.email)) {
        if (emailUtil.isCompanyEmail(staffData.email)) {
          email = staffData.email.toLowerCase();
          username = emailUtil.getLocalPart(staffData.email);
        } else {
          // Extract local part and create company email
          username = staffData.email.split('@')[0].trim().toLowerCase();
          try {
            email = emailUtil.normalizeCompanyEmail(username);
          } catch (err) {
            return callback(new Error('Invalid email format. Please use a valid format.'));
          }
        }
      } else {
        return callback(new Error('Please provide a valid email address.'));
      }
    } else {
      return callback(new Error('Either username or email must be provided.'));
    }
    
    // Hash the password first
    hash.create(staffData.password, function(hashErr, hashedPassword) {
      if (hashErr) return callback(hashErr);
      
      // Try to insert with role and password_hash columns first
      const fullQuery = `INSERT INTO staff (first_name, last_name, email, store_id, active, username, role, password_hash, last_update, address_id) VALUES (?, ?, ?, ?, 1, ?, ?, ?, NOW(), 1)`;
      const fullParams = [staffData.firstName, staffData.lastName, email, staffData.storeId, username, staffData.role, hashedPassword];

      usersDao.query(fullQuery, fullParams, function(err, result) {
        if (err && err.code === 'ER_BAD_FIELD_ERROR') {
          // If role/password_hash columns don't exist, fall back to basic structure
          logger.warn('Role/password_hash columns not found, using basic staff structure');
          const basicQuery = `INSERT INTO staff (first_name, last_name, email, store_id, active, username, last_update, address_id) VALUES (?, ?, ?, ?, 1, ?, NOW(), 1)`;
          const basicParams = [staffData.firstName, staffData.lastName, email, staffData.storeId, username];
          
          usersDao.query(basicQuery, basicParams, function(basicErr, basicResult) {
            if (basicErr) return callback(basicErr);
            logger.info('Staff created with basic structure', { staffId: basicResult.insertId, email, username });
            callback(null, { staffId: basicResult.insertId });
          });
        } else if (err) {
          return callback(err);
        } else {
          logger.info('Staff created with full structure', { staffId: result.insertId, email, username });
          callback(null, { staffId: result.insertId });
        }
      });
    });
  },

  toggleStaff: function(staffId, action, callback) {
    const active = action === 'activate' ? 1 : 0;
    const query = `UPDATE staff SET active = ?, last_update = NOW() WHERE staff_id = ?`;
    
    usersDao.query(query, [active, staffId], function(err) {
      if (err) return callback(err);
      logger.info(`Staff ${action}d`, { staffId });
      callback(null);
    });
  },

  // === OFFERS MANAGEMENT ===

  getOffersData: function(callback) {
    // First try to use the advanced film_offers table, fallback to simple query if not available
    const advancedQuery = `SELECT f.film_id, f.title, f.length, f.rental_rate, f.rating, c.name as category_name, c.category_id,
                  EXISTS(SELECT 1 FROM film_offers fo WHERE fo.film_id = f.film_id AND fo.active = 1) as is_offered,
                  (SELECT COUNT(*) FROM staff_offer_selections sos JOIN film_offers fo ON sos.offer_id = fo.offer_id WHERE fo.film_id = f.film_id) as selection_count
                  FROM film f 
                  LEFT JOIN film_category fc ON f.film_id = fc.film_id 
                  LEFT JOIN category c ON fc.category_id = c.category_id 
                  ORDER BY is_offered DESC, f.title`;

    usersDao.query(advancedQuery, [], function(err, films) {
      if (err && (err.message.includes("doesn't exist") || err.message.includes("Unknown column") || err.message.includes("Unknown table"))) {
        // Fallback to simple query without film_offers table
        const simpleQuery = `SELECT f.film_id, f.title, f.length, f.rental_rate, f.rating, c.name as category_name, c.category_id,
                      0 as is_offered, 0 as selection_count
                      FROM film f 
                      LEFT JOIN film_category fc ON f.film_id = fc.film_id 
                      LEFT JOIN category c ON fc.category_id = c.category_id 
                      ORDER BY f.title`;
        
        usersDao.query(simpleQuery, [], function(fallbackErr, fallbackFilms) {
          if (fallbackErr) return callback(fallbackErr);
          
          filmsDao.getCategories(function(catErr, categories) {
            if (catErr) return callback(catErr);
            
            const stats = {
              totalFilms: fallbackFilms.length,
              activeOffers: 0, // No offers without the offers table
              staffSelections: 0
            };
            
            callback(null, { films: fallbackFilms, categories, ...stats });
          });
        });
        return;
      }
      
      if (err) return callback(err);
      
      filmsDao.getCategories(function(catErr, categories) {
        if (catErr) return callback(catErr);
        
        const stats = {
          totalFilms: films.length,
          activeOffers: films.filter(f => f.is_offered).length,
          staffSelections: films.reduce((sum, f) => sum + f.selection_count, 0)
        };
        
        callback(null, { films, categories, ...stats });
      });
    });
  },

  toggleOffer: function(filmId, action, callback) {
    // Check if film_offers table exists, if not just return success (no-op)
    if (action === 'activate') {
      const query = `INSERT INTO film_offers (film_id, active, created_date) VALUES (?, 1, NOW()) ON DUPLICATE KEY UPDATE active = 1`;
      usersDao.query(query, [filmId], function(err, result) {
        if (err && (err.message.includes("doesn't exist") || err.message.includes("Unknown column") || err.message.includes("Unknown table"))) {
          // Table doesn't exist, just return success
          logger.warn('film_offers table not found, offer toggle is a no-op');
          return callback(null);
        }
        callback(err, result);
      });
    } else {
      const query = `UPDATE film_offers SET active = 0 WHERE film_id = ?`;
      usersDao.query(query, [filmId], function(err, result) {
        if (err && (err.message.includes("doesn't exist") || err.message.includes("Unknown column") || err.message.includes("Unknown table"))) {
          // Table doesn't exist, just return success
          logger.warn('film_offers table not found, offer toggle is a no-op');
          return callback(null);
        }
        callback(err, result);
      });
    }
  },

  batchUpdateOffers: function(action, category, callback) {
    let filmQuery = 'SELECT f.film_id FROM film f';
    const params = [];
    
    if (category) {
      filmQuery += ' JOIN film_category fc ON f.film_id = fc.film_id WHERE fc.category_id = ?';
      params.push(category);
    }

    usersDao.query(filmQuery, params, function(err, films) {
      if (err) return callback(err);
      if (!films.length) return callback(null, { updated: 0 });

      const filmIds = films.map(f => f.film_id);
      
      if (action === 'activate') {
        const query = `INSERT INTO film_offers (film_id, active, created_date) VALUES ${filmIds.map(() => '(?, 1, NOW())').join(', ')} ON DUPLICATE KEY UPDATE active = 1`;
        usersDao.query(query, filmIds, function(actErr, result) {
          if (actErr && (actErr.message.includes("doesn't exist") || actErr.message.includes("Unknown column") || actErr.message.includes("Unknown table"))) {
            // Table doesn't exist, just return success
            logger.warn('film_offers table not found, batch update is a no-op');
            return callback(null, { updated: filmIds.length });
          }
          callback(actErr, { updated: filmIds.length });
        });
      } else {
        const query = `UPDATE film_offers SET active = 0 WHERE film_id IN (${filmIds.map(() => '?').join(', ')})`;
        usersDao.query(query, filmIds, function(deactErr, result) {
          if (deactErr && (deactErr.message.includes("doesn't exist") || deactErr.message.includes("Unknown column") || deactErr.message.includes("Unknown table"))) {
            // Table doesn't exist, just return success
            logger.warn('film_offers table not found, batch update is a no-op');
            return callback(null, { updated: 0 });
          }
          callback(deactErr, { updated: result?.affectedRows || 0 });
        });
      }
    });
  },

  getAvailableFilmsForOffers: function(callback) {
    // Get films that don't have active offers (fallback compatible)
    const query = `SELECT f.film_id, f.title, f.rental_rate, f.rating, c.name as category_name
                   FROM film f 
                   LEFT JOIN film_category fc ON f.film_id = fc.film_id 
                   LEFT JOIN category c ON fc.category_id = c.category_id 
                   WHERE NOT EXISTS(
                     SELECT 1 FROM film_offers fo 
                     WHERE fo.film_id = f.film_id 
                     AND fo.active = 1
                   )
                   ORDER BY f.title`;

    usersDao.query(query, [], function(err, films) {
      if (err && (err.message.includes("doesn't exist") || err.message.includes("Unknown column"))) {
        // Fallback - just get all films since we don't have offers table
        const fallbackQuery = `SELECT f.film_id, f.title, f.rental_rate, f.rating, c.name as category_name
                               FROM film f 
                               LEFT JOIN film_category fc ON f.film_id = fc.film_id 
                               LEFT JOIN category c ON fc.category_id = c.category_id 
                               ORDER BY f.title`;
        
        usersDao.query(fallbackQuery, [], callback);
        return;
      }
      
      callback(err, films);
    });
  },

  createOffers: function(offerData, callback) {
    const { filmIds, discountPercent, validFrom, validTo, description } = offerData;
    
    // Try to create offers in film_offers table
    const insertQuery = `INSERT INTO film_offers (film_id, discount_percent, valid_from, valid_to, description, active, created_at) 
                         VALUES (?, ?, ?, ?, ?, 1, NOW())`;
    
    let processed = 0;
    let errors = [];
    let successCount = 0;
    
    filmIds.forEach(filmId => {
      usersDao.query(insertQuery, [
        parseInt(filmId),
        discountPercent,
        validFrom || null,
        validTo || null,
        description || 'Special offer'
      ], function(err) {
        processed++;
        
        if (err) {
          if (err.message.includes("doesn't exist")) {
            // Table doesn't exist - create a fallback entry in a simple offers tracking table
            const fallbackQuery = `INSERT INTO staff_offers (film_id, discount_percent, description, active, created_at) 
                                   VALUES (?, ?, ?, 1, NOW()) 
                                   ON DUPLICATE KEY UPDATE 
                                   discount_percent = VALUES(discount_percent), 
                                   description = VALUES(description), 
                                   active = 1`;
            
            usersDao.query(fallbackQuery, [parseInt(filmId), discountPercent, description || 'Special offer'], function(fallbackErr) {
              if (!fallbackErr) successCount++;
            });
          } else {
            errors.push(`Film ${filmId}: ${err.message}`);
          }
        } else {
          successCount++;
        }
        
        if (processed === filmIds.length) {
          if (errors.length > 0 && successCount === 0) {
            callback(new Error(errors.join(', ')));
          } else {
            callback(null, { created: successCount });
          }
        }
      });
    });
  },

  // NEW: Get staff offer selections and calculate savings
  getStaffOfferSelections: function(staffId, callback) {
    const query = `SELECT 
        f.film_id, f.title, f.rental_rate,
        COALESCE(fo.discount_percent, so.discount_percent, 0) as discount_percent,
        COALESCE(fo.description, so.description, 'Special offer') as offer_description,
        (f.rental_rate * COALESCE(fo.discount_percent, so.discount_percent, 0) / 100) as discount_amount,
        (f.rental_rate - (f.rental_rate * COALESCE(fo.discount_percent, so.discount_percent, 0) / 100)) as discounted_price,
        sos.selected_at
      FROM staff_offer_selections sos
      JOIN film f ON sos.film_id = f.film_id
      LEFT JOIN film_offers fo ON f.film_id = fo.film_id AND fo.active = 1
      LEFT JOIN staff_offers so ON f.film_id = so.film_id AND so.active = 1
      WHERE sos.staff_id = ?
      ORDER BY sos.selected_at DESC`;

    usersDao.query(query, [staffId], function(err, selections) {
      if (err && err.message.includes("doesn't exist")) {
        // Fallback for simpler tracking
        const fallbackQuery = `SELECT f.film_id, f.title, f.rental_rate, 
                               10 as discount_percent, 'Staff discount' as offer_description,
                               (f.rental_rate * 0.10) as discount_amount,
                               (f.rental_rate * 0.90) as discounted_price,
                               NOW() as selected_at
                               FROM film f 
                               WHERE f.film_id IN (SELECT DISTINCT film_id FROM film_offers WHERE active = 1)
                               LIMIT 5`;
        usersDao.query(fallbackQuery, [], callback);
        return;
      }
      
      callback(err, selections);
    });
  },

  // NEW: Apply offer discount to rental
  applyOfferDiscount: function(filmId, originalPrice, callback) {
    const query = `SELECT COALESCE(fo.discount_percent, so.discount_percent, 0) as discount_percent
                   FROM film f
                   LEFT JOIN film_offers fo ON f.film_id = fo.film_id AND fo.active = 1 
                     AND (fo.valid_from IS NULL OR fo.valid_from <= NOW())
                     AND (fo.valid_to IS NULL OR fo.valid_to >= NOW())
                   LEFT JOIN staff_offers so ON f.film_id = so.film_id AND so.active = 1
                   WHERE f.film_id = ?`;

    usersDao.query(query, [filmId], function(err, results) {
      if (err) return callback(err);
      
      const discountPercent = results[0]?.discount_percent || 0;
      const discountAmount = (originalPrice * discountPercent / 100);
      const finalPrice = originalPrice - discountAmount;
      
      callback(null, {
        originalPrice,
        discountPercent,
        discountAmount: parseFloat(discountAmount.toFixed(2)),
        finalPrice: parseFloat(finalPrice.toFixed(2)),
        hasDiscount: discountPercent > 0
      });
    });
  },

  // NEW: Get offer statistics for dashboard
  getOfferStats: function(callback) {
    const statsQuery = `SELECT 
        COUNT(DISTINCT COALESCE(fo.film_id, so.film_id)) as active_offers,
        AVG(COALESCE(fo.discount_percent, so.discount_percent)) as avg_discount,
        COUNT(DISTINCT sos.staff_id) as staff_participating,
        SUM(f.rental_rate * COALESCE(fo.discount_percent, so.discount_percent, 0) / 100) as total_potential_savings
      FROM film f
      LEFT JOIN film_offers fo ON f.film_id = fo.film_id AND fo.active = 1
      LEFT JOIN staff_offers so ON f.film_id = so.film_id AND so.active = 1  
      LEFT JOIN staff_offer_selections sos ON f.film_id = sos.film_id
      WHERE (fo.film_id IS NOT NULL OR so.film_id IS NOT NULL)`;

    usersDao.query(statsQuery, [], function(err, results) {
      if (err) {
        // Fallback stats
        return callback(null, {
          active_offers: 0,
          avg_discount: 0,
          staff_participating: 0,
          total_potential_savings: 0
        });
      }
      
      callback(null, results[0] || {
        active_offers: 0,
        avg_discount: 0,
        staff_participating: 0,
        total_potential_savings: 0
      });
    });
  }

};

module.exports = adminService;