const mongoose = require('mongoose');

const signUpTemplate = new mongoose.Schema({
    email:{
        type: String
    },
    username:{
        type: String
    },
    password:{
        type: String
    },
    date:{
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('accounts', signUpTemplate);