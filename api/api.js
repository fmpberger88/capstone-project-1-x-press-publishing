const express = require('express');
const apiRouter = express.Router();
const artistRouter = require('./artists');

apiRouter.use('/artists', artistRouter);

module.exports = apiRouter;