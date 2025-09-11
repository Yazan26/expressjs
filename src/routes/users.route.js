var express = require('express');
var router = express.Router();

const usersController = require("../controllers/users.controller")
/* GET users listing. */
router.get('/', usersController.get)

router.get("/:userId/details",usersController.get)

router.get("/:userId/edit",usersController.update)
router.post("/:userId/edit", usersController.validate, usersController.update)

router.delete('/:userId',usersController.delete)



module.exports = router;
