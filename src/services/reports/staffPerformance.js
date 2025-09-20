const reportsDao = require('../../dao/reports.dao');

function getStaffPerformance(filters, callback) {
  let dateFilter = '';
  const params = [];
  switch (filters.period) {
    case 'this_week': dateFilter = 'AND r.rental_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)'; break;
    case 'this_month': dateFilter = 'AND r.rental_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)'; break;
    case 'this_year': dateFilter = 'AND YEAR(r.rental_date) = YEAR(NOW())'; break;
    case 'custom': if (filters.from && filters.to) { dateFilter = 'AND r.rental_date BETWEEN ? AND ?'; params.push(filters.from, filters.to); } break;
    default: break;
  }

  reportsDao.getStaffPerformance(dateFilter, params, (err, rows) => {
    if (err) return callback(null, { staff: [], filters });
    callback(null, { staff: rows || [], filters });
  });
}

module.exports = { getStaffPerformance };
