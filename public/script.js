(function(global) {

  'use strict';

  var conducto = global.conducto;

  var options = {
    host: '192.168.1.10',
    port: 8080,
    secure: false
  };

  var client = new conducto.Client();
  client.on('open', function() {
    console.log('OPENED');
  });
  client.on('close', function() {
    console.log('CLOSED')
  });
  client.on('message', function(m) {
    console.log('IN', m);
  });
  client.on('send', function(m) {
    console.log('OUT', m);
  });
  client.open(options);

  var makeButton = function(el) {
    var c = el.dataset.action;
    var state = 0;
    var start = function() {
      state = 1;
      client.exec('do', c);
      if (c !== 'light' && 'vibrate' in window.navigator) {
        //vibrate(int) on FF Android nightly is limited to 1000*10
        //we assume no action needs more than 20 seconds
        window.navigator.vibrate([1000*10,0,1000*10]);
      }
    };
    var stop = function() {
      if (state === 0)
        return;

      state = 0;
      client.exec('do', 'stop');
      if ('vibrate' in window.navigator)
        window.navigator.vibrate(0);
    };
    //touchscreen
    el.addEventListener('touchstart', start);
    el.addEventListener('touchend', stop);
    //mouse
    el.addEventListener('mousedown', start);
    el.addEventListener('mouseup', stop);
    el.addEventListener('mouseleave', stop);
  };

  document.addEventListener('DOMContentLoaded', function() {

    var buttons = document.querySelectorAll('[data-action]');
    for (var i = 0; i < buttons.length; i++) {
      makeButton(buttons[i]);
    }

  });

})(this);