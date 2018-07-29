const net = require('net');
const events = require('events');
const SOCKET_PATH = "/var/run/pi-buttons.sock";
const RECONNECT_TIMEOUT = 3000;

module.exports = function (config) {
  config = config || {};
  config.socketPath = config.socketPath || SOCKET_PATH;
  config.reconnectTimeout = config.reconnectTimeout || RECONNECT_TIMEOUT;
  let emitter = new events.EventEmitter();
  emitter.piButtonsSocket = null;

  // expose function to destroy underlying socket
  emitter.destroySocket = function () {
    emitter.piButtonsSocket.destroy();
  }

  // create client connected to pi-buttons socket path
  function createClient() {
    emitter.piButtonsSocket = net.createConnection(config.socketPath, function () {
      // on first connect establish client listening events
      clientListener(emitter.piButtonsSocket);
    });
  }

  // create listeners on client socket connection
  function clientListener(piButtonsSocket) {
    piButtonsSocket
    .on('end', function () {
      // lost connection, try to reconnect after a delay
      setTimeout(createClient, config.reconnectTimeout);
    })
    .on('data', function (data) {
      // may be more than one message packet
      let packets = data.toString().split(/\r?\n/);
      packets.forEach(function (packet) { parsePacket(packet); });
    })
  }

  // parse a packet received from the pi-buttons socket
  function parsePacket(packet) {
    // split packet into event and JSON
    let parts = /^([^{]+)\s({.*})/.exec(packet);
    if (parts) {
      try {
        var d = JSON.parse(parts[2]);
        switch(parts[1]) {
          case 'error':
          emitter.emit(parts[1], d);
          break;

          default:
          // emit event with event type, gpio number, event JSON data
          emitter.emit(parts[1], d.gpio, d);
          break;
        }
      }
      catch (e) {}
    }
  }

  // init by creating the first client connection
  createClient()
  return emitter;
}
