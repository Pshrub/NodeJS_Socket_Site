// displays text from the user (untrusted),
// so need to sanitize to avoid an XSS attack, cross site scripting
function divEscapedContentElement(message) {
  return $('<div></div>').text(message);
}

// displays text from the system (trusted)
function divSystemContentElement(message) {
  return $('<div></div>').html('<i>' + message + '</i>');
}

// process user input. If the user input starts with a / then it is
// considered a command. If not, then it is considered text, and should
// be posted to the chat room
function processUserInput(chatApp, socket) {
  var message = $('#send-message').val();
  var systemMessage;

  if (message.charAt(0) == '/' ) {
    systemMessage = chatApp.processCommand(message);
    if (systemMessage) {
      $('#messages').append(divSystemContentElement(systemMessage));
    }
  } else {
    chatApp.sendMessage($('#room').text(), message)
    $('#messages').append(divEscapedContentElement(message));
    $('#messages').scrollTop($('#messages').prop('scrollHeight') );
  }
  $('#send-message').val('');
}

// main function to handle client-side initiation of socketio event handling
var socket = io.connect();

$(document).ready(function() {
  var chatApp = new Chat(socket);

// display results of new name based on name change
/*  socket.on('nameResult', function(result) {
    var message;

    if (result.success) {
      message = 'You are now known as ' + result.name + '.';
    } else {
      message = result.message;
    }
    $('#messages').append(divSystemContentElement(systemMessage));
  });
*/

// display results of a room change
  socket.on('joinResult', function(result) {
    $('#room').text(result.room);
    $('#messages').append(divSystemContentElement('Room changed.'));
  });

// display received messages in a room
  socket.on('message', function(message) {
    var newElement = $('<div></div>').text(message.text);
    $('#messages').append(newElement);
  });

// display the list of available rooms
  socket.on('rooms', function(rooms) {
    $('#room-list').empty();

    for (var room in rooms) {
      room = room.substring(1, room.length);
      if (room != '') {
        $('#room-list').append(divEscapedContentElement(room));
      }
    }

// change into the room selected via a click on that room's name
    $('#room-list div').click(function() {
      chatApp.processCommand('/join ' + $(this).text());
      $('#send-message').focus();
    });
  });

// periodically request list of available rooms
  setInterval(function() {
    socket.emit('rooms');
  }, 1000);

  $('#send-message').focus();

  $('#send-form').submit(function() {
    processUserInput(chatApp, socket);
    return false;
  });

});
