const reportsService = require('../services/reports.service');

/**
 * Reports Controller - Simple reports endpoints
 */
const reportsController = {

  /**
   * GET /reports - Reports dashboard
   */
  getReports: function(req, res, next) {
    reportsService.getReportsData(function(err, data) {
      if (err) {
        console.error('Error fetching reports data:', err);
        return next(err);
      }

      res.render('reports/index', {
        title: 'Reports & Analytics',
        summary: data.summary,
        staff: data.staffPerformance
      });
    });
  },

  /**
   * GET /reports/staff-performance - Staff performance report
   */
  getStaffPerformance: function(req, res, next) {
    const filters = {
      period: req.query.period || 'this_month',
      role: req.query.role || 'all',
      sort: req.query.sort || 'selections_desc'
    };

    reportsService.getStaffPerformance(filters, function(err, data) {
      if (err) {
        console.error('Error fetching staff performance:', err);
        return next(err);
      }

      res.render('reports/staff-performance', {
        title: 'Staff Performance Report',
        staff: data.staff,
        filters: data.filters
      });
    });
  }

};

module.exports = reportsController;