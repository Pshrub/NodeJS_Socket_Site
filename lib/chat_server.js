var socketio = require('socket.io');
var io;
var guestNumber=1;
var nickNames={};
var namesUsed=[];
var currentRoom={};

exports.listen = function(server) {
  // start the socket io server
  io = socketio.listen(server);
  io.set('log level', 1);

// helper functions
function assignGuestName(socket, guestNumber, nickNames, namesUsed) {
  // autogenerate new guest name
  var name = 'Guest' + guestNumber;
  // associate guest name with current connection socket id
  nickNames[socket.id] = name;
  // Let user know their guest name
  socket.emit('nameResult', {
    success: true,
    name: name
  });
  // add generated name to the list of names used
  namesUsed.push(name);
  // increment the guestNumber variable
  return guestNumber+1;
}

function joinRoom(socket, room) {
  socket.join(room);
  currentRoom[socket.id] = room;
  socket.emit('joinResult', {room: room });
  socket.broadcast.to(room).emit('message', {
    text: nickNames[socket.id] + ' has joined ' + room + '!'
  });

  var usersInRoom = io.sockets.clients(room);
  // if there are multiple users in the room, generate text
  // of a list of users in the room to eventually send out.
  if (usersInRoom.length > 1) {
    var usersInRoomSummary = 'Users currently in the room ' + room + ': ';
    for (var index in usersInRoom) {
      var userSocketId = usersInRoom[index].id;
      if (userSocketId != socket.id) {
        if (index >0) {
          usersInRoomSummary += ', ';
        }
        usersInRoomSummary += nickNames[userSocketId];
      }
      usersInRoomSummary += '.';
    }
    // send list of other users to the room to the user who joined
    socket.emit('message', {text: usersInRoomSummary});
  }
}

// how a chat message is sent to users in the room
function handleMessageBroadcasting(socket) {
  socket.on('message', function(message) {
    socket.broadcast.to(message.room).emit('message', {
      text: nickNames[socket.id] + ': ' + message.text
    });
  });
}

// allow user to join existing room.
// if room does not exist, create the new room.
function handleRoomJoining(socket) {
  socket.on('join', function(room) {
    socket.leave(currentRoom[socket.id]);
    joinRoom(socket, room.newRoom);
  });
}

// on disconnect action, clean up the user components from the chat system.
function handleClientDisconnection(socket) {
  socket.on('disconnect', function() {
    var nameIndex = namesUsed.indexOf(nickNames[socket.id]);
    delete nickNames[socket.id];
    delete namesUsed[nameIndex];
  });
}

// define how each user connection will be handled
  io.sockets.on('connection', function(socket) {
    // assign a guest name when they connect
    guestNumber = assignGuestName(socket, guestNumber, nickNames, namesUsed);
    // puts the user in the lobby when they connect
    joinRoom(socket, 'Lobby');

    handleMessageBroadcasting(socket, nickNames);
    //handleNameChangeAttempts(socket, nickNames, namesUsed);
    handleRoomJoining(socket);

    // generates a list of occupied rooms
    socket.on('rooms', function() {
      socket.emit('rooms', io.sockets.manager.rooms);
    });
    // cleanup for when the user disconnects fromthe chat application
    handleClientDisconnection(socket, nickNames, namesUsed);
  });
}
