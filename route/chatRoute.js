const express = require("express");
const bodyParser = require("body-parser");
const connectdb = require("./../dbconnect");
const mongoose = require("mongoose");
const Chats = require("../models/EventChatSchema");

const router = express.Router();

router.get('/chat/:id' ,(req, res, next) => {
  res.setHeader("Content-Type", "application/json");
  res.statusCode = 200;

  connectdb.then(db => {
    let data = Chats.find({ EventID: mongoose.Types.ObjectId(req.params.id) },
    (error, result) =>
        res.json(result) );
    // Chats.find({}).then(chat => {
    //   res.json(chat);
    // });
  });
});

router.get('/chat/' ,(req, res, next) => {
    console.log('LOFLAOSL');
});


module.exports = router;