const mongoose = require("mongoose");
const dotenv = require('dotenv');

// Database
dotenv.config()

const connect = mongoose.connect(process.env.DB_CONNECT, {
    useUnifiedTopology: true,
    useFindAndModify: false,
    useNewUrlParser: true
});

module.exports = connect;
