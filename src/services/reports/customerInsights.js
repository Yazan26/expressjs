const reportsDao = require('../../dao/reports.dao');

function quantile(arr, q) {
  if (!arr.length) return 0;
  const a = [...arr].sort((x, y) => x - y);
  const pos = (a.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  return a[base] + ((a[base + 1] - a[base]) || 0) * rest;
}

function getCustomerInsights(filters, callback) {
  reportsDao.getCustomerInsightsBase((err, customers) => {
    if (err) {
      return callback(null, {
        customers: [], segments: {}, summary: {}, filters,
        rfmSummary: {}, cohorts: [], geography: [], lateReturns: [], inactivity: {},
        pagination: { page: 1, total: 0, totalPages: 0, limit: filters.limit || 100 }
      });
    }

    customers = customers || [];
    const segments = { Premium: 0, Regular: 0, Occasional: 0 };
    const recency = customers.map(c => c.days_since_last_rental || 9999);
    const frequency = customers.map(c => c.total_rentals || 0);
    const monetary = customers.map(c => c.total_spent || 0);
    const rCut = [quantile(recency, 0.2), quantile(recency, 0.4), quantile(recency, 0.6), quantile(recency, 0.8)];
    const fCut = [quantile(frequency, 0.2), quantile(frequency, 0.4), quantile(frequency, 0.6), quantile(frequency, 0.8)];
    const mCut = [quantile(monetary, 0.2), quantile(monetary, 0.4), quantile(monetary, 0.6), quantile(monetary, 0.8)];
    const scoreR = v => (v <= rCut[0] ? 5 : v <= rCut[1] ? 4 : v <= rCut[2] ? 3 : v <= rCut[3] ? 2 : 1);
    const scoreFM = (v, cuts) => (v <= cuts[0] ? 1 : v <= cuts[1] ? 2 : v <= cuts[2] ? 3 : v <= cuts[3] ? 4 : 5);
    const rfmSummary = {};

    customers.forEach(c => {
      c.segment = (c.total_spent || 0) >= 100 ? 'Premium' : (c.total_spent || 0) >= 50 ? 'Regular' : 'Occasional';
      segments[c.segment]++;
      const code = `${scoreR(c.days_since_last_rental || 9999)}${scoreFM(c.total_rentals || 0, fCut)}${scoreFM(c.total_spent || 0, mCut)}`;
      c.rfm = code;
      rfmSummary[code] = (rfmSummary[code] || 0) + 1;
    });

    const inactivity = {
      gt30: customers.filter(c => (c.days_since_last_rental || 0) > 30).length,
      gt60: customers.filter(c => (c.days_since_last_rental || 0) > 60).length,
      gt90: customers.filter(c => (c.days_since_last_rental || 0) > 90).length,
    };

    const totalSpent = customers.reduce((sum, c) => sum + (c.total_spent || 0), 0);
    const avgLifetimeValue = customers.length ? (totalSpent / customers.length).toFixed(2) : 0;

    let filtered = customers;
    if (filters && filters.q && String(filters.q).trim()) {
      const q = String(filters.q).trim().toLowerCase();
      filtered = filtered.filter(c => (`${c.first_name} ${c.last_name}`).toLowerCase().includes(q) || String(c.email || '').toLowerCase().includes(q));
    }
    if (filters && filters.segment && filters.segment !== 'all') {
      filtered = filtered.filter(c => c.segment === filters.segment);
    }
    if (filters && filters.min_rentals) {
      const mr = parseInt(filters.min_rentals, 10) || 0;
      filtered = filtered.filter(c => (c.total_rentals || 0) >= mr);
    }
    if (filters && filters.inactive) {
      const id = parseInt(filters.inactive, 10) || 0;
      filtered = filtered.filter(c => (c.days_since_last_rental || 0) >= id);
    }

    switch (filters && filters.sort) {
      case 'rentals': filtered.sort((a, b) => (b.total_rentals || 0) - (a.total_rentals || 0)); break;
      case 'recent': filtered.sort((a, b) => (a.days_since_last_rental || 9999) - (b.days_since_last_rental || 9999)); break;
      case 'avg_cost': filtered.sort((a, b) => (b.avg_rental_cost || 0) - (a.avg_rental_cost || 0)); break;
      case 'name': filtered.sort((a, b) => (`${a.last_name} ${a.first_name}`).localeCompare(`${b.last_name} ${b.first_name}`)); break;
      case 'value':
      default: filtered.sort((a, b) => (b.total_spent || 0) - (a.total_spent || 0) || (b.total_rentals || 0) - (a.total_rentals || 0));
    }

    const page = parseInt(filters && filters.page, 10) || 1;
    const limit = parseInt(filters && filters.limit, 10) || 100;
    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const pageRows = filtered.slice((page - 1) * limit, (page - 1) * limit + limit);

    reportsDao.getCohorts((coErr, cohorts) => {
      if (coErr) cohorts = [];
      reportsDao.getGeography((geoErr, geography) => {
        if (geoErr) geography = [];
        reportsDao.getLateReturns((lateErr, lateReturns) => {
          if (lateErr) lateReturns = [];
          const topSegment = ['Premium', 'Regular', 'Occasional'].reduce((best, cur) => (
            filtered.filter(c => c.segment === cur).length > filtered.filter(c => c.segment === best).length ? cur : best
          ), 'Occasional');

          callback(null, {
            customers: pageRows,
            segments,
            summary: { totalCustomers: filtered.length, activeCustomers: filtered.length, avgLifetimeValue, topSegment },
            rfmSummary,
            cohorts: cohorts || [],
            geography: geography || [],
            lateReturns: lateReturns || [],
            inactivity,
            filters: { ...filters, page, limit, total, totalPages },
            pagination: { page, limit, total, totalPages }
          });
        });
      });
    });
  });
}

module.exports = { getCustomerInsights };

