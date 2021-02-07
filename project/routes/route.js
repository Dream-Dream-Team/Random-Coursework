const express = require('express');
const router = express.Router();
const signUpTemplate = require('../models/SignUpSchema');
const eventTemplate = require('../models/EventSchema');
const session = require('express-session');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const crypto = require('crypto');

router.use(session({
    secret: 'key',
    resave: true,
    saveUninitialized: true
}));

router.get('/', (request, response) => {
    if(request.session.cust_log == "true") {
        response.render('event', {username: request.session.user.username});
    }else {
        response.render('index');
    }
});

router.get('/register', (request, response) => {
    response.render('home');
})

router.post('/register', async (request, response) => {
    const usernameExists = await signUpTemplate.findOne({
        username: request.body.username
    });
    if(usernameExists) return response.status(400).send('This account username exists.');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(request.body.password, salt);

    const signUpUser = new signUpTemplate({
        fullName: request.body.fullName,
        username: request.body.username,
        password: hashedPassword
    });

    signUpUser.save().then(date => {
        response.json(data)
        response.render('home');
        console.log('Account created');
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
    console.log(request.session.user._id);
    response.render('event', {username: request.session.user.username});
});

router.post('/addEvent', async (request, response) => {
    const token = crypto.randomBytes(3).toString('hex'); // Generating the event token

    const checkEventExists = await eventTemplate.findOne({
        hostID: request.session.user._id,
        eventName: request.body.eventName
    });
    if(checkEventExists) return response.status(400).send('This event name already exists!');


    const event = new eventTemplate({
        hostID: request.session.user._id,
        eventToken: token,
        eventName: request.body.eventName,
        participants: request.body.participants,
        public: request.body.public,
        startDate: request.body.startDate,
        endDate: request.body.endDate,
        analytics: request.body.analytics,
        generalMood: request.body.generalMood,
        generalMoodOverTime: request.body.generalMoodOverTime,
        requests: request.body.requests
    });

    // Event is public - no need to create a unique access token for attendees
    if(request.body.public == 'true') {
        event.eventToken = '';
    }

    event.save().then(date => {
        response.json(data)
    }).catch(error => {
        response.json(error)
    });
});

/* 
1) Check if token entered corresponds to existing event
2) Check if user hasn't entered this token before in the past
3) Check if the max participant count has not been exceeded
4) After passing these checks, only then you can add them to join the event.
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
    // const event = await eventTemplate.findOne({eventsToken: request.body.eventToken});
    // const numberJoined = await eventTemplate.aggregate([{eventToken: event}], 
    //     {$project:{number:{$size: "$participantsList"}}}).pretty();

    // console.log(numberJoined);
    // const maxParticipants = event.participants;

    // // append a user's username to the list of participants of the existing event
    eventTemplate.findOneAndUpdate({eventToken: request.body.eventToken}, 
        {$push : { participantsList: request.session.user.username}}, {new: true}, function(err, doc) {
            if(err) throw err;

            response.status(200).send('You have joined an event');
        });
})

const eventSchema = {
    eventName: String,
    participants: Number,
    startDate: Date,
    endDate: Date
}
const Event = mongoose.model('Event', eventSchema);

router.get('/hostEvents', (request, response) => { // For processing in ejs file
    Event.find({hostID: request.session.user._id}, function(err, events) {
        Event.find({$and: [{public: true}, {hostID: {$ne: request.session.user._uid}}]}, function(err, publicEvents) {
            response.render('hostEvents', {
                eventsList: events,
                publicEventsList: publicEvents
            })
        })
    })
});

module.exports = router;