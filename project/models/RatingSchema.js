const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema({
    Rating: [ // Will store the rating value, username, time sent
        { type: Object }
      ],
    EventID:{
        type: mongoose.Schema.Types.ObjectId  , ref: 'events'
    },
    TotalRating: {
        type: Number
    },
    AmountOfRatings:{
        type: Number
    },
    AverageRating:{
        type: Number
    }
}, {
    timestamps: true
    }
);

module.exports = mongoose.model("ratings", ratingSchema);