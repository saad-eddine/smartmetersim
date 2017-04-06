'use strict';

var express = require('express'),
    router = express.Router();

// azure iot sdk
var Client = require('azure-iot-device').Client;
var Protocol = require('azure-iot-device-mqtt').Mqtt;
var clientFromConnectionString = require('azure-iot-device-mqtt').clientFromConnectionString;
var client;

var utils = require('../lib/utils');
var msg = '';

//middleware
var bodyParser = require('body-parser');
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

// direct methods
var onReboot = function (request, response) {
    // Respond the cloud app for the direct method
    response.send(200, 'Reboot started', function (err) {
        if (!err) {
            console.error('An error occured when sending a method response:\n' + err.toString());
        } else {
            console.log('Response to method \'' + request.methodName + '\' sent successfully.');
        }
    });

    // Report the reboot before the physical restart
    var date = new Date();
    var patch = {
        iothubDM: {
            reboot: {
                lastReboot: date.toISOString(),
            }
        }
    };

    // Get device Twin
    client.getTwin(function (err, twin) {
        if (err) {
            console.error('could not get twin');
        } else {
            console.log('twin acquired');
            twin.properties.reported.update(patch, function (err) {
                if (err) throw err;
                console.log('Device reboot twin state reported')
            });
        }
    });

    // Add your device's reboot API for physical restart.
    console.log('Rebooting!');
};

// twin properties
var reportProperty = function (client, property, value) {
    client.open(function (err) {
        if (err) {
            console.log('could not open IotHub client');
        } else {
            console.log('client opened');

            client.getTwin(function (err, twin) {
                if (err) {
                    console.error('could not get twin');
                } else {
                    switch (property) {
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
                        if (err) {
                            console.error('could not update twin');
                        } else {
                            console.log('twin state reported');
                        }
                    });
                }
            });
        }
    });
}

// routing

module.exports = function (app) {
    app.use('/', router);
}

/*
router.get('/twin', function (req, res, next) {

    var devCS = utils.getDevice().cs;
    client = clientFromConnectionString(devCS);

    client.open(function (err) {
        if (err) {
            console.error('Could not open IotHub client');
            msg = 'Could not open IotHub client';
        } else {
            msg = "ready to manage device properties"
        }
        res.render('twin', {
            title: "smart meter simulator",
            footer: 'ready to manage device properties',
            deviceId: utils.getDevice().id
        });
    })


});

router.post('/twin', function (req, res, next) {
    var devCS = utils.getDevice().cs;
    var id = utils.getDevice().id;

    client = clientFromConnectionString(devCS);

    client.open(function (err) {
        if (err) {
            console.error('Could not open IotHub client');
            msg = 'Could not open IotHub client';
        } else {
            client.onDeviceMethod('reboot', onReboot);
            console.log('action: ' + req.body.action);
            switch (req.body.action) {
                case 'listen':
                    client.onDeviceMethod('reboot', onReboot);
                    msg = 'Client opened.  Waiting for reboot method.'
                    break;
                case 'fw':
                    msg = 'Reporting FW version: ' + req.body.fw;
                    reportProperty(client, 'fw_version', req.body.fw);
                    break;

                case 'location':
                    msg = 'Reporting ZipCode: ' + req.body.zipcode;
                    reportProperty(client, 'location', req.body.zipcode);
                    break;
                case 'connType':
                    msg = 'Reporting connectivity type: ' + req.body.connType;
                    reportProperty(client, 'connType', req.body.connType);
                    break;
            }
        }

        res.render('twin', {
            title: "smart meter simulator",
            deviceId: id,
            footer: msg
        });
    });
});
*/