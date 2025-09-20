const database = require('../db/sql/connection');

function query(sql, params, cb) { database.query(sql, params || [], cb); }

module.exports = {
  // Film CRUD helpers
  insertFilm(data, cb) {
    const sql = `INSERT INTO film (title, description, release_year, language_id, length, rating, rental_rate, replacement_cost, last_update)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`;
    const params = [data.title, data.description, data.releaseYear, data.languageId, data.length, data.rating, data.rentalRate, data.rentalRate * 10];
    query(sql, params, cb);
  },
  assignFilmCategory(filmId, categoryId, cb) { query(`INSERT INTO film_category (film_id, category_id, last_update) VALUES (?, ?, NOW())`, [filmId, categoryId], cb); },
  updateFilm(filmId, updates, cb) {
    const sql = `UPDATE film SET title = ?, description = ?, length = ?, rating = ?, rental_rate = ?, last_update = NOW() WHERE film_id = ?`;
    const params = [updates.title, updates.description, updates.length, updates.rating, updates.rentalRate, filmId];
    query(sql, params, cb);
  },
  upsertFilmCategory(filmId, categoryId, cb) {
    const sql = `INSERT INTO film_category (film_id, category_id, last_update) VALUES (?, ?, NOW()) ON DUPLICATE KEY UPDATE category_id = ?, last_update = NOW()`;
    query(sql, [filmId, categoryId, categoryId], cb);
  },
  selectFilmById(filmId, cb) { query(`SELECT f.*, c.category_id FROM film f LEFT JOIN film_category fc ON f.film_id = fc.film_id LEFT JOIN category c ON fc.category_id = c.category_id WHERE f.film_id = ?`, [filmId], cb); },
  selectFilmInventory(filmId, cb) {
    const sql = `SELECT i.*, c.first_name, c.last_name, r.rental_date,
                        (SELECT COUNT(*) FROM rental r_all WHERE r_all.inventory_id = i.inventory_id) AS total_rentals,
                        (SELECT COUNT(*) FROM rental r_active WHERE r_active.inventory_id = i.inventory_id AND r_active.return_date IS NULL) AS active_rentals
                 FROM inventory i
                 LEFT JOIN rental r ON i.inventory_id = r.inventory_id AND r.return_date IS NULL
                 LEFT JOIN customer c ON r.customer_id = c.customer_id
                 WHERE i.film_id = ?`;
    query(sql, [filmId], cb);
  },
  insertInventoryCopies(filmId, copies, cb) {
    const values = Array(copies).fill('(?, 1, NOW())').join(', ');
    const params = Array(copies).fill(filmId);
    query(`INSERT INTO inventory (film_id, store_id, last_update) VALUES ${values}`, params, cb);
  },
  selectInventoryById(inventoryId, cb) { query(`SELECT inventory_id, film_id FROM inventory WHERE inventory_id = ?`, [inventoryId], cb); },
  selectInventoryRentalUsage(inventoryId, cb) {
    const sql = `SELECT SUM(CASE WHEN return_date IS NULL THEN 1 ELSE 0 END) AS active_rentals,
                        COUNT(*) AS total_rentals
                 FROM rental
                 WHERE inventory_id = ?`;
    query(sql, [inventoryId], cb);
  },
  deleteInventoryCopy(inventoryId, cb) { query(`DELETE FROM inventory WHERE inventory_id = ?`, [inventoryId], cb); },

  // Staff
  selectStaffFull(cb) { query(`SELECT staff_id, first_name, last_name, email, active, role, store_id, last_update FROM staff ORDER BY last_name, first_name`, [], cb); },
  selectStaffBasic(cb) { query(`SELECT staff_id, first_name, last_name, email, store_id, last_update FROM staff ORDER BY last_name, first_name`, [], cb); },
  toggleStaff(staffId, active, cb) { query(`UPDATE staff SET active = ?, last_update = NOW() WHERE staff_id = ?`, [active, staffId], cb); },
  insertStaffFull(data, cb) {
    const sql = `INSERT INTO staff (first_name, last_name, email, store_id, active, username, role, password_hash, last_update, address_id) VALUES (?, ?, ?, ?, 1, ?, ?, ?, NOW(), 1)`;
    query(sql, [data.firstName, data.lastName, data.email, data.storeId, data.username, data.role, data.passwordHash], cb);
  },
  insertStaffBasic(data, cb) {
    const sql = `INSERT INTO staff (first_name, last_name, email, store_id, active, username, last_update, address_id) VALUES (?, ?, ?, ?, 1, ?, NOW(), 1)`;
    query(sql, [data.firstName, data.lastName, data.email, data.storeId, data.username], cb);
  },

  // Offers
  activateOffer(filmId, cb) { query(`INSERT INTO film_offers (film_id, active, created_date) VALUES (?, 1, NOW()) ON DUPLICATE KEY UPDATE active = 1`, [filmId], cb); },
  deactivateOffer(filmId, cb) { query(`UPDATE film_offers SET active = 0 WHERE film_id = ?`, [filmId], cb); },
  selectFilmsByCategory(categoryId, cb) {
    if (!categoryId) return query('SELECT film_id FROM film', [], cb);
    query(`SELECT f.film_id FROM film f JOIN film_category fc ON f.film_id = fc.film_id WHERE fc.category_id = ?`, [categoryId], cb);
  },
  selectAllFilmIds(cb) { query('SELECT film_id FROM film', [], cb); },
  activateOffersBulk(filmIds, cb) { const sql = `INSERT INTO film_offers (film_id, active, created_date) VALUES ${filmIds.map(()=> '(?, 1, NOW())').join(', ')} ON DUPLICATE KEY UPDATE active = 1`; query(sql, filmIds, cb); },
  deactivateOffersBulk(filmIds, cb) { const sql = `UPDATE film_offers SET active = 0 WHERE film_id IN (${filmIds.map(()=>'?').join(',')})`; query(sql, filmIds, cb); },
  selectAvailableFilmsNoOffers(cb) {
    const sql = `SELECT f.film_id, f.title, f.rental_rate, f.rating, c.name as category_name FROM film f LEFT JOIN film_category fc ON f.film_id = fc.film_id LEFT JOIN category c ON fc.category_id = c.category_id WHERE NOT EXISTS (SELECT 1 FROM film_offers fo WHERE fo.film_id = f.film_id AND fo.active = 1) ORDER BY f.title`;
    query(sql, [], cb);
  },
  selectAvailableFilmsPaged(whereSql, params, limit, offset, cb) {
    const sql = `SELECT f.film_id, f.title, f.rental_rate, f.rating, f.length, c.name as category_name FROM film f LEFT JOIN film_category fc ON f.film_id = fc.film_id LEFT JOIN category c ON fc.category_id = c.category_id LEFT JOIN film_offers fo ON f.film_id = fo.film_id AND fo.is_active = 1 ${whereSql} ORDER BY f.title LIMIT ? OFFSET ?`;
    query(sql, [...params, limit, offset], cb);
  },
  countAvailableFilms(whereSql, params, cb) {
    const sql = `SELECT COUNT(*) as total FROM film f LEFT JOIN film_category fc ON f.film_id = fc.film_id LEFT JOIN category c ON fc.category_id = c.category_id LEFT JOIN film_offers fo ON f.film_id = fo.film_id AND fo.is_active = 1 ${whereSql}`;
    query(sql, params, cb);
  },
  insertOfferRecord(filmId, discountPercent, cb) {
    const sql = `INSERT INTO film_offers (film_id, discount_percentage, is_active, created_at) VALUES (?, ?, 1, NOW()) ON DUPLICATE KEY UPDATE discount_percentage = VALUES(discount_percentage), is_active = 1, created_at = NOW()`;
    query(sql, [filmId, discountPercent], cb);
  },
  selectStaffOfferSelections(staffId, cb) {
    const sql = `SELECT f.film_id, f.title, f.rental_rate, f.rating, c.name as category_name, fo.discount_percentage as discount_percent, 'Staff discount available' as offer_description, (f.rental_rate * fo.discount_percentage / 100) as discount_amount, (f.rental_rate - (f.rental_rate * fo.discount_percentage / 100)) as discounted_price, sos.selected_at, DATE_ADD(sos.selected_at, INTERVAL 30 DAY) as expires_at FROM staff_offer_selections sos JOIN film_offers fo ON sos.offer_id = fo.offer_id JOIN film f ON fo.film_id = f.film_id LEFT JOIN film_category fc ON f.film_id = fc.film_id LEFT JOIN category c ON fc.category_id = c.category_id WHERE sos.staff_id = ? AND fo.is_active = 1 ORDER BY sos.selected_at DESC`;
    query(sql, [staffId], cb);
  },
  selectOfferDiscount(filmId, cb) { query(`SELECT COALESCE(fo.discount_percentage, 0) as discount_percent FROM film f LEFT JOIN film_offers fo ON f.film_id = fo.film_id AND fo.is_active = 1 WHERE f.film_id = ?`, [filmId], cb); },
  selectOfferStats(cb) {
    const sql = `SELECT COUNT(DISTINCT fo.film_id) as active_offers, AVG(fo.discount_percentage) as avg_discount, COUNT(DISTINCT sos.staff_id) as staff_participating, SUM(f.rental_rate * COALESCE(fo.discount_percentage, 0) / 100) as total_potential_savings FROM film f LEFT JOIN film_offers fo ON f.film_id = fo.film_id AND fo.is_active = 1 LEFT JOIN staff_offer_selections sos ON fo.offer_id = sos.offer_id WHERE fo.film_id IS NOT NULL`;
    query(sql, [], cb);
  },
  deactivateOfferById(offerId, cb) { query(`UPDATE film_offers SET is_active = 0 WHERE offer_id = ?`, [offerId], cb); },
  selectAllOffers(whereSql, params, limit, offset, cb) {
    const sql = `SELECT fo.offer_id, fo.film_id, f.title, f.rental_rate, f.rating, c.name as category_name, fo.discount_percentage, (f.rental_rate * fo.discount_percentage / 100) as discount_amount, fo.created_at FROM film_offers fo JOIN film f ON fo.film_id = f.film_id LEFT JOIN film_category fc ON f.film_id = fc.film_id LEFT JOIN category c ON fc.category_id = c.category_id ${whereSql} ORDER BY fo.created_at DESC LIMIT ? OFFSET ?`;
    query(sql, [...params, limit, offset], cb);
  },
  countAllOffers(whereSql, params, cb) {
    const sql = `SELECT COUNT(*) as total FROM film_offers fo JOIN film f ON fo.film_id = f.film_id LEFT JOIN film_category fc ON f.film_id = fc.film_id LEFT JOIN category c ON fc.category_id = c.category_id ${whereSql}`;
    query(sql, params, cb);
  },
};
