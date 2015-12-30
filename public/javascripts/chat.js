// create the chat class with a socket.IO argument.
var Chat = function(socket) {
  this.socket = socket;
}

// send chat messages with two components to the message: room and text
Chat.prototype.sendMessage = function(room, text) {
  var message = {
    room: room,
    text: text
  };
  this.socket.emit('message', message);
};

Chat.prototype.changeRoom = function(room) {
  this.socket.emit('join', {
    newRoom: room
  });
};

Chat.prototype.processCommand = function(command) {
  var words = command.split(' ');
  var command = words[0].substring(1, words[0].length).toLowerCase();
  var message = false;

  switch(command) {
    // when the command is to join, do the following (create/change rooms)
    case 'join':
      words.shift();
      var room = words.join(' ');
      this.changeRoom(room);
      break;
    // return error message if the command is not recognized
    default:
      message = 'Unrecognized command!!!';
      break;
  }
  return message;
};
