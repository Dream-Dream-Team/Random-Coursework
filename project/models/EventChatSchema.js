const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const chatSchema = new Schema(
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

let Chat = mongoose.model("eventchat", chatSchema);

module.exports = Chat;
