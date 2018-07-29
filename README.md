# node-pi-buttons
A node module that listens to the [pi-buttons](https://github.com/bnielsen1965/pi-buttons.git)
event service and emits events for use in a node application.

> NOTE: You must have the pi-buttons service installed and running before you can
use the node-pi-buttons module!

The pi-buttons project is a low level service written in C that emits button
events on a Unix socket for GPIO pins with button hardware. The node-pi-buttons
module provides a ready made nodejs interface to the pi-buttons service.

The node-pi-buttons module and pi-buttons service are a drop in replacement for
the [rpi-gpio-buttons](https://github.com/bnielsen1965/rpi-gpio-buttons) module.
In applications where the CPU resources are limited, I.E. the Raspberry Pi Zero,
the node-pi-buttons + pi-buttons solution will provide a more efficient and responsive
user interface when compared to the pure Javascript rpi-gpio-buttons module.

## links
- https://github.com/bnielsen1965/pi-buttons.git
- https://github.com/bnielsen1965/rpi-gpio-buttons.git


# installation
```shell
npm install --save node-pi-buttons
```


## requirements
[pi-buttons](https://github.com/bnielsen1965/pi-buttons.git):
The pi-buttons service must be installed and configured on the target hardware.


# configuration
When creating an instance of the node-pi-buttons module you can pass the following
parameters:

- socketPath: The path to the Unix socket. (default: /var/run/pi-buttons.sock)
- reconnectTimeout: The number of milliseconds to wait before attempting a
reconnect if the Unix socket connection is lost.


# example
An example implementation is included in the example directory.

```javascript
const npb = require('node-pi-buttons');

// create with default config
let myNPB = npb();
myNPB
.on('pressed', function (gpio, data) {
  console.log('PRESSED', gpio, JSON.stringify(data, null, 2));
})
.on('released', function (gpio, data) {
  console.log('RELEASED', gpio, JSON.stringify(data, null, 2));
})
.on('clicked', function (gpio, data) {
  console.log('CLICKED', gpio, JSON.stringify(data, null, 2));
})
.on('clicked_pressed', function (gpio, data) {
  console.log('CLICKED_PRESSED', gpio, JSON.stringify(data, null, 2));
})
.on('double_clicked', function (gpio, data) {
  console.log('DOUBLE_CLICKED', gpio, JSON.stringify(data, null, 2));
});
```


# destroying node-pi-buttons socket
A method is provided to destroy the connection to the pi-buttons unix socket.
This can be used when an application exits to ensure there are no orphaned socket
connections.

```Javascript
myNPB.destroySocket();
```

The pi-buttons service limits the number of accepted socket connections. If an
application does not cleanly destroy a connection after exiting there is a potential
to temporarily exhaust the available socket connections. The operating system
will eventually close the orphaned connections but the preferred method is to
cleanly destroy the connections when an application exits.

One case where orphaned socket connections may occur is when htheitting Ctrl-C to
stop a running application. The following example code will capture the break signal
and cleanly destroy the socket before exiting...

```Javascript
const npb = require('node-pi-buttons');

// create with default config
let myNPB = npb();

// cleanly destroy socket connection
process.on('SIGINT', function() {
  myNPB.destroySocket();
  process.exit();
});
```


# events
The package provides a variety of high level button events to which an
application can bind. Each event that is emitted includes the GPIO number that
generated the event and a JSON packet received from pi-buttons.

**on(event, callback)**

Possible events include the following...
* pressed
* clicked
* clicked_pressed
* double_clicked
* released
* button_changed
* button_press
* button_release


### pressed
The pressed event is emitted when a button is pressed and held down. This will
eventually be followed with a released event when the button is released.

```javascript
buttons.on('pressed', function (gpio, data) {
  console.log('User pressed button on gpio ', gpio);
});
```

### clicked
When a button is pressed and released rapidly this is interpreted as a click and
results in the emit of the clicked event.

```javascript
buttons.on('clicked', function (gpio, data) {
  console.log('User clicked button on gpio ', gpio);
});
```

### clicked_pressed
If a clicked event is detected and quickly followed by pressing and holding the
button then a clicked_pressed event will be emitted. Eventually when the button
is released then a released event will be emitted.

```javascript
buttons.on('clicked_pressed', function (gpio, data) {
  console.log('User clicked then pressed button on gpio ', gpio);
});
```

### double_clicked
If a clicked event is immediately followed with another clicked detection then
it is interpreted as a double click and a double_clicked event is emitted.

```javascript
buttons.on('double_clicked', function (gpio, data) {
  console.log('User double clicked button on gpio ', gpio);
});
```

### released
When one of the pressed type events is generated the button is placed in a
state where it will wait for the user to release the pressed button. When this
happens the released event is emitted.

```javascript
buttons.on('released', function (gpio, data) {
  console.log('User released button on gpio ', gpio);
});
```


### button_changed
*This is a low level event and is only used in special circumstances.* The button_changed
event occurs anytime there is a button press or release. This event may be
accompanied by the higher level events that detect user intention, i.e. clicked,
double_clicked, etc.


### button_press
*This is a low level event and is only used in special circumstances.* When the user
presses a button the button_press event will occur. This may be accompanied by
other high level events that detect user intent.


### button_release
*This is a low level event and is only used in special circumstances.* A button_release
event occurs whenever the user releases a button. This may be accompanied by
other high level events that detect user intent.
