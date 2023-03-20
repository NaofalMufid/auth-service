const express = require('express');
const app = express();
const UserRouter = require('../src/user/UserRouter');

app.use(express.json());
app.use(UserRouter);

module.exports = app;
