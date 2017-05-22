'use strict';

var Device = require('../models/device');
var devfunc = require('./devfunc');
var fs = require('fs');

var device;
var applon = [];


var pwr = 0;

function setDevice(id, cs) {
    device = new Device(id, cs);
    var appl = [];

    // the code below should be elsewhere, in here due to laziness
    // reading the apliances list from file when starting
    fs.readFile('./config/appl.json', 'utf8', function (err, appl) {
        if (err) {
            return console.log(err);
        }
        if (appl !== '')
            var appliances = JSON.parse(appl);

            console.log('APPLIANCES')
            console.log(appliances.length)

        device.appliances = appliances;

    });
}

function setDeviceKey(key) {
    device.key = key;
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
    device.appliances = appl;
    console.log(device.appliances)
    fs.writeFile('./config/appl.json', JSON.stringify(appl), function (err) {
        if (err)
            return console.log(err);
        console.log('written');
    });
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
module.exports.setDeviceKey = setDeviceKey;
module.exports.getDevice = getDevice;

module.exports.getConsumption = getConsumption;

module.exports.getAppliances = getAppliances;
module.exports.setAppliances = setAppliances;

module.exports.resetHouse = resetHouse;




