const reportsDao = require('../../dao/reports.dao');

function getReportsData(callback) {
  reportsDao.getRecentActivity((err, rows) => {
    if (err) return callback(null, {
      summary: { totalStaff: 0, totalOffers: 0, thisMonth: { offers: 0, selections: 0 } },
      recentActivity: { totalRentals: 0, totalRevenue: 0, newCustomers: 0, offerSelections: 0 }
    });

    const r = rows && rows[0] || {};
    callback(null, {
      summary: { totalStaff: 0, totalOffers: 0, thisMonth: { offers: 0, selections: 0 } },
      recentActivity: {
        totalRentals: r.totalRentals || 0,
        totalRevenue: r.totalRevenue || 0,
        newCustomers: r.newCustomers || 0,
        offerSelections: 0
      }
    });
  });
}

module.exports = { getReportsData };
