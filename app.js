var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var cors = require("cors");
var logger = require('morgan');

var indexRouter = require('./routes/index');
const bodyParser = require('body-parser');

var app = express();
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
require("./routes/users")(app);


module.exports = app;
