const express = require('express');
const cors = require('cors');
const errorhandler = require('errorhandler');
const morgan = require('morgan');
const apiRouter = require('./api/api')

const app = express();

PORT = process.env.PORT || 4001;

// Setup Middlewares
app.use(express.json());
app.use(morgan('dev'));
app.use(cors());
app.use(errorhandler());

// Mounting apiRouter
app.use('/api', apiRouter)

app.listen(PORT, () => {
    console.log(`Server is listening on ${PORT}`);
})

module.exports = app;