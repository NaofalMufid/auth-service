var express = require('express');
var router = express.Router();
var path = require('path')
/* GET home page. */
router.get('/', function(req, res, next) {
  res.sendFile(path.resolve("views/home.html"))
});

module.exports = router;
