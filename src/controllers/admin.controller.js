const filmsService = require('../services/films.service');
const adminService = require('../services/admin.service');
const logger = require('../util/logger');

/**
 * Admin Controller - Streamlined administrative operations
 */
const adminController = {

  // === FILM MANAGEMENT ===
  
  getFilms: function(req, res, next) {
    const options = { 
      search: req.query.search,
      category: req.query.category,
      rating: req.query.rating,
      sort: req.query.sort,
      page: parseInt(req.query.page) || 1,
      limit: 20
    };

    adminService.getFilmsData(options, function(err, data) {
      if (err) return next(err);
      
      const success = req.flash('success');
      const error = req.flash('error');
      
      res.render('admin/films', { 
        title: 'Film Management - Admin',
        ...data,
        // Pass search parameters to view
        searchTerm: options.search,
        selectedCategory: options.category,
        selectedRating: options.rating,
        selectedSort: options.sort,
        // Flash messages
        success: success.length > 0 ? success[0] : null,
        error: error.length > 0 ? error[0] : null
      });
    });
  },

  getNewFilm: function(req, res, next) {
    filmsService.getCategories(function(err, categories) {
      if (err) return next(err);
      
      filmsService.getLanguages(function(langErr, languages) {
        if (langErr) return next(langErr);
        
        const success = req.flash('success');
        const error = req.flash('error');
        
        res.render('admin/films-new', { 
          title: 'Add New Film - Admin', 
          categories: categories,
          languages: languages,
          success: success.length > 0 ? success[0] : null,
          error: error.length > 0 ? error[0] : null
        });
      });
    });
  },

  postCreateFilm: function(req, res, next) {
    const filmData = {
      title: req.body.title?.trim(),
      description: req.body.description?.trim(),
      releaseYear: parseInt(req.body.release_year) || new Date().getFullYear(),
      length: parseInt(req.body.length) || null,
      rating: req.body.rating,
      rentalRate: parseFloat(req.body.rental_rate) || 2.99,
      languageId: parseInt(req.body.languageId) || 1,
      categoryId: parseInt(req.body.category_id) || null
    };

    if (!filmData.title || !filmData.rating) {
      req.flash('error', 'Title and rating are required');
      return res.redirect('/admin/films/new');
    }

    logger.info('Admin creating film', { adminId: req.session.user?.id, title: filmData.title });

    adminService.createFilm(filmData, function(err) {
      if (err) {
        req.flash('error', err.message);
        return res.redirect('/admin/films/new');
      }
      req.flash('success', 'Film created successfully');
      res.redirect('/admin/films');
    });
  },

  getEditFilm: function(req, res, next) {
    console.log('getEditFilm called with ID:', req.params.id);
    const filmId = parseInt(req.params.id);
    adminService.getFilmForEdit(filmId, function(err, data) {
      if (err) {
        console.log('Error in getEditFilm:', err.message);
        return next(err);
      }
      
      const success = req.flash('success');
      const error = req.flash('error');
      
      console.log('Rendering films-edit template');
      res.render('admin/films-edit', { 
        title: 'Edit Film - Admin', 
        film: data.film, 
        categories: data.categories, 
        success: success.length > 0 ? success[0] : null,
        error: error.length > 0 ? error[0] : null
      });
    });
  },

  postEditFilm: function(req, res, next) {
    const filmId = parseInt(req.params.id);
    const updates = {
      title: req.body.title?.trim(),
      description: req.body.description?.trim(),
      length: parseInt(req.body.length) || null,
      rating: req.body.rating,
      rentalRate: parseFloat(req.body.rental_rate),
      categoryId: parseInt(req.body.category_id) || null
    };

    adminService.updateFilm(filmId, updates, function(err) {
      if (err) {
        req.flash('error', err.message);
        return res.redirect(`/admin/films/edit/${filmId}`);
      }
      req.flash('success', 'Film updated successfully');
      res.redirect('/admin/films');
    });
  },

  getFilmInventory: function(req, res, next) {
    console.log('getFilmInventory called with ID:', req.params.id);
    const filmId = parseInt(req.params.id);
    adminService.getFilmInventory(filmId, function(err, data) {
      if (err) {
        console.log('Error in getFilmInventory:', err.message);
        return next(err);
      }
      
      const success = req.flash('success');
      const error = req.flash('error');
      
      console.log('Rendering films-inventory template');
      res.render('admin/films-inventory', { 
        title: 'Manage Inventory - Admin', 
        film: data.film, 
        inventory: data.inventory, 
        success: success.length > 0 ? success[0] : null,
        error: error.length > 0 ? error[0] : null
      });
    });
  },

  postAddFilmCopy: function(req, res, next) {
    const filmId = parseInt(req.params.id);
    const copies = Math.min(parseInt(req.body.copies) || 1, 20);

    adminService.addFilmCopies(filmId, copies, function(err) {
      if (err) {
        req.flash('error', err.message);
        return res.redirect(`/admin/films/inventory/${filmId}`);
      }
      req.flash('success', `${copies} cop${copies > 1 ? 'ies' : 'y'} added successfully`);
      res.redirect(`/admin/films/inventory/${filmId}`);
    });
  },

  postRemoveFilmCopy: function(req, res, next) {
    const filmId = parseInt(req.params.id);
    const inventoryId = parseInt(req.params.inventoryId);

    if (Number.isNaN(filmId) || Number.isNaN(inventoryId)) {
      req.flash('error', 'Invalid inventory copy');
      return res.redirect('/admin/films');
    }

    adminService.removeFilmCopy(filmId, inventoryId, function(err) {
      if (err) {
        req.flash('error', err.message);
        return res.redirect(`/admin/films/inventory/${filmId}`);
      }
      req.flash('success', 'Inventory copy removed successfully');
      res.redirect(`/admin/films/inventory/${filmId}`);
    });
  },

  // === STAFF MANAGEMENT ===

  getStaff: function(req, res, next) {
    adminService.getStaffData(function(err, staff) {
      if (err) return next(err);
      res.render('admin/staff', { title: 'Staff Management - Admin', staff: staff, success: req.flash('success'), error: req.flash('error') });
    });
  },

  getNewStaff: function(req, res, next) {
    res.render('admin/staff-new', { title: 'Add New Staff - Admin', success: req.flash('success'), error: req.flash('error') });
  },

  postCreateStaff: function(req, res, next) {
    const staffData = {
      firstName: req.body.first_name?.trim(),
      lastName: req.body.last_name?.trim(),
      email: req.body.email?.trim(),
      username: req.body.username?.trim(),
      password: req.body.password,
      role: req.body.role || 'staff',
      storeId: parseInt(req.body.store_id) || 1
    };

    if (!staffData.firstName || !staffData.lastName || !staffData.password) {
      req.flash('error', 'First name, last name, and password are required');
      return res.redirect('/admin/staff/new');
    }

    if (!staffData.username && !staffData.email) {
      req.flash('error', 'Either username or email must be provided');
      return res.redirect('/admin/staff/new');
    }

    if (staffData.password.length < 6) {
      req.flash('error', 'Password must be at least 6 characters long');
      return res.redirect('/admin/staff/new');
    }

    adminService.createStaff(staffData, function(err) {
      if (err) {
        req.flash('error', err.message);
        return res.redirect('/admin/staff/new');
      }
      req.flash('success', 'Staff account created successfully');
      res.redirect('/admin/staff');
    });
  },

  postToggleStaff: function(req, res, next) {
    const staffId = parseInt(req.params.id);
    const action = req.path.includes('deactivate') ? 'deactivate' : 'activate';

    adminService.toggleStaff(staffId, action, function(err) {
      if (err) {
        req.flash('error', err.message);
        return res.redirect('/admin/staff');
      }
      req.flash('success', `Staff ${action}d successfully`);
      res.redirect('/admin/staff');
    });
  },

  // === OFFERS MANAGEMENT ===

  getOffers: function(req, res, next) {
    const options = {
      search: req.query.search,
      category: req.query.category,
      page: parseInt(req.query.page) || 1,
      limit: 20
    };
    
    adminService.getAllOffers(options, function(err, data) {
      if (err) return next(err);
      
      // Get categories for filter dropdown
      const filmsService = require('../services/films.service');
      filmsService.getCategories(function(catErr, categories) {
        res.render('admin/offers', { 
          title: 'Film Offers Management - Admin', 
          offers: data.offers || [],
          categories: categories || [],
          pagination: data.pagination || { page: 1, totalPages: 1, totalItems: 0, hasNextPage: false, hasPrevPage: false },
          searchParams: {
            search: req.query.search || '',
            category: req.query.category || 'all'
          },
          success: req.flash('success'), 
          error: req.flash('error') 
        });
      });
    });
  },

  postToggleOffer: function(req, res, next) {
    const filmId = parseInt(req.params.filmId);
    const action = req.path.includes('activate') ? 'activate' : 'deactivate';

    adminService.toggleOffer(filmId, action, function(err) {
      if (err) {
        req.flash('error', err.message);
        return res.redirect('/admin/offers');
      }
      req.flash('success', `Film offer ${action}d successfully`);
      res.redirect('/admin/offers');
    });
  },

  postBatchOffers: function(req, res, next) {
    const { action, category } = req.body;

    adminService.batchUpdateOffers(action, category, function(err, result) {
      if (err) {
        req.flash('error', err.message);
        return res.redirect('/admin/offers');
      }
      req.flash('success', `${result.updated} offers ${action}d successfully`);
      res.redirect('/admin/offers');
    });
  },

  getNewOffer: function(req, res, next) {
    const options = {
      search: req.query.search,
      category: req.query.category,
      page: parseInt(req.query.page) || 1,
      limit: 20
    };
    
    // Get films that don't already have active offers
    adminService.getAvailableFilmsForOffers(options, function(err, data) {
      if (err) return next(err);
      
      // Get categories for filter dropdown
      const filmsService = require('../services/films.service');
      filmsService.getCategories(function(catErr, categories) {
        const success = req.flash('success');
        const error = req.flash('error');
        
        res.render('admin/offers-new', {
          title: 'Create New Offer - Admin',
          films: data.films || [],
          categories: categories || [],
          pagination: data.pagination,
          searchParams: {
            search: req.query.search || '',
            category: req.query.category || 'all'
          },
          success: success.length > 0 ? success[0] : null,
          error: error.length > 0 ? error[0] : null
        });
      });
    });
  },

  postCreateOffer: function(req, res, next) {
    const { filmIds, discountPercent, validFrom, validTo, description } = req.body;
    
    adminService.createOffers({
      filmIds: Array.isArray(filmIds) ? filmIds : [filmIds],
      discountPercent: parseFloat(discountPercent) || 0,
      validFrom,
      validTo,
      description
    }, function(err) {
      if (err) {
        req.flash('error', err.message);
        return res.redirect('/admin/offers/new');
      }
      req.flash('success', 'Offers created successfully');
      res.redirect('/admin/offers');
    });
  },

  postRemoveOffer: function(req, res, next) {
    const offerId = parseInt(req.params.offerId);
    
    if (!offerId) {
      req.flash('error', 'Invalid offer ID');
      return res.redirect('/admin/offers');
    }
    
    adminService.removeOffer(offerId, function(err, result) {
      if (err) {
        req.flash('error', 'Failed to remove offer: ' + err.message);
        return res.redirect('/admin/offers');
      }
      
      req.flash('success', 'Offer removed successfully');
      res.redirect('/admin/offers');
    });
  }

};

module.exports = adminController;