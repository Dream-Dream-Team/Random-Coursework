const mongoose = require('mongoose');

const guestTemplate = new mongoose.Schema({
    username:{
        type: String
    },
    eventToken:{
        type: String
    }
})

module.exports = mongoose.model('guest', guestTemplate);