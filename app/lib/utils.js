Device = require('../models/device');
var device;

function createDevice(devCS, deviceId) {
    // create model
    device = new Device(deviceId, devCS);
}

function getDevice() {
    return device;
}


module.exports.createDevice = createDevice;
module.exports.getDevice = getDevice;

