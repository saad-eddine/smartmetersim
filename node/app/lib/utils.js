Device = require('../models/device');
var appliances = require('../../config/appliances.js').appliances;
var defaults = require('../../config/appliances.js').defaults;

var device;
var applon = [];

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
        appliances[appl] = "on",
        applon.push(appl)
    }
    return pwr;
}

function getConsumption() {
    var reading = { "pwr": pwr, "appls": applon };
    return reading;
}

module.exports.createDevice = createDevice;
module.exports.getDevice = getDevice;

module.exports.setConsumption = setConsumption;
module.exports.getConsumption = getConsumption;

module.exports.getAppliances = getAppliances;
module.exports.resetHouse = resetHouse;




