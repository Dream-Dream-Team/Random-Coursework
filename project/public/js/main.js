const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

// Getting the useranme and room
const username = document.getElementById('currentUsername').innerText || "Guest" + getRandomInt(1000000);
const room = document.getElementById('currentEventName').innerText;
const checkHostID = document.getElementById('EventHostID').innerText;

// Getting eventID
let url = window.location.href;
console.log(url);
const EventID = url.substr(url.lastIndexOf("/")+1);
console.log("The Current Event ID:" + EventID);

// Get username and room from URL
// const { username, room } = Qs.parse(location.search, {
//   ignoreQueryPrefix: true,
// });

console.log(username);
console.log("The Current User is:" + username)
console.log("The current room name is:" + room);

// const currentUser = username;
// const room = event.eventName;
// const EventID = event.eventID;

let eventHost = 0;
let fetchEventHost = async () => {
  let host = await fetch("/feedback/user/" + EventID)
  .then(data => {
    // console.log(" The data:" + data.json());
    return data.json();
  })
  .then(json => {
    if(json != null){
      console.log("Json");
      eventHost = json.hostID;
      console.log(eventHost);
    }
    return eventHost;
  })
};
fetchEventHost().then(data => console.log(data));




const socket = io();

// Join chatroom
socket.emit('joinRoom', { username, room });


// Get room and users
socket.on('roomUsers', ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

// Message from server
socket.on('message', (message) => {
  console.log(message);
  outputMessage(message);

  // Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// //Joined room
// socket.on('joined', (message) =>{
//   joinedRoom(message);
// }
// );

// function joinedRoom(message){

// }


// Message submit
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();

  // Get message text
  let msg = e.target.elements.msg.value;

  msg = msg.trim();

  if (!msg) {
    return false;
  }

  // Emit message to server
  socket.emit('chatMessage', {message: msg, currentEvent: EventID});

  // Clear input
  e.target.elements.msg.value = '';
  e.target.elements.msg.focus();
});

// Output message to DOM
function outputMessage(message) {
  const div = document.createElement('div');
  div.classList.add('message');
  const p = document.createElement('p');
  



  /* NEEDS TO CHANGE THIS */
  if(message.username.toLowerCase() == "chadbot"){
    console.log("RECEIVED BOT APPROVAL");
  }

  if(message.username == "ChadBot"){
    p.classList.add('meta'); 
    p.innerText = message.username;
    // p.innerHTML += ` <i class='fa fa-check-circle'> </i> `
    p.innerHTML += ` <i class="fas fa-robot"> </i> `
    div.style = "border: 4px solid rgba(232, 2, 14, 0.3);"
  } else {
    
      if(eventHost != null && checkHostID == eventHost){
        p.innerHTML += ` <i class="fas fa-check"> </i> `
        //div.style = "border: 4px solid;"
      }
      p.classList.add('meta');
      p.innerText = message.username;
  }
  /* CHANGE TO SPECIFIC HOST CASE */
  p.innerHTML += `<span> ${message.time}</span>`;
  div.appendChild(p);
  const para = document.createElement('p');
  para.classList.add('text');
  
  para.innerText = message.text;
  div.appendChild(para);
  document.querySelector('.chat-messages').appendChild(div);
}

// Add room name to DOM
function outputRoomName(room) {
  roomName.innerText = room;
}

// Add users to DOM
function outputUsers(users) {
  userList.innerHTML = '';
  users.forEach((user) => {
    const li = document.createElement('li');
    li.innerText = user.username;
    userList.appendChild(li);
  });
}

//Prompt the user before leave Event
document.getElementById('leave-btn').addEventListener('click', () => {
  const leaveRoom = confirm('Are you sure you want to leave the current Event?');
  if (leaveRoom) {
    window.location = '../index.html';
  } else {
  }
});

/* TEST - PLEASE REMOVE THIS*/
// const EventID = '6041543c6b03db4d68dbbcb7';
// fetching initial chat messages from the database
(() => {
  fetch("/feedback/chat/" + EventID)
    .then(data => {
      // console.log(" The data:" + data.json());
      return data.json();
    })
    .then(json => {
        json.Messages.forEach(message => {
          outputMessage(message);
        });
      console.log(json.Messages);
    });
})();

(() => {
  fetch("/feedback/sentiment/" + EventID)
    .then(data => {
      // console.log(" The data:" + data.json());
      return data.json();
    })
    .then(json => {
      console.log(json);
    });
})();