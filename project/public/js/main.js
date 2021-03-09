const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

// Getting the useranme and room
const username = document.getElementById('currentUsername').innerText || "Guest" + getRandomInt(1000000);
const room = document.getElementById('currentEventName').innerText;

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
console.log("The Current User is:" + username);
console.log("The current room name is:" + room);

// const currentUser = username;
// const room = event.eventName;
// const EventID = event.eventID;





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
  if(message.username === "Admin"){
    p.classList.add('bold-text'); 
    p.innerText = message.username;
    p.innerHTML += ` <i class='fa fa-check-circle'> </i> `
  } else {
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
        // let li = document.createElement("li");
        // let span = document.createElement("span");
        // messages.appendChild(li).append(data.message);
        // messages
        //   .appendChild(span)
        //   .append("by " + data.sender + ": " + formatTimeAgo(data.createdAt));
        // console.log(data);
        // data.Messages.forEach(message => {
        //   console.log(message);
        //   outputMessage(message);
        // })
      
      console.log('hey');
      console.log(json.Messages);
    });
})();