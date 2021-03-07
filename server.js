const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers
} = require('./utils/users');
const moment = require('moment');
const mongoose = require("mongoose");

const Analyzer = require('natural').SentimentAnalyzer;
const stemmer = require('natural').PorterStemmer;
var natural = require('natural');
let tokenizer = new natural.WordTokenizer();
let analyzer = new Analyzer("English", stemmer, "afinn");

const routes = require('./route/chatRoute');




const app = express();
const server = http.createServer(app);
const io = socketio(server);

//database connection
const Chat = require("./models/EventChatSchema");
const connect = require("./dbconnect");

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));


app.use('/', routes);


const botName = 'ChadBot ';

// Run when client connects
io.on('connection', socket => {
  socket.on('joinRoom', ({ username, room }) => {
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    // Welcome current user
    socket.emit('message', formatMessage(botName, `Hi ${user.username}! Welcome to the chat Room.`));
    // socket.emit('joined', 'Welcome to the chat Room.');

    // Broadcast when a user connects
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        formatMessage(botName, `${user.username} has joined the chat`)
      );

    // Send users and room info
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room)
    });
  });

  // Listen for chatMessage
  socket.on('chatMessage', msg => {
    const user = getCurrentUser(socket.id);

    io.to(user.room).emit('message', formatMessage(user.username, msg));

    //////////////save chat to the database
    connect.then(db => {
      console.log("Connected to the Database.");
    
    
      /* TEST - PLEASE REMOVE THIS*/
      const eventID = '4edd40c86762e0fb12000003';
      let chatMessage = { username: 'PitchForkSam' , text: (msg), time: moment().format('h:mm a') , sentiment: 0}
      

      const search = mongoose.Types.ObjectId(eventID);
      console.log(search)


      Chat.findOne({'EventID' : search}, (err, res) => {
        if(res){

          let sentence = tokenizer.tokenize(msg);
          let score = analyzer.getSentiment(sentence);
          console.log(score);

          let result = Chat.findOneAndUpdate(
            {'EventID' : search} ,
             {
               $set: {
                 AmountOfMessages: res.Messages.length + 1,
                 TotalSentiment: res.TotalSentiment + score
               },
               $push: { 
                 Messages: chatMessage,
                 SentimentOverTime: {sentiment: score , time: moment().format('YYYY-MM-DD h:mm:ss a')}
               }
             }, (err, res) => {
               // console.log(" Result: " + res);
             }
          );
        } else {
          let newEventChat = new Chat();
          newEventChat.EventID = mongoose.Types.ObjectId(eventID);
          newEventChat.Messages.push(chatMessage);

          let sentence = tokenizer.tokenize(msg);
          let score = analyzer.getSentiment(sentence);
          console.log(score);


          let msgSentimentObj = {sentiment: score , time: moment().format('YYYY-MM-DD h:mm:ss a')};
          
          newEventChat.SentimentOverTime.push(msgSentimentObj);
          newEventChat.TotalSentiment = score;
          newEventChat.AmountOfMessages = 1;
          newEventChat.save();
        }
        
      });
    });

    //////////////////
  });

  // Runs when client disconnects
  socket.on('disconnect', () => {
    const user = userLeave(socket.id);

    if (user) {
      // Outputs that the user has disconnected
      io.to(user.room).emit(
        'message',
        formatMessage(botName, `${user.username} has left the chat`)
      );

      // Send users and room info
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
      });
    }
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
