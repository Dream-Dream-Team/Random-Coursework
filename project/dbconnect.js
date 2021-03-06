const mongoose = require("mongoose");
const dotenv = require('dotenv');

// Database
dotenv.config()

const connect = mongoose.connect(process.env.DB_CONNECT, {
    useUnifiedTopology: true,
    useNewUrlParser: true
}, () => 
    console.log('Database is running ...')
);

module.exports = connect;
