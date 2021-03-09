const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

const routes = require('./routes/route');

// // Database
// dotenv.config()

let connectdb = require("./dbconnect");
console.log(connectdb);

// mongoose.connect(process.env.DB_CONNECT, {
//     useUnifiedTopology: true,
//     useNewUrlParser: true
// }, () => 
//     console.log('Database is running ...')
// );

// Views
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({extended: false}));
// app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Middleware
app.use(express.static('public'));
app.use('/', routes);


console.log("THE CONNECT VAR1 :" + connectdb);

// Chat Stuff ::: :::::::::: :::::::::::: : :::::::::::::: 
const http = require('http');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers
} = require('./utils/users');
const moment = require('moment');

const Analyzer = require('natural').SentimentAnalyzer;
const stemmer = require('natural').PorterStemmer;
var natural = require('natural');
let tokenizer = new natural.WordTokenizer();
let analyzer = new Analyzer("English", stemmer, "afinn");


const server = http.createServer(app);
const io = socketio(server);

//database connection
const Chat = require("./models/EventChatSchema");

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
  socket.on('chatMessage', (msg, eventID) => {
    const user = getCurrentUser(socket.id);
    console.log("The Room" + user.room);

    io.to(user.room).emit('message', formatMessage(user.username, msg));
    console.log("THE CONNECT VAR:" + connectdb);
    //////////////save chat to the database
    connectdb.then(db => {
      console.log("Connected to the Database.");
    
    
      /* TEST - PLEASE REMOVE THIS*/
      console.log(request);
      // const eventID = '6041543c6b03db4d68dbbcb7';
      
      const search = mongoose.Types.ObjectId(eventID);
      console.log(search)
      
      
      Chat.findOne({'EventID' : search}, (err, res) => {
        if(res){
          
          let sentence = tokenizer.tokenize(msg);
          let score = analyzer.getSentiment(sentence);
          console.log(score);

          let chatMessage = { username: user.username , text: (msg), time: moment().format('h:mm a') , sentiment: score}

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
          let sentence = tokenizer.tokenize(msg);
          let score = analyzer.getSentiment(sentence);
          console.log(score);

          let chatMessage = { username: user.username , text: (msg), time: moment().format('h:mm a') , sentiment: score};
          let newEventChat = new Chat();
          newEventChat.EventID = mongoose.Types.ObjectId(eventID);
          newEventChat.Messages.push(chatMessage);



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

