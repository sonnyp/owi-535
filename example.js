'use strict';

var owi535 = require('./lib/owi535');

var arm = owi535.getArm();

//rotate base clockwise for 1s
arm.exec('base-clockwise', 1000);

process.on('SIGINT', function() {
  arm.stop();
  process.exit();
});
process.on('exit', function() {
  arm.stop();
});