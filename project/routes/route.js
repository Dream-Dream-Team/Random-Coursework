const express = require('express');
const router = express.Router();
const signUpTemplate = require('../models/SignUpSchema');
const eventTemplate = require('../models/EventSchema');
const ratingTemplate = require('../models/RatingSchema');
const session = require('express-session');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const crypto = require('crypto');
const ObjectID = require('mongodb').ObjectID

const connectdb = require("../dbconnect");

const moment = require('moment');

const multer = require('multer');

// Store the event icon
const storage = multer.diskStorage({
    destination: function(req,file,cb) {
        cb(null,'./public/uploads/images');
    },
    filename: function(req,file,cb) {
        cb(null, Date.now() + file.originalname);
    }
});

// Upload the event icon
const upload = multer({
    storage:storage,
    limits:{
        fieldSize: 1024 * 1024 * 3,
    },
});


router.use(session({
    secret: 'key',
    resave: true,
    saveUninitialized: true
}));

const eventSchema = {
    _id: Object,
    eventName: String,
    img: String,
    participants: Number,
    participantsList: Array,
    startDate: Date,
    endDate: Date,
    public: Boolean,
    hostID: String,
    eventToken: String,
    analytics: Boolean,
    generalMood: Boolean,
    generalMoodOverTime: Boolean,
    requests: Boolean
}
const Event = mongoose.model('Event', eventSchema);

router.get('/', (request, response) => {
    if(request.session.cust_log == "true") {
        Event.find({hostID: request.session.user._id}, function(err, events) {
            Event.find({participantsList: {$in: [request.session.user.username]}}, function(err, joinedEvent) {
                    response.render('event', {
                        username: request.session.user.username,
                        eventsList: events,
                        joinedEvents: joinedEvent,
                        moment: moment
                    })
            })
        })
    }else {
        response.render('index');
    }
});

router.get('/register', (request, response) => {
    response.render('register');
});

router.get('/login', (request, response) => {
    response.render('login');
});

router.post('/logout', (request, response) => {
    if(request.session) {
        request.session.destroy();
        response.render('index');
    }  
})


/* Chat Ends here */

router.get('/createEvent', (request, response) => {

    Event.find({hostID: request.session.user._id}, function(err, events) {
        Event.find({participantsList: {$in: [request.session.user.username]}}, function(err, joinedEvent) {
            response.render('createEvent', {
                username: request.session.user.username,
                eventsList: events,
                joinedEvents: joinedEvent,
                moment: moment
            })
        }).sort({active: -1})
    }) 
});

router.post('/register', async (request, response) => {
    const usernameExists = await signUpTemplate.findOne({
        username: request.body.username
    });
    if(usernameExists) return response.status(400).send('This account username exists.');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(request.body.password, salt);

    const signUpUser = new signUpTemplate({
        email: request.body.email,
        username: request.body.username,
        password: hashedPassword
    });

    request.session.cust_log = "true";
    request.session.user = signUpUser;

    signUpUser.save().then(date => {
        Event.find({hostID: request.session.user._id}, function(err, events) {
            Event.find({participantsList: {$in: [request.session.user.username]}}, function(err, joinedEvent) {
                response.render('event', {
                    username: request.session.user.username,
                    eventsList: events,
                    joinedEvents: joinedEvent,
                    moment: moment
                })
            }).sort({active: -1})
        })   
    }).catch(error => {
        response.json(error)
    });    
});

router.post('/login', async (request, response) => {
    const user = await signUpTemplate.findOne({username: request.body.username});
    if(!user) return response.status(400).send('Username incorrect');

    const hashPassword = await bcrypt.compare(request.body.password, user.password);
    if(!hashPassword) return response.status(400).send('Invalid password');

    request.session.cust_log = "true";
    request.session.user = user;
    // response.locals.user = request.session.user;
    console.log(request.session.user._id);
    // response.render('event', {username: request.session.user.username});

    Event.find({hostID: request.session.user._id}, function(err, events) {
        Event.find({participantsList: {$in: [request.session.user.username]}}, function(err, joinedEvent) {
            response.render('event', {
                username: request.session.user.username,
                eventsList: events,
                joinedEvents: joinedEvent,
                moment: moment
            })
        }).sort({active: -1})
    })
});

router.post('/guestLogin', async(request, response) => {
    
});

router.post('/addEvent', upload.single('image'), async (request, response) => {
    const token = crypto.randomBytes(3).toString('hex'); // Generating the event token
    console.log(token);

    const checkEventExists = await eventTemplate.findOne({
        hostID: request.session.user._id,
        eventName: request.body.eventName
    });
    if(checkEventExists) return response.status(400).send('This event name already exists!');

    const checkUniqueToken = await eventTemplate.findOne({
        eventToken: request.body.createToken
    })
    if(checkUniqueToken) return response.status(400).send('This event token already exists!');

    const event = new eventTemplate({
        hostID: request.session.user._id,
        img: request.file.filename,
        eventToken: token,
        eventName: request.body.eventName,
        participants: request.body.participants,
        public: request.body.public,
        startDate: request.body.startDate,
        endDate: request.body.endDate,
        analytics: request.body.analytics,
        generalMood: request.body.generalMood,
        generalMoodOverTime: request.body.generalMoodOverTime,
        requests: request.body.requests,
        eventToken: request.body.createToken
    });

    // Event is public - no need to create a unique access token for attendees
    if(request.body.public == 'true') {
        event.eventToken = ' ';
    }else {
        if(request.body.createToken == "") {
            event.eventToken = token;
        }
    }

    event.save().then(date => {
        const eventName2 = request.body.eventName;
        Event.find({$and: [{eventName: eventName2}, {hostID: request.session.user._id}]}, function(err, events) {
            Event.find({participantsList: {$in: [request.session.user.username]}}, function(err, joinedEvent) {
                response.render('createdEvent', {
                    username: request.session.user.username,
                    eventDetails: events,
                    joinedEvents: joinedEvent,
                    moment: moment
                })
            }).sort({active: -1})
        })
    }).catch(error => {
        response.json(error)
    });
});

/* 
1) Check if token entered corresponds to existing event
2) Check if user hasn't entered this token before in the past
3) Check if the max participant count has not been exceeded
4) Check if a HOST has tried to enter their own token.
5) After passing these checks, only then you can add them to join the event.
*/
router.post('/joinEvent', async (request, response) => {
    // check if this event with their entered token exists
    const checkExists = await eventTemplate.findOne({eventToken: request.body.eventToken});
    if(!checkExists) return response.status(400).send('Event does not exist');

    // check if user hasn't tried to use this token before
    const usedEvent = await eventTemplate.findOne({$and: [{eventToken: request.body.eventToken},
        {participantsList: request.session.user.username}]});
    if(usedEvent) return response.status(400).send('You have already joined this event!');

    // check if participant count is not exceeded
    const event = await eventTemplate.findOne({eventToken: request.body.eventToken});
    var numParticipants = event.participantsList.length;
    var maxParticipants = event.participants;
    
    if(numParticipants + 1 > maxParticipants) return response.status(400).send('Maximum capacity to this event has reached');

    // check if token entered corresponds to this exact user's own event
    const hostEntered = await eventTemplate.findOne({$and: [{eventToken: request.body.eventToken}, 
        {hostID: request.session.user._id}]});
        if(hostEntered) return response.status(400).send('You are the host to this event!');

    // // append a user's username to the list of participants of the existing event
    eventTemplate.findOneAndUpdate({eventToken: request.body.eventToken}, 
        {$push : { participantsList: request.session.user.username}}, {new: true}, function(err, doc) {
            if(err) throw err;

            Event.find({hostID: request.session.user._id}, function(err, events) {
                Event.find({participantsList: {$in: [request.session.user.username]}}, function(err, joinedEvent) {
                    response.render('event', {
                        username: request.session.user.username,
                        eventsList: events,
                        joinedEvents: joinedEvent,
                        moment: moment
                    })
                }).sort({active: -1})
            })
        });
})

router.post('/modifyEvent', (request, response) => {
    const id = request.body.event_id; // contains the event ID of event to be deleted
    console.log(id);

    const deleteButton = request.body.delete;
    if(deleteButton == "Delete") { // Button clicked corresponds to deleting the event
        eventTemplate.findOneAndDelete({_id: id}, function(err, doc) {
        if(err) throw err;

            Event.find({hostID: request.session.user._id}, function(err, events) {
                Event.find({participantsList: {$in: [request.session.user.username]}}, function(err, joinedEvent) {
                    response.render('event', {
                        username: request.session.user.username,
                        eventsList: events,
                        joinedEvents: joinedEvent
                    })
                }).sort({active: -1})
            })
        })
    }

    const startButton = request.body.start;
    if(startButton == "Begin") { // Button clicked corresponds to deleting the event
        eventTemplate.findOneAndUpdate({_id: id}, {$set : {active: true}}, {new: true}, function(err, doc) {
            if(err) throw err;

            Event.find({hostID: request.session.user._id}, function(err, events) {
                Event.find({participantsList: {$in: [request.session.user.username]}}, function(err, joinedEvent) {
                    response.render('event', {
                        username: request.session.user.username,
                        eventsList: events,
                        joinedEvents: joinedEvent
                    })
                }).sort({active: -1})
            })
        })
    } 
});

router.get('/', (request, response) => {
    Event.find({hostID: request.session.user._id}, function(err, events) {
        Event.find({participantsList: {$in: [request.session.user.username]}}, function(err, joinedEvent) {
            response.render('event', {
                username: request.session.user.username,
                eventsList: events,
                joinedEvents: joinedEvent
            })
        })
    })
})

router.get('/guestEvents', (request, response) => {
    Event.find({public: true}, function(err, publicEvents) {
        response.render('guest', {
            publicEventsList: publicEvents,
            moment: moment
        })
    })
})

router.get('/home', (request, response) => {
    Event.find({hostID: request.session.user._id}, function(err, events) {
        Event.find({participantsList: {$in: [request.session.user.username]}}, function(err, joinedEvent) {
            response.render('event', {
                username: request.session.user.username,
                eventsList: events,
                joinedEvents: joinedEvent,
                moment: moment
            })
        }).sort({active: -1})
    })
})

router.post('/feedback/:event_id', async (request, response) => {
    const eventID = request.body.event_id;
    console.log(eventID);

    var objectID = new ObjectID(eventID);

    Event.find({_id: objectID}, function(err, events) {
        Event.find({participantsList: {$in: [request.session.user.username]}}, function(err, joinedEvent) {
            if(err) throw err;
            response.render('attendeeEventHomepage', {
                username: request.session.user.username,
                feedbackEvent: events,
                joinedEvents: joinedEvent,
                moment: moment
            });

        })
    }) 
})

router.post('/guestFeedback', async (request, response) => {
    const eventID = request.body.eventID;

    var objectID = new ObjectID(eventID);

    // append a user's username to the list of participants of the existing event
    eventTemplate.findOneAndUpdate({_id: objectID}, 
        {$push : { participantsList: request.body.guestUsername}}, {new: true}, function(err, doc) {
            if(err) throw err;
            
            response.render('guestAttendeeView', {
                username: request.body.guestUsername,
                eventID: eventID,
                event: doc,
                moment: moment
            });
    });
})
  

// router.post('/guestFeedback', async (request, response) => {
//     const guestEventName = request.body.guestEventName;
//     console.log(request.body.guestToken);
//     console.log(guestEventName);
//     console.log(request.body.guestUsername);
    
//     if(request.body.guestToken == "" && request.body.guestEventName == "") {
//         return response.status(400).send('You must enter a field for one of token/event name!');
//     }

//     if(request.body.guestToken) {
//         const checkExists = await eventTemplate.findOne({eventToken: request.body.guestToken});
//         if(!checkExists) return response.status(400).send('Event does not exist token');

//         // check if participant count is not exceeded
//         const event = await eventTemplate.findOne({eventToken: request.body.eventToken});
//         var numParticipants = event.participantsList.length;
//         var maxParticipants = event.participants;
        
//         if(numParticipants + 1 > maxParticipants) return response.status(400).send('Maximum capacity to this event has reached');

//         // // append a user's username to the list of participants of the existing event
//         eventTemplate.findOneAndUpdate({eventToken: request.body.guestToken}, 
//             {$push : { participantsList: request.body.guestUsername}}, {new: true}, function(err, doc) {
//                 if(err) throw err;

//                 Event.find({eventName: guestEventName}, function(err, events) {
//                     if(err) throw err;
//                     response.render('guestAttendeeView', {
//                         username: request.body.guestUsername,
//                         feedbackEvent: events,
//                         moment: moment
//                     });
//                 }) 

//                 // Event.find({_id: objectID}, function(err, events) {
//                 //     Event.find({participantsList: {$in: [request.session.user.username]}}, function(err, joinedEvent) {
//                 //         if(err) throw err;
//                 //         response.render('attendeeEventHomepage', {
//                 //             username: request.session.user.username,
//                 //             feedbackEvent: events,
//                 //             joinedEvents: joinedEvent,
//                 //             moment: moment
//                 //         });
            
//                 //     })
//                 // }) 
//         });
//     }else if(request.body.guestEventName){
//         const checkExists = await eventTemplate.findOne({eventName: request.body.guestEventName});
//         if(!checkExists) return response.status(400).send('Event does not exist');

//         // check if participant count is not exceeded
//         const event = await eventTemplate.findOne({$and : [{eventName: request.body.guestEventName}, {public: true}]});
//         var numParticipants = event.participantsList.length;
//         var maxParticipants = event.participants;
        
//         if(numParticipants + 1 > maxParticipants) return response.status(400).send('Maximum capacity to this event has reached');

//         const checkStart = await eventTemplate.findOne({eventName: request.body.guestEventName});
//         console.log(moment());
//         console.log(moment(checkStart.startDate));
//         if(moment() < moment(checkStart.startDate)) {
//             return response.status(400).send('Event has not begun yet!');
//         }

//         // // append a user's username to the list of participants of the existing event
//         eventTemplate.findOneAndUpdate({$and : [{eventName: request.body.guestEventName}, {public: true}]}, 
//             {$push : { participantsList: request.body.guestUsername}}, {new: true}, function(err, doc) {
//                 if(err) throw err;

//                 Event.find({eventName: request.body.guestEventName}, function(err, events) {
//                     if(err) throw err;
//                     response.render('guestAttendeeView', {
//                         username: request.body.guestUsername,
//                         event: doc,
//                         moment: moment
//                     });
//                 }) 
//         });
//     }
// })

router.post('/viewEvent/:event_id', (request, response) => {
    const eventID = request.body.event_id;
    console.log(eventID);
    var objectID = new ObjectID(eventID);
    Event.find({$and: [{_id: objectID}, {hostID: request.session.user._id}]}, function(err, events) {
        Event.find({participantsList: {$in: [request.session.user.username]}}, function(err, joinedEvent) {
            response.render('createdEvent', {
                username: request.session.user.username,
                eventDetails: events,
                joinedEvents: joinedEvent,
                moment: moment,
                guest: false
            })
        })
    })
});

router.post('/viewHostEvent/:event_id', (request, response) => {
    const eventID = request.body.event_id;
    var objectID = new ObjectID(eventID);
    
    Event.find({$and: [{_id: objectID}, {hostID: request.session.user._id}]}, function(err, events) {
        Event.find({participantsList: {$in: [request.session.user.username]}}, function(err, joinedEvent) {
            response.render('hostEventHomepage', {
                username: request.session.user.username,
                feedbackEvent: events,
                joinedEvents: joinedEvent,
                moment: moment,
                guest: false
            })
        })
    })
});

router.post('/ratings/:event_id', async (request, response) => {
    const eventID = mongoose.Types.ObjectId(request.body.event_id);
    console.log(eventID);
    console.log(request.body.rate);
    const username = request.session.user.username;

    if(request.body.anonymous) {
        username = "Anonymous"
    }

    ratingTemplate.findOne({'EventID': eventID}, (err, res) => {
        if(res) {
            let rating = {username: username , rating: request.body.rate, time: moment().format('h:mm a')};
            let newAverage = (Number(res.TotalRating) + Number(request.body.rate)) / (res.Rating.length + 1)

            ratingTemplate.findOneAndUpdate(
                {'EventID' : eventID} ,
                {
                $set: {
                    AmountOfRatings: res.Rating.length + 1,
                    TotalRating: Number(res.TotalRating) + Number(request.body.rate),
                    AverageRating: newAverage
                },
                $push: { 
                    Rating: rating,
                }
                }, {new: true}, (err, res) => {
                // console.log(" Result: " + res);
                }
            );
            console.log(rating);
        }else {
            console.log("SUP BITCHES WOAH")
            let rating = {username: request.session.user.username , rating: request.body.rate, time: moment().format('h:mm a')};
            let newRating = new ratingTemplate();
            newRating.EventID = mongoose.Types.ObjectId(request.body.event_id);
            newRating.Rating.push(rating);
            
            newRating.AmountOfRatings = 1,
            newRating.TotalRating = request.body.rate,
            newRating.AverageRating = request.body.rate,
            newRating.save();
        }

        Event.find({_id: eventID}, function(err, events) {
            Event.find({participantsList: {$in: [request.session.user.username]}}, function(err, joinedEvent) {
                if(err) throw err;
                response.render('attendeeEventHomepage', {
                    username: request.session.user.username,
                    feedbackEvent: events,
                    joinedEvents: joinedEvent,
                    moment: moment
                });
    
            })
        }) 
    })
})

// Chat STUFF ::::::::::::::::::::::::::::::::::::
const Chats = require("../models/EventChatSchema");
    
router.get('/feedback/chat/:id' ,(req, res, next) => {
  res.setHeader("Content-Type", "application/json");
  res.statusCode = 200;

  connectdb.then(db => {
    console.log("The ID: " + req.params.id);
    let data = Chats.findOne({ EventID: mongoose.Types.ObjectId(req.params.id) },
    (error, result) => {
        console.log(result);
        res.json(result);
    })
    // Chats.find({}).then(chat => {
    //   res.json(chat);
    // });
  });
});

router.get('/feedback/user/:id' ,(req, res, next) => {
    res.setHeader("Content-Type", "application/json");
    res.statusCode = 200;
  
    connectdb.then(db => {
    //   console.log("The ID: " + req.params.id);
      let data = eventTemplate.findOne({ EventID: mongoose.Types.ObjectId(req.params.id) },
      (error, result) => {
          console.log(result);
          res.json(result);
      })
    });
  });

router.get('/chat/' ,(req, res, next) => {
    console.log('LOFLAOSL');
});

// router.get('/feedback/sentiment/:id' ,(req, res, next) => {
//     res.setHeader("Content-Type", "application/json");
//     res.statusCode = 200;
  
//     connectdb.then(db => {
//     //   console.log("The ID: " + req.params.id);
//       let data = Chats.findOne({ EventID: mongoose.Types.ObjectId(req.params.id) },
//       (error, result) => {
//           res.json(result.SentimentOverTime);
//       })
//     });
//   });

router.get('/chat/' ,(req, res, next) => {
    console.log('LOFLAOSL');
});

module.exports = router;
