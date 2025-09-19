const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const requireAuth = require('../middleware/requireAuth');
const requireRole = require('../middleware/requireRole');

// Debug middleware to log all admin route attempts
router.use((req, res, next) => {
  console.log(`Admin route accessed: ${req.method} ${req.path}`);
  console.log(`User:`, req.session?.user?.id, req.session?.user?.role);
  next();
});

// Middleware: Require authentication and admin role
router.use(requireAuth);
router.use(requireRole('admin'));

// Film management routes
router.get('/films', adminController.getFilms);
router.get('/films/new', adminController.getNewFilm);
router.post('/films/new', adminController.postCreateFilm);
router.get('/films/edit/:id', adminController.getEditFilm);
router.post('/films/edit/:id', adminController.postEditFilm);
router.get('/films/inventory/:id', adminController.getFilmInventory);
router.post('/films/inventory/:id/add', adminController.postAddFilmCopy);

// Staff management routes
router.get('/staff', adminController.getStaff);
router.get('/staff/new', adminController.getNewStaff);
router.post('/staff', adminController.postCreateStaff);
router.post('/staff/:id/activate', adminController.postToggleStaff);
router.post('/staff/:id/deactivate', adminController.postToggleStaff);

// Offers management routes
router.get('/offers', adminController.getOffers);
router.get('/offers/new', adminController.getNewOffer);
router.post('/offers/new', adminController.postCreateOffer);
router.post('/offers/activate/:filmId', adminController.postToggleOffer);
router.post('/offers/deactivate/:filmId', adminController.postToggleOffer);
router.post('/offers/batch', adminController.postBatchOffers);

module.exports = router;