const mongoose = require("mongoose");

const url = "mongodb://localhost:27017/chat";

const connect = mongoose.connect(url, { 
    useUnifiedTopology: true,
    useFindAndModify: false,
    useNewUrlParser: true 
});

module.exports = connect;
