'use strict';

var express = require('express'),
    router = express.Router();
var utils = require('../lib/utils');

var version = 'not set';
var location = 'not set';
var device, hubName, devCS;

//middleware
var bodyParser = require('body-parser');
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

// azure sdk
var iothub = require('azure-iothub');
var clientFromConnectionString = require('azure-iot-device-mqtt').clientFromConnectionString;
var Message = require('azure-iot-device').Message;
var Client = require('azure-iot-device').Client;
var Protocol = require('azure-iot-device-mqtt').Mqtt;
var clientFromConnectionString = require('azure-iot-device-mqtt').clientFromConnectionString;

// routing 
module.exports = function (app) {
    app.use('/', router);
};

router.get('/device', function (req, res, next) {
    res.render('device', {
        deviceId: utils.getDevice().id
    });
});

router.post('/device', function (req, res, next) {
    device = utils.getDevice();
    hubName = device.cs.substring(device.cs.indexOf('=') + 1, device.cs.indexOf(';'));
    devCS = 'HostName=' + hubName + ';DeviceId=' + device.id + ';SharedAccessKey=' + device.key;
    switch (req.body.action) {
        case 'activate':
            var client = clientFromConnectionString(devCS);
            client.open(function (err) {
                if (err) {
                    console.log('Could not connect: ' + err);
                } else {
                    // start listeners
                    client.onDeviceMethod('block', onBlock);
                    client.onDeviceMethod('release', onRelease);
                }
            });
            res.render('messaging', {
                title: "smart meter simulator",
                deviceId: utils.getDevice().id,
                footer: 'starting listeners'
            });
            break;

        case 'deactivate':
            var client = clientFromConnectionString(devCS);
            client.close(function (err) {
                if (err) {
                    console.log('Could not disconnect: ' + err);
                } else {
                    console.log('Client disconnected');
                }
            });
            res.render('device', {
                title: "smart meter simulator",
                deviceId: utils.getDevice().id,
                footer: 'closing connection to hub'
            });
            break;
        default:
            res.render('device', {
                title: "smart meter simulator",
                deviceId: utils.getDevice().id,
                footer: 'cant get there form here'
            });
    }
});


router.get('/twin', function (req, res, next) {
    res.render('twin', {
        title: "smart meter simulator",
        footer: 'ready to manage device properties',
        deviceId: utils.getDevice().id,
        location: location,
        version: version
    });
});

router.post('/twin', function (req, res, next) {
    switch (req.body.action) {
        case 'fw':
            version = req.body.fw;
            var msg = reportProperty('fw_version', version);
            break;
        case 'location':
            location = req.body.zipcode;
            var msg = reportProperty('location', location);
            break;
        case 'connType':
            var msg = reportProperty('connType', req.body.connType);
            break;
    }

    res.render('twin', {
        title: "smart meter simulator",
        deviceId: utils.getDevice().id,
        footer: msg,
        location: location,
        version: version
    });
});

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
var reportProperty = function (property, value) {
    var msg = '';
    var client = Client.fromConnectionString(devCS, Protocol);

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
                    switch (property) {
                        case 'interval':
                            var patch = {
                                interval: {
                                    ms: value
                                }
                            };
                            break;
                        case 'connType':
                            var patch = {
                                connectivity: {
                                    type: value
                                }
                            };
                            break;
                        case 'location':
                            var patch = {
                                location: {
                                    zipcode: value
                                }
                            };
                            break;
                        case 'fw_version':
                            var patch = {
                                fw_version: {
                                    version: value
                                }
                            };
                            break;
                    }

                    twin.properties.reported.update(patch, function (err) {
                        if (err)
                            msg = 'could not update twin: ' + err;
                        else
                            msg = 'twin state reported';
                    });
                }
            });
        }
        return msg;
    });
}
