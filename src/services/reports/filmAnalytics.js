const reportsDao = require('../../dao/reports.dao');

function getFilmAnalytics(filters, callback) {
  const params = [];
  let where = 'WHERE 1=1';
  if (filters.category && filters.category !== 'all') { where += ' AND c.name = ?'; params.push(filters.category); }
  if (filters.rating && filters.rating !== 'all') { where += ' AND f.rating = ?'; params.push(filters.rating); }

  const limit = parseInt(filters.limit) || 50;
  reportsDao.getFilmAnalytics(where, params, limit, (err, rows) => {
    if (err) {
      return callback(null, { films: [], categories: [], summary: {}, filters });
    }

    // Normalize / ensure numeric fields & fallbacks
    const films = (rows || []).map(r => ({
      film_id: r.film_id,
      title: r.title,
      rental_rate: Number(r.rental_rate) || 0,
      rating: r.rating,
      category_name: r.category_name,
      rental_count: Number(r.rental_count) || 0,
      unique_renters: Number(r.unique_renters) || 0,
      total_revenue: Number(r.total_revenue) || 0,
      revenue_per_rental: r.revenue_per_rental ? Number(r.revenue_per_rental).toFixed(2) : ( (Number(r.total_revenue)||0) && (Number(r.rental_count)||0) ? ((Number(r.total_revenue)/Number(r.rental_count))).toFixed(2) : '0.00')
    }));

    const summary = {
      totalFilms: films.length,
      totalRevenue: films.reduce((s,f)=> s + f.total_revenue, 0).toFixed(2),
      avgRentalRate: films.length ? (films.reduce((s,f)=> s + f.rental_rate,0)/films.length).toFixed(2) : '0.00'
    };

    reportsDao.getCategories((e, cats) => callback(null, {
      films,
      categories: (cats||[]).map(c => ({ category_id: c.category_id, name: c.name })),
      summary,
      filters
    }));
  });
}

module.exports = { getFilmAnalytics };
