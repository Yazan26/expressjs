const filmsDao = require('../../dao/films.dao');
const adminDao = require('../../dao/admin.dao');
const logger = require('../../util/logger');

module.exports = {
  getFilmsData: function(options, callback) {
    filmsDao.getAllFilms(options, function(err, result) {
      if (err) return callback(err);
      const films = result?.films || [];
      const transformedFilms = films.map(film => ({
        ...film,
        filmId: film.film_id,
        categoryName: film.category,
        releaseYear: film.release_year,
        rentalRate: film.rental_rate,
        totalCopies: film.total_copies || 0,
        availableCopies: film.available_copies || 0,
        languageName: film.language_name || 'English',
        specialFeatures: film.special_features
      }));
      filmsDao.getCategories(function(catErr, categories) {
        if (catErr) return callback(catErr);
        const transformedCategories = (categories || []).map(cat => ({ ...cat, categoryId: cat.category_id }));
        callback(null, {
          films: transformedFilms,
          categories: transformedCategories,
          pagination: result?.pagination || {},
          filmStats: {
            totalFilms: transformedFilms.length,
            totalCopies: transformedFilms.reduce((s,f)=> s+(f.totalCopies||0), 0),
            availableCopies: transformedFilms.reduce((s,f)=> s+(f.availableCopies||0), 0),
            totalCategories: transformedCategories.length
          }
        });
      });
    });
  },

  createFilm: function(filmData, callback) {
    adminDao.insertFilm(filmData, function(err, result) {
      if (err) return callback(err);
      if (filmData.categoryId) {
        adminDao.assignFilmCategory(result.insertId, filmData.categoryId, function(catErr) {
          if (catErr) logger.warn('Failed to assign category:', catErr);
          callback(null, { filmId: result.insertId });
        });
      } else {
        callback(null, { filmId: result.insertId });
      }
    });
  },

  getFilmForEdit: function(filmId, callback) {
    adminDao.selectFilmById(filmId, function(err, films) {
      if (err) return callback(err);
      if (!films.length) return callback(new Error('Film not found'));
      filmsDao.getCategories(function(catErr, categories) {
        if (catErr) return callback(catErr);
        callback(null, { film: films[0], categories: categories });
      });
    });
  },

  updateFilm: function(filmId, updates, callback) {
    adminDao.updateFilm(filmId, updates, function(err) {
      if (err) return callback(err);
      if (updates.categoryId) {
        adminDao.upsertFilmCategory(filmId, updates.categoryId, function(catErr) {
          if (catErr) logger.warn('Failed to update category:', catErr);
          callback(null);
        });
      } else {
        callback(null);
      }
    });
  },

  getFilmInventory: function(filmId, callback) {
    const filmQueryCb = (cb) => adminDao.selectFilmById(filmId, cb);
    filmQueryCb(function(err, films) {
      if (err) return callback(err);
      if (!films || films.length === 0) return callback(new Error('Film not found'));
      adminDao.selectFilmInventory(filmId, function(invErr, inventory) {
        if (invErr) return callback(invErr);
        const inventoryList = (inventory || []).map(item => {
          const activeRentals = Number(item.active_rentals || 0);
          const totalRentals = Number(item.total_rentals || 0);
          return {
            ...item,
            active_rentals: activeRentals,
            total_rentals: totalRentals,
            status: activeRentals > 0 ? 'RENTED' : 'AVAILABLE',
            renter_name: item.first_name && item.last_name ? `${item.first_name} ${item.last_name}` : null,
            isRemovable: activeRentals === 0 && totalRentals === 0
          };
        });
        callback(null, { film: films[0], inventory: inventoryList });
      });
    });
  },

  addFilmCopies: function(filmId, copies, callback) {
    adminDao.insertInventoryCopies(filmId, copies, function(err) {
      if (err) return callback(err);
      logger.info('Film copies added', { filmId, copies });
      callback(null);
    });
  },

  removeFilmCopy: function(filmId, inventoryId, callback) {
    if (!Number.isInteger(filmId) || !Number.isInteger(inventoryId)) {
      return callback(new Error('Invalid inventory copy'));
    }

    adminDao.selectInventoryById(inventoryId, function(err, rows) {
      if (err) return callback(err);
      if (!rows || rows.length === 0) {
        return callback(new Error('Inventory copy not found'));
      }

      const record = rows[0];
      if (Number(record.film_id) !== filmId) {
        return callback(new Error('Inventory copy does not belong to this film'));
      }

      adminDao.selectInventoryRentalUsage(inventoryId, function(usageErr, usageRows) {
        if (usageErr) return callback(usageErr);
        const usage = usageRows && usageRows[0] ? usageRows[0] : { active_rentals: 0, total_rentals: 0 };
        const activeRentals = Number(usage.active_rentals || 0);
        const totalRentals = Number(usage.total_rentals || 0);

        if (activeRentals > 0) {
          return callback(new Error('Copy is currently rented and cannot be removed'));
        }

        if (totalRentals > 0) {
          return callback(new Error('Copy has rental history and cannot be removed'));
        }

        adminDao.deleteInventoryCopy(inventoryId, function(deleteErr, result) {
          if (deleteErr) return callback(deleteErr);
          if (!result || result.affectedRows === 0) {
            return callback(new Error('Unable to remove inventory copy'));
          }
          logger.info('Film copy removed', { filmId, inventoryId });
          callback(null);
        });
      });
    });
  },

};
