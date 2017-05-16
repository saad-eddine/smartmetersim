Device = require('../models/device');
var appliances = require('../../config/appliances.js').appliances;
var defaults = require('../../config/appliances.js').defaults;

var device;
var applon = [];

var allOff = appliances;
var pwr = 0;

function setDevice(id, cs) {
    device = new Device(id, cs);
}

function getDevice() {
    return device;
}

function resetHouse() {
    appliances = allOff;
    applon = [];
}

function getAppliances() {
    //return appliances  
    return device.appliances;
}

function setAppliances(appl) {
    device.setAppliances(appl);
}

function getConsumption() {
    pwr = 0;
    resetHouse();

    for (var i = 0; i < device.appliances.length; i++) {
        console.log(device.appliances[i])
        if (device.appliances[i].state == 'on') {
            pwr += Number(device.appliances[i].kwm);
            applon.push(device.appliances[i].name)
        }
    }

    var reading = { "pwr": pwr, "appls": applon };
    return reading;
}

module.exports.setDevice = setDevice;
module.exports.getDevice = getDevice;

module.exports.getConsumption = getConsumption;

module.exports.getAppliances = getAppliances;
module.exports.setAppliances = setAppliances;

module.exports.resetHouse = resetHouse;




