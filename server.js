'use strict';

var conducto = require('conducto');
var owi535 = require('./lib/owi535');

var arm = owi535.getArm();
var server = new conducto.Server();

server.use('do', function(req, res) {
  var p = req.payload;
  if (!p)
    return;

  arm.exec(p);
});
server.listen(8080);