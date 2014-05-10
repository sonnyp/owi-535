'use strict';

var commands = require('../commands');

var Arm = function(device) {
  device.open();
  this.device = device;
};
Arm.prototype.exec = function(cmd, t) {
  var c = Array.isArray(cmd) ? cmd : commands[cmd];
  if (!c)
    return new Error('unknown command');

  this.device.controlTransfer(0x40, 6, 0x100, 0, new Buffer(c));
  if (t && c !== commands['stop']) {
    var that = this;
    setTimeout(function() {
      that.stop();
    }, t);
  }
};
Arm.prototype.stop = function() {
  return this.exec('stop');
};

module.exports = Arm;