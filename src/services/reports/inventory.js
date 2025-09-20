const reportsDao = require('../../dao/reports.dao');

function getInventoryReports(filters, callback) {
  const params = [];
  let where = 'WHERE 1=1';
  if (filters.category && filters.category !== 'all') { where += ' AND c.name = ?'; params.push(filters.category); }

  reportsDao.getInventory(where, params, (err, rows) => {
    if (err) return callback(null, { inventory: [], summary: {}, alerts: [], filters });
    const summary = {
      totalTitles: rows.length,
      avgUtilization: rows.length ? (rows.reduce((s,x)=> s+(x.utilization_rate||0),0)/rows.length).toFixed(1) : 0,
      totalCopies: rows.reduce((s,x)=> s+(x.total_copies||0),0)
    };
    callback(null, { inventory: rows, summary, alerts: [], filters });
  });
}

module.exports = { getInventoryReports };
