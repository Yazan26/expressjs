var express = require('express');
var router = express.Router();

const usersController = require("../controllers/users.controller");
const { requireAuth, requireStaff } = require('../middleware/requireAuth');

/**
 * Users Routes
 * All routes require authentication
 * Some routes require staff/manager permissions
 */

// Apply authentication middleware to all users routes
router.use(requireAuth);

/* GET users listing - requires staff or manager role */
router.get('/', requireStaff, usersController.get);

/* GET user details - requires staff or manager role */
router.get("/:userId/details", requireStaff, usersController.get);

/* GET/POST user edit - requires staff or manager role */
router.get("/:userId/edit", requireStaff, usersController.update);
router.post("/:userId/edit", requireStaff, usersController.validate, usersController.update);

/* DELETE user - requires staff or manager role */
router.delete('/:userId', requireStaff, usersController.delete);

module.exports = router;
