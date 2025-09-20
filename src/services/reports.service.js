// Aggregated Reports Service (modularized)
const dashboard = require('./reports/dashboard');
const staff = require('./reports/staffPerformance');
const films = require('./reports/filmAnalytics');
const revenue = require('./reports/revenue');
const customers = require('./reports/customerInsights');
const inventory = require('./reports/inventory');
const offers = require('./reports/offers');

module.exports = {
  getReportsData: dashboard.getReportsData,
  getStaffPerformance: staff.getStaffPerformance,
  getFilmAnalytics: films.getFilmAnalytics,
  getRevenueReports: revenue.getRevenueReports,
  getCustomerInsights: customers.getCustomerInsights,
  getInventoryReports: inventory.getInventoryReports,
  getOffersPerformance: offers.getOffersPerformance,
};

