const database = require('../db/sql/connection');

function query(sql, params, cb) {
  database.query(sql, params || [], cb);
}

module.exports = {
  getAvailableOffers(config, cb) {
    const { whereClause, orderBySql, params } = config;
    const sql = `SELECT f.film_id, f.title, f.description, f.rental_rate, f.rating, c.name as category_name,
                        COALESCE(fo.discount_percentage, 15) as discount_percent,
                        'Staff discount available' as offer_description,
                        (f.rental_rate * COALESCE(fo.discount_percentage, 15) / 100) as discount_amount,
                        (f.rental_rate - (f.rental_rate * COALESCE(fo.discount_percentage, 15) / 100)) as discounted_price,
                        DATE_ADD(NOW(), INTERVAL 30 DAY) as expires_at,
                        'active' as status
                 FROM film f
                 LEFT JOIN film_category fc ON f.film_id = fc.film_id
                 LEFT JOIN category c ON fc.category_id = c.category_id
                 LEFT JOIN film_offers fo ON f.film_id = fo.film_id
                 ${whereClause}
                 ${orderBySql}
                 LIMIT ? OFFSET ?`;
    query(sql, params, cb);
  },

  getOffersFallback(options, cb) {
    const params = [];
    let whereClause = '';
    if (options.category && options.category !== 'all') {
      whereClause = 'WHERE fc.category_id = ?';
      params.push(parseInt(options.category, 10));
    }
    const sql = `SELECT f.film_id, f.title, f.description, f.rental_rate, f.rating, c.name as category_name
                 FROM film f
                 LEFT JOIN film_category fc ON f.film_id = fc.film_id
                 LEFT JOIN category c ON fc.category_id = c.category_id
                 ${whereClause}
                 ORDER BY f.title
                 LIMIT ? OFFSET ?`;
    params.push(options.limit, options.offset);
    query(sql, params, cb);
  },

  getCategories(cb) {
    query('SELECT category_id, name FROM category ORDER BY name', [], cb);
  },

  getStaffOfferSelections(staffId, cb) {
    const sql = `SELECT f.film_id, f.title, f.rental_rate, f.rating,
                        c.name as category_name,
                        fo.discount_percentage as discount_percent,
                        'Staff discount available' as offer_description,
                        (f.rental_rate * fo.discount_percentage / 100) as discount_amount,
                        (f.rental_rate - (f.rental_rate * fo.discount_percentage / 100)) as discounted_price,
                        sos.selected_at,
                        DATE_ADD(sos.selected_at, INTERVAL 30 DAY) as expires_at
                 FROM staff_offer_selections sos
                 JOIN film_offers fo ON sos.offer_id = fo.offer_id
                 JOIN film f ON fo.film_id = f.film_id
                 LEFT JOIN film_category fc ON f.film_id = fc.film_id
                 LEFT JOIN category c ON fc.category_id = c.category_id
                 WHERE sos.staff_id = ? AND fo.is_active = 1
                 ORDER BY sos.selected_at DESC`;
    query(sql, [staffId], cb);
  },

  // Retrieve discount percentage for an active offer by film
  selectOfferDiscount(filmId, cb) {
    const sql = `SELECT discount_percentage FROM film_offers WHERE film_id = ? AND is_active = 1 LIMIT 1`;
    query(sql, [filmId], cb);
  },

  insertSelection(staffId, offerId, discountPercentage, cb) {
    const sql = `INSERT INTO staff_offer_selections (staff_id, offer_id, discount_percentage, selected_at)
                 VALUES (?, ?, ?, NOW())
                 ON DUPLICATE KEY UPDATE selected_at = NOW(), discount_percentage = VALUES(discount_percentage)`;
    query(sql, [staffId, offerId, discountPercentage], cb);
  },

  findActiveOffer(filmId, cb) {
    query('SELECT offer_id, discount_percentage FROM film_offers WHERE film_id = ? AND is_active = 1 LIMIT 1', [filmId], cb);
  },

  getFilmById(filmId, cb) {
    query('SELECT * FROM film WHERE film_id = ?', [filmId], cb);
  },
};
