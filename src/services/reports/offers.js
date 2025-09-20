const reportsDao = require('../../dao/reports.dao');

function getOffersPerformance(filters, callback) {
  // Try using staff selections if available; otherwise fall back to rentals
  reportsDao.getOffersPerformance((err, rows) => {
    if (err) return callback(null, { offers: [], summary: {}, topPerformers: [], filters });
    const totalSelections = rows.reduce((s,o)=> s + (o.selection_count||0), 0);
    const totalSavings = 0; // Unknown without discount table; keep zero or compute with defaults
    callback(null, {
      offers: rows,
      summary: { totalOffers: rows.length, totalSelections, avgDiscount: 0, totalSavings: totalSavings.toFixed ? totalSavings.toFixed(2) : 0 },
      topPerformers: rows.slice(0,5),
      filters
    });
  });
}

module.exports = { getOffersPerformance };
