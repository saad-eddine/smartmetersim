'use strict';

var express = require('express'),
    router = express.Router();

// azure iot sdk
var Client = require('azure-iot-device').Client;
var Protocol = require('azure-iot-device-mqtt').Mqtt;
var client; 

var utils = require('../lib/utils');
var msg = '';

//middleware
var bodyParser = require('body-parser');
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

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

// routing 
module.exports = function (app) {
    app.use('/', router);
};

router.get('/twin', function (req, res, next) {
        res.render('twin', {
        title: "smart meter simulator",
        cs: cs,
        deviceId: id
    });
});

router.post('/twin', function (req, res, next) {
    var cs = utils.getDevice().cs;
    var id = utils.getDevice().id;

    client = Client.fromConnectionString(cs, Protocol);

    client.open(function (err) {
        if (err) {
            console.error('Could not open IotHub client');
            msg = 'Could not open IotHub client';
        } else {
            console.log('Client opened.  Waiting for reboot method.');
            client.onDeviceMethod('reboot', onReboot);
            msg = 'Client opened.  Waiting for reboot method.'
        }
    });

    res.render('twin', {
        title: "smart meter simulator",
        msg: msg
    });
});