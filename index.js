const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const app = express();
const router = require('./router');

// DB Setup
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:auth/auth')

// App Setup
app.use(morgan('combined'));
app.use(bodyParser.json({ type: '*/*' }));
router(app);

// Server setup
const port = process.env.PORT || 3000;
const server = http.createServer(app);
server.listen(port, function() {
    console.log('Server listening on port:', port);
})
