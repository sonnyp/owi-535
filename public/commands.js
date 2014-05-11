(function(global) {

  'use strict';

  var commands = {
    'base-anti-clockwise': [0,1,0],
    'base-clockwise': [0,2,0],
    'base-right': [0,1,0], //same as a base-anti-clockwise
    'base-left': [0,2,0], //same as base-clockwise
    // 'base-stop': [],
    'shoulder-up': [64,0,0],
    'shoulder-down': [128,0,0],
    // 'shoulder-stop': [],
    'elbow-up': [16,0,0],
    'elbow-down': [32,0,0],
    // 'elbow-stop': [],
    'wrist-up': [4,0,0],
    'wrist-down': [8,0,0],
    // 'wrist-stop': [],
    'grip-open': [2,0,0],
    'grip-close': [1,0,0],
    // 'grip-stop': [],
    'hand-open': [2,0,0], //same as grip-open
    'hand-close': [1,0,0], //same as grip-close
    // 'hand-stop': [], //same as grip-stop
    'light-on': [0,0,1],
    'light-off': [0,0,0],
    'stop': [0,0,0],
  };

  if (typeof module !== 'undefined' && module.exports)
    module.exports = commands;
  else
    global.commands = commands;

})(this);


// var commands = {
//   'base': {
//     'clockwise': [0,2,0],
//     'anticlockwise': [0,1,0],
//     //same as clockwise
//     'right': [0,2,0],
//     //same as anticlockwise
//     'left': [0,1,0],
//   },
//   'shoulder': {
//     up: [64,0,0],
//     down: [128,0,0]
//   },
//   'elbow': {
//     up: [16,0,0],
//     down: [32,0,0]
//   },
//   'wrist': {
//     up: [4,0,0],
//     down: [8,0,0]
//   },
//   'grip': {
//     open: [2,0,0],
//     close: [1,0,0]
//   },
//   //same as grip
//   'hand': {
//     open: [2,0,0],
//     close: [1,0,0]
//   },
//   'light': {
//     on: [0,0,1],
//     off: [0,0,0]
//   },
//   'stop': [0,0,0]
// };