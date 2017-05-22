'use strict';
var utils = require('./utils');
var device, hubName, devCS;

// azure sdk
var iothub = require('azure-iothub');
var clientFromConnectionString = require('azure-iot-device-mqtt').clientFromConnectionString;
var Client = require('azure-iot-device').Client;
var Protocol = require('azure-iot-device-mqtt').Mqtt;

// direct methods
var onBlock = function (request, response) {
    var client = clientFromConnectionString(utils.getDevice().cs);
    // Respond the cloud app for the direct method
    response.send(200, 'Electricity supply is now blocked', function (err) {
        if (!err) {
            console.error('An error occured when sending a method response:\n' + err.toString());
        } else {
            console.log('Response to method \'' + request.methodName + '\' sent successfully.');
        }
    });

    // Report the block 
    var date = new Date();
    var patch = {
        iothubDM: {
            block: {
                lastBlock: date.toISOString(),
            }
        }
    };

    // Get device Twin
    client.getTwin(function (err, twin) {
        if (err) {
            console.error('could not get twin: ' + JSON.stringify(err));
        } else {
            console.log('twin acquired');
            twin.properties.reported.update(patch, function (err) {
                if (err) throw err;
                console.log('Device twin state reported')
            });
        }
    });

    // Block API for physical restart.
    console.log('Blocking!');
};

var onRelease = function (request, response) {

    // do something here
    console.log('releasing...')
}
// twin properties
var updateTwin = function (property, value) {

    device = utils.getDevice();

    switch (property) {
        case 'appl':
            var appArray = utils.getAppliances()
            console.log(appArray)
            var patch = {
                appliances: {
                    applArray: ['a', 'b']
                }
            };
            writeTag(patch);
            break;
        case 'interval':
            var patch = {
                interval: {
                    ms: value
                }
            };
            writeProp(patch);
            break;
        case 'connType':
            var patch = {
                tags: {
                    connectivity: {
                        type: value
                    }
                }
            };
            writeTag(patch);
            break;
        case 'location':
            var patch = {
                tags: {
                    location: {
                        zipcode: value
                    }
                }
            };
            writeTag(patch);
            break;
        case 'fw_version':
            var patch = {
                fw_version: {
                    version: value
                }
            };
            writeProp(patch);
            break;
    }
}

var writeTag = function (patch) {
    var registry = iothub.Registry.fromConnectionString(device.cs);
    registry.getTwin(device.id, function (err, twin) {
        if (err) {
            console.error(err.constructor.name + ': ' + err.message);
        } else {
            twin.update(patch, function (err) {
                if (err)
                    console.log('could not update twin: ' + err);
                else
                    console.log('twin state reported');
            });
        }
    })
}

var writeProp = function (patch) {
    hubName = device.cs.substring(device.cs.indexOf('=') + 1, device.cs.indexOf(';'));
    devCS = 'HostName=' + hubName + ';DeviceId=' + device.id + ';SharedAccessKey=' + device.key;
    var client = clientFromConnectionString(devCS);
    client.open(function (err) {
        if (err)
            msg = 'could not open IotHub client';
        else {
            client.getTwin(function (err, twin) {
                console.log("client successfully opened!")

                if (err) {
                    msg = 'could not get twin: ' + JSON.stringify(err);
                    console.log('could not get twin: ' + JSON.stringify(err));

                }
                else {
                    twin.properties.reported.update(patch, function (err) {
                        if (err)
                            console.log('could not update twin: ' + err);
                        else
                            console.log('twin state reported');
                    });
                }
            });
        }
    });
}


module.exports.onBlock = onBlock;
module.exports.onRelease = onRelease;
module.exports.updateTwin = updateTwin;