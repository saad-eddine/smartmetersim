'use strict';
var utils = require('./utils');
var device, hubName, devCS;

// azure sdk
var iothub = require('azure-iothub');
var clientFromConnectionString = require('azure-iot-device-mqtt').clientFromConnectionString;
var Client = require('azure-iot-device').Client;
var Protocol = require('azure-iot-device-mqtt').Mqtt;

// direct method - onBlock
// YOU NEED TO REGISTER THIS METHOD IN TASK TWO
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

    // ------------------------------------------
    // bonus task: display on the meter UI that
    // the device is currently blocked and stop
    // the user to start appliances
    // ------------------------------------------
    console.log('Blocking!');
};

// direct method - onRelease
// YOU NEED TO REGISTER THIS METHOD IN TASK TWO

var onRelease = function (request, response) {

    // --------------------------------------
    // bonus task: 
    // revert the actions done when blocking
    // --------------------------------------  
    console.log('releasing...')
}
// twin properties
var updateTwin = function (property, value) {

    device = utils.getDevice();

    switch (property) {
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
    //---------------------------------------
    // task two: write the tags created above
    // to the twin document stored in azure
    // --------------------------------------
 
    // YOUR CODE GOES HERE
}

var writeProp = function (patch) {
    //------------------------------------------
    // task two: report properties created above
    // to the twin document stored in azure
    // -----------------------------------------
 
    // YOUR CODE GOES HERE
}


module.exports.onBlock = onBlock;
module.exports.onRelease = onRelease;
module.exports.updateTwin = updateTwin;