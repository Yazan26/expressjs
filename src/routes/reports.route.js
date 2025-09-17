const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reports.controller');
const requireAuth = require('../middleware/requireAuth');
const requireRole = require('../middleware/requireRole');

/**
 * Reports Routes - Analytics and performance reports
 */

// Middleware: Require authentication and manager/admin role
router.use(requireAuth);
router.use(requireRole(['manager', 'admin']));

// GET /reports - Reports dashboard
router.get('/', reportsController.getReports);

// GET /reports/staff-performance - Staff performance report
router.get('/staff-performance', reportsController.getStaffPerformance);

module.exports = router;