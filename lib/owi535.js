'use strict';

var usb = require('usb');
var VENDOR_ID = 0x1267;
var PRODUCT_ID = 0;

var Arm = require('./Arm');

var owi535 = {
  getArm: function() {
    var d = usb.findByIds(VENDOR_ID, PRODUCT_ID);
    if (d)
      return new Arm(d);
  },
  isArm: function(d) {
    return (d.deviceDescriptor.idVendor === VENDOR_ID && d.deviceDescriptor.idProduct === PRODUCT_ID);
  },
  getArms: function() {
    return usb.getDeviceList().filter(function(device) {
      if (owi535.isArm(device))
        return new Arm(device);
    });
  }
};

module.exports = owi535;