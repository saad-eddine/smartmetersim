Device = require('../models/device');
var lodash = require('lodash')

var device;
var appliances = {
    "fridge": "off", "freezer": "off", "oven": "off", "stove": "off",
    "dishwasher": "off", "boiler": "off", "aircon": "off", "tv": "off",
    "stereo": "off", "pc": "off", "llr": "off", "lbr": "off", "lk": "off", "lb": "off", "hoover": "off"
};
var defaults = {
    "fridge": 12.5, "freezer": 18, "oven": 28, "dishwasher": 8, "stove": 23, "boiler": 10, "aircon": 30, "tv": 2, "stereo": 17.5, "pc": 3, "llr": 2, "lbr": 2,
    "lk": 4, "lb": 3, "hoover": 12
}

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
function setAppliances(appls) {
    pwr = 0;
    for (var appl in appls)
        pwr += + defaults[appl];

    return pwr;


}

function setConsumption(appliances) {
    // this is pretty awful but works
    // improve later
    pwr = 0;
    if (appliances.fridge == "on")
        pwr += defaults[0].wattph
    else
        pwr -= defaults[0].wattph

    if (appliances.freezer == "on")
        pwr += defaults[1].wattph
    else
        pwr -= defaults[1].wattph

    if (appliances.oven == "on")
        pwr += defaults[2].wattph
    else
        pwr -= defaults[2].wattph

    if (appliances.stove == "on")
        pwr += defaults[3].wattph
    else
        pwr -= defaults[3].wattph

    if (appliances.dishwasher == "on")
        pwr += defaults[4].wattph
    else
        pwr -= defaults[4].wattph

    if (appliances.boiler == "on")
        pwr += defaults[5].wattph
    else
        pwr -= defaults[5].wattph

    if (appliances.aircon == "on")
        pwr += defaults[6].wattph
    else
        pwr -= defaults[6].wattph

    if (appliances.tv == "on")
        pwr += defaults[7].wattph
    else
        pwr -= defaults[7].wattph

    if (appliances.stereo == "on")
        pwr += defaults[8].wattph
    else
        pwr -= defaults[8].wattph

    if (appliances.pc == "on")
        pwr += defaults[9].wattph
    else
        pwr -= defaults[9].wattph

    if (appliances.llr == "on")
        pwr += defaults[10].wattph
    else
        pwr -= defaults[10].wattph

    if (appliances.lbr == "on")
        pwr += defaults[11].wattph
    else
        pwr -= defaults[11].wattph

    if (appliances.lk == "on")
        pwr += defaults[12].wattph
    else
        pwr -= defaults[12].wattph

    if (appliances.lb == "on")
        pwr += defaults[13].wattph
    else
        pwr -= defaults[13].wattph

    if (appliances.hoover == "on")
        pwr += defaults[14].wattph
    else
        pwr -= defaults[14].wattph

    console.log('utils - new consumption: ' + pwr)

}

function getConsumption() {
    return pwr;
}

module.exports.createDevice = createDevice;
module.exports.getDevice = getDevice;

module.exports.setConsumption = setConsumption;
module.exports.getConsumption = getConsumption;

module.exports.getAppliances = getAppliances;
module.exports.setAppliances = setAppliances;
module.exports.resetHouse = resetHouse;




