const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    EventID: {
      type: mongoose.Schema.Types.ObjectId  , ref: 'events'
    },
    Messages: [
      { type: Object }
    ],
    SentimentOverTime: [
      { type: Object } 
    ],
    TotalSentiment: {
      type: Number
    },
    AmountOfMessages: {
      type: Number
    },
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("eventchats", chatSchema);

