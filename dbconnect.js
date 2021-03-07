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

//// FOR DEVELOPMENT ONLY:
// const url = "mongodb://localhost:27017/chat";

// const connect = mongoose.connect(url, { 
//     useUnifiedTopology: true,
//     useFindAndModify: false,
//     useNewUrlParser: true 
// });

module.exports = connect;
