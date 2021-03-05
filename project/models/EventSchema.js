const mongoose = require('mongoose');

const eventTemplate = new mongoose.Schema({
    hostID:{
        type: String
    },
    img:{
        type: String,
        default: 'placeholder.jpg'
    },
    eventName:{
        type: String
    },
    participants:{
        type: Number
    },
    participantsList: [String],
    startDate:{
        type: Date
    },
    endDate:{
        type: Date
    },
    dateCreated:{
        type: Date,
        default: Date.now
    },
    analytics:{
        type: Boolean,
        default: false
    },
    generalMood:{
        type: Boolean,
        default: false
    },
    generalMoodOverTime:{
        type: Boolean,
        default: false
    },
    requests:{
        type: Boolean,
        default: false
    },
    public:{
        type: Boolean,
        default: false
    },
    eventToken:{
        type: String
    },
    active:{
        type: Boolean,
        default: false
    }
})

module.exports = mongoose.model('events', eventTemplate);