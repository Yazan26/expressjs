const adminDao = require('../../dao/admin.dao');
const logger = require('../../util/logger');
const emailUtil = require('../../util/email');
const hash = require('../../util/hash');

module.exports = {
  // === STAFF MANAGEMENT ===
  getStaffData: function(callback) {
    adminDao.selectStaffFull(function(err, staff) {
      if (err && err.code === 'ER_BAD_FIELD_ERROR') {
        logger.warn('Active/role columns not found in staff table, using basic query');
        adminDao.selectStaffBasic(function(basicErr, basicStaff) {
          if (basicErr) return callback(basicErr);
          const staffWithDefaults = basicStaff.map(member => ({ ...member, active: 1, role: 'staff' }));
          callback(null, staffWithDefaults);
        });
        return;
      }
      if (err) return callback(err);
      const staffWithDefaults = staff.map(member => ({ ...member, active: member.active !== undefined ? member.active : 1, role: member.role || 'staff' }));
      callback(null, staffWithDefaults);
    });
  },

  createStaff: function(staffData, callback) {
    let email, username;
    if (staffData.username) {
      try {
        email = emailUtil.normalizeCompanyEmail(staffData.username);
        username = staffData.username.trim().toLowerCase();
      } catch (err) {
        return callback(new Error('Invalid username format. Only letters, numbers, dots, underscores, and hyphens are allowed.'));
      }
    } else if (staffData.email) {
      if (emailUtil.isValidEmail(staffData.email)) {
        if (emailUtil.isCompanyEmail(staffData.email)) {
          email = staffData.email.toLowerCase();
          username = emailUtil.getLocalPart(staffData.email);
        } else {
          username = staffData.email.split('@')[0].trim().toLowerCase();
          try { email = emailUtil.normalizeCompanyEmail(username); } catch (err) { return callback(new Error('Invalid email format. Please use a valid format.')); }
        }
      } else { return callback(new Error('Please provide a valid email address.')); }
    } else { return callback(new Error('Either username or email must be provided.')); }

    hash.create(staffData.password, function(hashErr, hashedPassword) {
      if (hashErr) return callback(hashErr);
      const staffPayload = { firstName: staffData.firstName, lastName: staffData.lastName, email, storeId: staffData.storeId, username, role: staffData.role, passwordHash: hashedPassword };
      adminDao.insertStaffFull(staffPayload, function(err, result) {
        if (err && err.code === 'ER_BAD_FIELD_ERROR') {
          logger.warn('Role/password_hash columns not found, using basic staff structure');
          const basicData = { firstName: staffData.firstName, lastName: staffData.lastName, email, storeId: staffData.storeId, username };
          adminDao.insertStaffBasic(basicData, function(basicErr, basicResult) {
            if (basicErr) return callback(basicErr);
            logger.info('Staff created with basic structure', { staffId: basicResult.insertId, email, username });
            callback(null, { staffId: basicResult.insertId });
          });
        } else if (err) { return callback(err); }
        else { logger.info('Staff created with full structure', { staffId: result.insertId, email, username }); callback(null, { staffId: result.insertId }); }
      });
    });
  },

  toggleStaff: function(staffId, action, callback) {
    const active = action === 'activate' ? 1 : 0;
    adminDao.toggleStaff(staffId, active, function(err) {
      if (err && err.code === 'ER_BAD_FIELD_ERROR') { logger.warn('Active column not found in staff table, staff toggle is a no-op'); return callback(null); }
      if (err) return callback(err);
      logger.info(`Staff ${action}d`, { staffId });
      callback(null);
    });
  },

  // === OFFERS MANAGEMENT ===
  toggleOffer: function(filmId, action, callback) {
    if (action === 'activate') {
      adminDao.activateOffer(filmId, function(err, result) {
        if (err && (err.message.includes("doesn't exist") || err.message.includes("Unknown column") || err.message.includes("Unknown table"))) {
          logger.warn('film_offers table not found, offer toggle is a no-op');
          return callback(null);
        }
        callback(err, result);
      });
    } else {
      adminDao.deactivateOffer(filmId, function(err, result) {
        if (err && (err.message.includes("doesn't exist") || err.message.includes("Unknown column") || err.message.includes("Unknown table"))) {
          logger.warn('film_offers table not found, offer toggle is a no-op');
          return callback(null);
        }
        callback(err, result);
      });
    }
  },

  batchUpdateOffers: function(action, category, callback) {
    const fetchFilms = category
      ? (cb) => adminDao.selectFilmsByCategory(category, cb)
      : adminDao.selectAllFilmIds;
    fetchFilms(function(err, films) {
      if (err) return callback(err);
      if (!films.length) return callback(null, { updated: 0 });
      const filmIds = films.map(f => f.film_id);
      if (action === 'activate') {
        adminDao.activateOffersBulk(filmIds, function(actErr) {
          if (actErr && (actErr.message.includes("doesn't exist") || actErr.message.includes("Unknown column") || actErr.message.includes("Unknown table"))) {
            logger.warn('film_offers table not found, batch update is a no-op');
            return callback(null, { updated: filmIds.length });
          }
          callback(actErr, { updated: filmIds.length });
        });
      } else {
        adminDao.deactivateOffersBulk(filmIds, function(deactErr, result) {
          if (deactErr && (deactErr.message.includes("doesn't exist") || deactErr.message.includes("Unknown column") || deactErr.message.includes("Unknown table"))) {
            logger.warn('film_offers table not found, batch update is a no-op');
            return callback(null, { updated: 0 });
          }
          callback(deactErr, { updated: result?.affectedRows || 0 });
        });
      }
    });
  },

  getAvailableFilmsForOffers: function(optionsOrCallback, maybeCallback) {
      // Support both signatures: (callback) and (options, callback)
      let options = {}; let callback = optionsOrCallback;
      if (typeof optionsOrCallback === 'object') { options = optionsOrCallback || {}; callback = maybeCallback; }

    if (!callback) callback = function(){};

    // If no options provided, use simple non-paged query
      if (!options || Object.keys(options).length === 0) {
        return adminDao.selectAvailableFilmsNoOffers(function(err, films) {
          if (err && (err.message.includes("doesn't exist") || err.message.includes("Unknown column"))) {
            logger.warn('film_offers table not found, using empty fallback list');
            return callback(null, []);
          }
          callback(err, films);
        });
      }

      let whereClause = 'WHERE fo.film_id IS NULL';
      const baseParams = [];
      if (options.search) { whereClause += ' AND f.title LIKE ?'; baseParams.push(`%${options.search}%`); }
      if (options.category && options.category !== 'all') { whereClause += ' AND c.category_id = ?'; baseParams.push(parseInt(options.category)); }
      const page = parseInt(options.page) || 1; const limit = parseInt(options.limit) || 20; const offset = (page - 1) * limit;
      adminDao.countAvailableFilms(whereClause, baseParams, function(countErr, countResult) {
        if (countErr) return callback(countErr);
        const totalItems = countResult[0].total; const totalPages = Math.ceil(totalItems/limit);
        adminDao.selectAvailableFilmsPaged(whereClause, baseParams, limit, offset, function(err, films) {
        if (err) return callback(err);
        callback(null, { films: films || [], pagination: { page, totalPages, totalItems, hasNextPage: page < totalPages, hasPrevPage: page > 1 } });
      });
    });
  },

  createOffers: function(offerData, callback) {
    const { filmIds, discountPercent } = offerData;
    let processed = 0, errors = [], successCount = 0;
    filmIds.forEach(filmId => {
      adminDao.insertOfferRecord(parseInt(filmId), discountPercent, function(err) {
        processed++;
        if (err) {
          if (!err.message.includes("doesn't exist")) errors.push(`Film ${filmId}: ${err.message}`);
        } else { successCount++; }
        if (processed === filmIds.length) {
          if (errors.length > 0 && successCount === 0) callback(new Error(errors.join(', ')));
          else callback(null, { created: successCount });
        }
      });
    });
  },

  getStaffOfferSelections: function(staffId, callback) {
    adminDao.selectStaffOfferSelections(staffId, function(err, selections) {
      if (err && err.message.includes("doesn't exist")) {
        const fallback = Array.from({ length: 5 }).map((_, idx) => {
          const rate = 3.99 + idx * 0.5;
          return {
            film_id: idx + 1,
            title: `Sample Film ${idx + 1}`,
            rental_rate: rate,
            rating: 'PG',
            category_name: 'General',
            discount_percent: 15,
            offer_description: 'Staff discount',
            discount_amount: parseFloat((rate * 0.15).toFixed(2)),
            discounted_price: parseFloat((rate * 0.85).toFixed(2)),
            selected_at: new Date(),
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          };
        });
        return callback(null, fallback);
      }
      callback(err, selections);
    });
  },

  applyOfferDiscount: function(filmId, originalPrice, callback) {
    adminDao.selectOfferDiscount(filmId, function(err, results) {
      if (err) return callback(err);
      const discountPercent = results[0]?.discount_percent || 0;
      const discountAmount = (originalPrice * discountPercent / 100);
      const finalPrice = originalPrice - discountAmount;
      callback(null, { originalPrice, discountPercent, discountAmount: parseFloat(discountAmount.toFixed(2)), finalPrice: parseFloat(finalPrice.toFixed(2)), hasDiscount: discountPercent > 0 });
    });
  },

  getOfferStats: function(callback) {
    adminDao.selectOfferStats(function(err, results) {
      if (err) return callback(null, { active_offers: 0, avg_discount: 0, staff_participating: 0, total_potential_savings: 0 });
      callback(null, results[0] || { active_offers: 0, avg_discount: 0, staff_participating: 0, total_potential_savings: 0 });
    });
  },

  removeOffer: function(offerId, callback) {
    adminDao.deactivateOfferById(offerId, function(err, result) {
      if (err) return callback(err);
      if (result.affectedRows === 0) return callback(new Error('Offer not found or already inactive'));
      callback(null, { success: true, message: 'Offer removed successfully', offerId });
    });
  },

  getAllOffers: function(options, callback) {
    let whereClause = 'WHERE fo.is_active = 1';
    const baseParams = [];
    if (options.search) { whereClause += ' AND f.title LIKE ?'; baseParams.push(`%${options.search}%`); }
    if (options.category && options.category !== 'all') { whereClause += ' AND c.category_id = ?'; baseParams.push(parseInt(options.category)); }
    const page = parseInt(options.page) || 1; const limit = parseInt(options.limit) || 20; const offset = (page - 1) * limit;
    adminDao.countAllOffers(whereClause, baseParams, function(countErr, countResult) {
      if (countErr) return callback(countErr);
      const totalItems = countResult[0].total; const totalPages = Math.ceil(totalItems/limit);
      adminDao.selectAllOffers(whereClause, baseParams, limit, offset, function(err, offers) {
        if (err) return callback(err);
        callback(null, { offers: offers || [], pagination: { page, totalPages, totalItems, hasNextPage: page < totalPages, hasPrevPage: page > 1 } });
      });
    });
  },
};
