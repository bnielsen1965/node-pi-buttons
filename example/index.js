const npb = require('../index.js');
const config = {
  reconnectTimeout: 5000
};

let myNPB = npb(config);
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
