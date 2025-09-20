const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reports.controller');
const requireAuth = require('../middleware/requireAuth');
const requireRole = require('../middleware/requireRole');

/**
 * Reports Routes - Comprehensive analytics and performance reports
 */

// Middleware: Require authentication and manager/admin role
router.use(requireAuth);
router.use(requireRole(['manager', 'admin']));

// GET /reports - Reports dashboard
router.get('/', reportsController.getReports);

// GET /reports/staff-performance - Staff performance report
router.get('/staff-performance', reportsController.getStaffPerformance);

// GET /reports/film-analytics - Film analytics report
router.get('/film-analytics', reportsController.getFilmAnalytics);

// GET /reports/revenue - Revenue reports
router.get('/revenue', reportsController.getRevenue);

// GET /reports/customer-insights - Customer insights report
router.get('/customer-insights', reportsController.getCustomerInsights);

// GET /reports/inventory - Inventory reports
router.get('/inventory', reportsController.getInventory);

// GET /reports/offers - Offers performance report
router.get('/offers', reportsController.getOffers);

module.exports = router;