const reportsService = require('../services/reports.service');

/**
 * Reports Controller - Comprehensive reports endpoints
 */
const reportsController = {

  /**
   * GET /reports - Reports dashboard with real data
   */
  getReports: function(req, res, next) {
    reportsService.getReportsData(function(err, data) {
      if (err) {
        console.error('Error fetching reports data:', err);
        return next(err);
      }

      res.render('reports/index', {
        title: 'Reports & Analytics Dashboard',
        summary: data.summary || {},
        recentActivity: data.recentActivity || {},
        user: req.session.user
      });
    });
  },

  /**
   * GET /reports/staff-performance - Enhanced staff performance report
   */
  getStaffPerformance: function(req, res, next) {
    const filters = {
      period: req.query.period || 'this_month',
      role: req.query.role || 'all',
      sort: req.query.sort || 'rentals_desc',
      days: req.query.days,
      from: req.query.from,
      to: req.query.to
    };

    reportsService.getStaffPerformance(filters, function(err, data) {
      if (err) {
        console.error('Error fetching staff performance:', err);
        return next(err);
      }

      res.render('reports/staff-performance', {
        title: 'Staff Performance Report',
        staff: data.staff || [],
        filters: data.filters || {},
        user: req.session.user
      });
    });
  },

  /**
   * GET /reports/film-analytics - Film analytics report
   */
  getFilmAnalytics: function(req, res, next) {
    const filters = {
      category: req.query.category || 'all',
      rating: req.query.rating || 'all',
      sort: req.query.sort || 'popular',
      limit: parseInt(req.query.limit) || 50
    };

    reportsService.getFilmAnalytics(filters, function(err, data) {
      if (err) {
        console.error('Error fetching film analytics:', err);
        return next(err);
      }

      res.render('reports/film-analytics', {
        title: 'Film Analytics Report',
        films: data.films || [],
        categories: data.categories || [],
        summary: data.summary || {},
        filters: data.filters || {},
        user: req.session.user
      });
    });
  },

  /**
   * GET /reports/revenue - Revenue reports
   */
  getRevenue: function(req, res, next) {
    const filters = {
      period: req.query.period || 'monthly',
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      comparison: req.query.comparison || 'previous_period'
    };

    reportsService.getRevenueReports(filters, function(err, data) {
      if (err) {
        console.error('Error fetching revenue reports:', err);
        return next(err);
      }

      res.render('reports/revenue', {
        title: 'Revenue Reports',
        revenue: data.revenue || [],
        summary: data.summary || {},
        filters: data.filters || {},
        user: req.session.user
      });
    });
  },

  /**
   * GET /reports/customer-insights - Customer insights report
   */
  getCustomerInsights: function(req, res, next) {
    const filters = {
      segment: req.query.segment || 'all',
      sort: req.query.sort || 'value',
      limit: parseInt(req.query.limit) || 100,
      status: req.query.status || 'active'
    };

    reportsService.getCustomerInsights(filters, function(err, data) {
      if (err) {
        console.error('Error fetching customer insights:', err);
        return next(err);
      }

      res.render('reports/customer-insights', {
        title: 'Customer Insights Report',
        customers: data.customers || [],
        segments: data.segments || {},
        summary: data.summary || {},
        filters: data.filters || {},
        user: req.session.user
      });
    });
  },

  /**
   * GET /reports/inventory - Inventory reports
   */
  getInventory: function(req, res, next) {
    const filters = {
      category: req.query.category || 'all',
      status: req.query.status || 'all',
      utilization: req.query.utilization || 'all',
      sort: req.query.sort || 'utilization_desc'
    };

    reportsService.getInventoryReports(filters, function(err, data) {
      if (err) {
        console.error('Error fetching inventory reports:', err);
        return next(err);
      }

      // Get categories for the filter dropdown
      const filmsDao = require('../dao/films.dao');
      filmsDao.getCategories(function(catErr, categories) {
        if (catErr) {
          console.error('Error fetching categories:', catErr);
          categories = [];
        }

        res.render('reports/inventory', {
          title: 'Inventory Reports',
          inventory: data.inventory || [],
          summary: data.summary || {},
          alerts: data.alerts || [],
          filters: data.filters || {},
          categories: categories || [],
          user: req.session.user
        });
      });
    });
  },

  /**
   * GET /reports/offers - Offers performance report
   */
  getOffers: function(req, res, next) {
    const filters = {
      category: req.query.category || 'all',
      status: req.query.status || 'all',
      sort: req.query.sort || 'selections_desc',
      period: req.query.period || 'all'
    };

    reportsService.getOffersPerformance(filters, function(err, data) {
      if (err) {
        console.error('Error fetching offers performance:', err);
        return next(err);
      }

      // Get categories for the filter dropdown
      const filmsDao = require('../dao/films.dao');
      filmsDao.getCategories(function(catErr, categories) {
        if (catErr) {
          console.error('Error fetching categories:', catErr);
          categories = [];
        }

        res.render('reports/offers', {
          title: 'Offers Performance Report',
          offers: data.offers || [],
          summary: data.summary || {},
          topPerformers: data.topPerformers || [],
          filters: data.filters || {},
          categories: categories || [],
          user: req.session.user
        });
      });
    });
  }

};

module.exports = reportsController;