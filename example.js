'use strict';

var owi535 = require('./owi535');

var arm = owi535.getArm();

arm.exec('base-clockwise', 1000);

process.on('SIGINT', function() {
  arm.stop();
  process.exit();
});
process.on('exit', function() {
  arm.stop();
});