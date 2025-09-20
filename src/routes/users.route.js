var express = require('express');
var router = express.Router();

const usersController = require("../controllers/users.controller");
const requireAuth = require('../middleware/requireAuth');
const requireRole = require('../middleware/requireRole');

/**
 * Users Routes - Simplified
 */

// Apply authentication middleware to all users routes
router.use(requireAuth);
router.use(requireRole(['staff', 'manager', 'admin']));

/* GET users listing */
router.get('/', usersController.get);
router.get('/:userId/details', usersController.get);
router.get('/:userId/edit', usersController.update);
router.post('/:userId/edit', usersController.validate, usersController.update);
router.get('/:userId/rentals', usersController.getRentals);
router.get('/:userId/spending', usersController.getSpending);
router.delete('/:userId', usersController.CheckRentals, usersController.delete);

module.exports = router;
