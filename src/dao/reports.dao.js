const database = require('../db/sql/connection');

function query(sql, params, cb) {
  database.query(sql, params || [], cb);
}

module.exports = {
  // Dashboard
  getRecentActivity(cb) {
    const sql = `SELECT COUNT(DISTINCT r.rental_id) as totalRentals,
                        COALESCE(SUM(p.amount),0) as totalRevenue,
                        COUNT(DISTINCT CASE WHEN c.create_date >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN c.customer_id END) as newCustomers
                 FROM rental r
                 LEFT JOIN payment p ON p.rental_id = r.rental_id
                 LEFT JOIN customer c ON c.customer_id = r.customer_id
                 WHERE r.rental_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)`;
    query(sql, [], cb);
  },

  // Staff performance
  getStaffPerformance(dateFilterSql, params, cb) {
    const sql = `SELECT s.staff_id, s.first_name, s.last_name, s.email,
                        COUNT(DISTINCT r.rental_id) as total_rentals,
                        COALESCE(SUM(p.amount),0) as total_revenue,
                        COUNT(DISTINCT r.customer_id) as unique_customers,
                        AVG(DATEDIFF(COALESCE(r.return_date, NOW()), r.rental_date)) as avg_rental_duration
                 FROM staff s
                 LEFT JOIN rental r ON r.staff_id = s.staff_id ${dateFilterSql}
                 LEFT JOIN payment p ON p.rental_id = r.rental_id
                 GROUP BY s.staff_id, s.first_name, s.last_name, s.email
                 ORDER BY total_rentals DESC, total_revenue DESC`;
    query(sql, params, cb);
  },

  // Film analytics
  getFilmAnalytics(whereSql, params, limit, cb) {
    const sql = `SELECT f.film_id, f.title, f.rental_rate, f.rating, c.name as category_name,
                        COUNT(DISTINCT r.rental_id) as total_rentals,
                        COALESCE(SUM(p.amount),0) as total_revenue
                 FROM film f
                 LEFT JOIN film_category fc ON fc.film_id = f.film_id
                 LEFT JOIN category c ON c.category_id = fc.category_id
                 LEFT JOIN inventory i ON i.film_id = f.film_id
                 LEFT JOIN rental r ON r.inventory_id = i.inventory_id
                 LEFT JOIN payment p ON p.rental_id = r.rental_id
                 ${whereSql}
                 GROUP BY f.film_id, f.title, f.rental_rate, f.rating, c.name
                 ORDER BY total_rentals DESC, total_revenue DESC
                 LIMIT ?`;
    query(sql, [...params, limit], cb);
  },

  getCategories(cb) {
    query('SELECT category_id, name FROM category ORDER BY name', [], cb);
  },

  // Revenue
  getRevenue(dateExpr, groupBy, cb) {
    const sql = `SELECT ${dateExpr} as period,
                        COUNT(p.payment_id) as transaction_count,
                        SUM(p.amount) as total_revenue,
                        AVG(p.amount) as avg_transaction,
                        COUNT(DISTINCT r.customer_id) as unique_customers
                 FROM payment p
                 LEFT JOIN rental r ON r.rental_id = p.rental_id
                 WHERE p.payment_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
                 GROUP BY ${groupBy}
                 ORDER BY period DESC
                 LIMIT 12`;
    query(sql, [], cb);
  },

  // Customer insights base + extras
  getCustomerInsightsBase(cb) {
    const sql = `SELECT c.customer_id, c.first_name, c.last_name, c.email, c.create_date,
                        COUNT(DISTINCT r.rental_id) as total_rentals,
                        COALESCE(SUM(p.amount),0) as total_spent,
                        AVG(p.amount) as avg_rental_cost,
                        MAX(r.rental_date) as last_rental_date,
                        DATEDIFF(NOW(), MAX(r.rental_date)) as days_since_last_rental
                 FROM customer c
                 LEFT JOIN rental r ON r.customer_id = c.customer_id
                 LEFT JOIN payment p ON p.rental_id = r.rental_id
                 WHERE c.active = 1
                 GROUP BY c.customer_id, c.first_name, c.last_name, c.email, c.create_date
                 HAVING COUNT(DISTINCT r.rental_id) > 0
                 ORDER BY total_spent DESC, total_rentals DESC
                 LIMIT 200`;
    query(sql, [], cb);
  },

  getCohorts(cb) {
    const sql = `SELECT DATE_FORMAT(c.create_date, '%Y-%m') as cohort,
                        COUNT(c.customer_id) as customers,
                        COUNT(DISTINCT r.rental_id) as rentals,
                        COALESCE(SUM(p.amount),0) as revenue
                 FROM customer c
                 LEFT JOIN rental r ON r.customer_id = c.customer_id
                 LEFT JOIN payment p ON p.customer_id = c.customer_id
                 GROUP BY DATE_FORMAT(c.create_date, '%Y-%m')
                 ORDER BY cohort DESC
                 LIMIT 18`;
    query(sql, [], cb);
  },

  getGeography(cb) {
    const sql = `SELECT co.country, ci.city,
                        COUNT(DISTINCT c.customer_id) as customers,
                        COALESCE(SUM(p.amount),0) as revenue
                 FROM customer c
                 JOIN address a ON a.address_id = c.address_id
                 JOIN city ci ON ci.city_id = a.city_id
                 JOIN country co ON co.country_id = ci.country_id
                 LEFT JOIN payment p ON p.customer_id = c.customer_id
                 GROUP BY co.country, ci.city
                 ORDER BY revenue DESC
                 LIMIT 25`;
    query(sql, [], cb);
  },

  getLateReturns(cb) {
    const sql = `SELECT c.customer_id, c.first_name, c.last_name,
                        COUNT(r.rental_id) as total_rentals,
                        SUM(CASE WHEN r.return_date IS NOT NULL AND r.return_date > DATE_ADD(r.rental_date, INTERVAL f.rental_duration DAY) THEN 1 ELSE 0 END) as late_returns
                 FROM customer c
                 JOIN rental r ON r.customer_id = c.customer_id
                 JOIN inventory i ON i.inventory_id = r.inventory_id
                 JOIN film f ON f.film_id = i.film_id
                 GROUP BY c.customer_id, c.first_name, c.last_name
                 HAVING total_rentals > 0
                 ORDER BY late_returns DESC, total_rentals DESC
                 LIMIT 25`;
    query(sql, [], cb);
  },

  // Inventory
  getInventory(whereSql, params, cb) {
    const sql = `SELECT f.film_id, f.title, f.rental_rate, c.name as category_name,
                        COUNT(i.inventory_id) as total_copies,
                        COUNT(CASE WHEN r.return_date IS NULL THEN 1 END) as rented_copies,
                        COUNT(CASE WHEN r.return_date IS NOT NULL OR r.rental_id IS NULL THEN 1 END) as available_copies,
                        (COUNT(CASE WHEN r.return_date IS NULL THEN 1 END) / NULLIF(COUNT(i.inventory_id),0) * 100) as utilization_rate,
                        COUNT(DISTINCT r.rental_id) as total_rentals,
                        COALESCE(SUM(p.amount),0) as total_revenue
                 FROM film f
                 LEFT JOIN film_category fc ON fc.film_id = f.film_id
                 LEFT JOIN category c ON c.category_id = fc.category_id
                 LEFT JOIN inventory i ON i.film_id = f.film_id
                 LEFT JOIN rental r ON r.inventory_id = i.inventory_id
                 LEFT JOIN payment p ON p.rental_id = r.rental_id
                 ${whereSql}
                 GROUP BY f.film_id, f.title, f.rental_rate, c.name
                 ORDER BY utilization_rate DESC, total_copies DESC
                 LIMIT 100`;
    query(sql, params, cb);
  },

  // Offers performance
  getOffersPerformance(cb) {
    const sql = `SELECT f.film_id, f.title, f.rental_rate, c.name as category_name,
                        COUNT(DISTINCT sos.staff_id) as selection_count,
                        COUNT(DISTINCT r.rental_id) as rental_count,
                        COALESCE(SUM(p.amount),0) as revenue_generated
                 FROM film f
                 LEFT JOIN film_category fc ON fc.film_id = f.film_id
                 LEFT JOIN category c ON c.category_id = fc.category_id
                 LEFT JOIN staff_offer_selections sos ON sos.film_id = f.film_id
                 LEFT JOIN inventory i ON i.film_id = f.film_id
                 LEFT JOIN rental r ON r.inventory_id = i.inventory_id
                 LEFT JOIN payment p ON p.rental_id = r.rental_id
                 GROUP BY f.film_id, f.title, f.rental_rate, c.name
                 ORDER BY selection_count DESC, rental_count DESC
                 LIMIT 50`;
    query(sql, [], cb);
  },
};

