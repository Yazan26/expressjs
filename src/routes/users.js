var express = require('express');
var router = express.Router();

const usersController = require('../controllers/users.controller');

/* GET users listing. */
router.get('/', usersController.get);
router.get('/:userId', usersController.get);
router.delete('/:userId', usersController.delete);
router.post('/', usersController.post);
router.put('/:userId', usersController.put);
module.exports = router;
