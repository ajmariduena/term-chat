var Url = require('url');
var chalk = require('chalk');
var socketClient = require('socket.io-client');
var fs = require('fs');

// console.log wrapper
var print = console.log;

// Socket Object
var _socket;

// Channel to send and listen events on
var _channel;

// User name to send with messages
var _user;

// Start client by connecting to socket and subscribing to channel events
function startClient(config) {
  //  Format the server URL
  var url = Url.parse(config.host);
  url.host = null;
  url.protocol = 'http';
  url.port = config.port;

  // Create socket with formatted URL
  _socket = socketClient(url.format(), {
    reconnection: true,
    reconnectionDelay: 2500,
    reconnectionDelayMax : 5000,
    reconnectionAttempts: 5
  });

  // Set internal state
  _channel = config.channel;
  _user = config.user;

  // Connect and return with callback
  _socket.on('connect', function () {
    _socket.emit('user_connect', {
      channel: _channel,
      user: _user,
      historyCount: 1,
    });
  });

  // Subscribe to server messages
  _socket.on('server_info', function (data) {

    // Print all historic messages
    data.history.forEach(printMessage);
  
    process.exit(0);
  });

  // Display errors
  _socket.on('connect_error', function (data) {
    print(chalk.red('Connecting ' + data));
  });

  _socket.on('reconnecting', function () {
    print(chalk.yellow('Attempting to reconnect..'));
  });

  // After reconnect attempts
  _socket.on('reconnect_failed', function () {
    print(chalk.bold.red('Could not connect to server'));
    process.exit();
  });
}

/**
 * Prints a message from a message object
 * @param  {object} data  {user, message, channel}
 */
function printMessage (data) {
  print(data.message);
}

module.exports = {
  startClient: startClient
};
