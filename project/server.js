const express = require('express');
const app = express();
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const path = require('path');

const routes = require('./routes/route');

// Database
dotenv.config()

mongoose.connect(process.env.DB_CONNECT, {
    useUnifiedTopology: true,
    useNewUrlParser: true
}, () => 
    console.log('Database is running ...')
);

// Views
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({extended: false}));
// app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Middleware
app.use(express.static('public'));
app.use('/', routes);

app.listen(4000, () => console.log('Server is running ... '));
