Device = require('../models/device');
var appliances = require('../../config/appliances.js').appliances;
var defaults = require('../../config/appliances.js').defaults;

var device;


var allOff = appliances;
var pwr = 0;

function createDevice(devCS, deviceId) {
    // create model
    device = new Device(deviceId, devCS);
}

function getDevice() {
    return device;
}

function resetHouse() {
    appliances = allOff;
}

function getAppliances() {
    return appliances
}

function setConsumption(appls) {
    pwr = 0;
    resetHouse();
    for (var appl in appls) {
        pwr += defaults[appl];
        appliances[appl] = "on"
    }
    return pwr;
}

function getConsumption() {
    return pwr;
}

module.exports.createDevice = createDevice;
module.exports.getDevice = getDevice;

module.exports.setConsumption = setConsumption;
module.exports.getConsumption = getConsumption;

module.exports.getAppliances = getAppliances;
module.exports.resetHouse = resetHouse;




