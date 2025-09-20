const reportsDao = require('../../dao/reports.dao');

function getRevenueReports(filters, callback) {
  const period = filters.period || 'monthly';
  let dateFormat = 'DATE_FORMAT(p.payment_date, "%Y-%m")';
  let groupBy = 'DATE_FORMAT(p.payment_date, "%Y-%m")';
  if (period === 'daily') { dateFormat = 'DATE(p.payment_date)'; groupBy = 'DATE(p.payment_date)'; }
  if (period === 'weekly') { dateFormat = 'YEARWEEK(p.payment_date)'; groupBy = 'YEARWEEK(p.payment_date)'; }

  reportsDao.getRevenue(dateFormat, groupBy, (err, revenue) => {
    if (err) return callback(null, { revenue: [], summary: { totalRevenue: 0, avgMonthly: 0, topMonth: '' }, filters });
    const totalRevenue = revenue.reduce((s,r)=> s + (r.total_revenue||0), 0);
    const avgMonthly = revenue.length ? (totalRevenue / revenue.length).toFixed(2) : 0;
    callback(null, { revenue, summary: { totalRevenue: totalRevenue.toFixed(2), avgMonthly, topMonth: (revenue[0]&&revenue[0].period)||'' }, filters });
  });
}

module.exports = { getRevenueReports };
