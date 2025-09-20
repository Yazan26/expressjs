const reportsDao = require('../../dao/reports.dao');

function getFilmAnalytics(filters, callback) {
  const params = [];
  let where = 'WHERE 1=1';
  if (filters.category && filters.category !== 'all') { where += ' AND c.name = ?'; params.push(filters.category); }
  if (filters.rating && filters.rating !== 'all') { where += ' AND f.rating = ?'; params.push(filters.rating); }

  const limit = parseInt(filters.limit) || 50;
  reportsDao.getFilmAnalytics(where, params, limit, (err, films) => {
    if (err) return callback(null, { films: [], categories: [], summary: {}, filters });
    const summary = {
      totalFilms: films.length,
      totalRevenue: films.reduce((s,f)=> s + (f.total_revenue||0), 0),
      avgRentalRate: films.length ? (films.reduce((s,f)=> s + (f.rental_rate||0),0)/films.length).toFixed(2) : 0
    };
    reportsDao.getCategories((e, cats) => callback(null, { films, categories: cats||[], summary, filters }));
  });
}

module.exports = { getFilmAnalytics };
