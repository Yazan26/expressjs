// Modular Admin Service with minimal files
const films = require('./admin/films');
const staffOffers = require('./admin/staffOffers');

module.exports = {
  // Films
  getFilmsData: films.getFilmsData,
  createFilm: films.createFilm,
  getFilmForEdit: films.getFilmForEdit,
  updateFilm: films.updateFilm,
  getFilmInventory: films.getFilmInventory,
  addFilmCopies: films.addFilmCopies,
  removeFilmCopy: films.removeFilmCopy,

  // Staff
  getStaffData: staffOffers.getStaffData,
  createStaff: staffOffers.createStaff,
  toggleStaff: staffOffers.toggleStaff,

  // Offers
  toggleOffer: staffOffers.toggleOffer,
  batchUpdateOffers: staffOffers.batchUpdateOffers,
  getAvailableFilmsForOffers: staffOffers.getAvailableFilmsForOffers,
  createOffers: staffOffers.createOffers,
  getStaffOfferSelections: staffOffers.getStaffOfferSelections,
  applyOfferDiscount: staffOffers.applyOfferDiscount,
  getOfferStats: staffOffers.getOfferStats,
  removeOffer: staffOffers.removeOffer,
  getAllOffers: staffOffers.getAllOffers,
};

