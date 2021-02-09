var express = require('express');
var router = express.Router();
var AuthController = require("../controllers/api/auth");
/* GET home page. */
router.get('/', AuthController.home);

module.exports = router;
