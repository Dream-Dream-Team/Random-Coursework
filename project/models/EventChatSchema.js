const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    EventID: {
      type: Schema.Types.ObjectId   //, ref: 'events'
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

let Chat = mongoose.model("eventchats", chatSchema);

module.exports = Chat;
