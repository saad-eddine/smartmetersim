'use strict';

var express = require('express'),
    router = express.Router();
var utils = require('../lib/utils');
var devfunc = require('../lib/devfunc');

var Device = require('../models/device');

var smtwin = require('./smtwin.js');

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

var deviceKey = '';
var deviceId = '';
var cs = '', devCS = '', hubName = '';
var msg = '';

var myTimer,
    interval = 60000;
var watt = 0;
var msgType = '';
var appliancesArray = [];

// auxiliary functions
function printResultFor(op) {
    return function printResult(err, res) {
        if (err) console.log(op + ' error: ' + err.toString());
        if (res) console.log(op + ' status: ' + res.constructor.name);
    };
}


// ROUTING
module.exports = function (app) {
    app.use('/', router)
};

router.get('/', function (req, res, next) {
    res.render('index', {
        title: "smart meter simulator",
        footer: 'tips: the connection string is available on the azure portal'
    });
});


router.post('/', function (req, res, next) {
    var timer = 10;
    switch (req.body.action) {
        case 'register':

            cs = req.body.cs;
            deviceId = req.body.devID;
            // populate model
            utils.setDevice(deviceId, cs);

            // -------------------------------------
            // task one:
            // register device if not already done
            // then save the device key in the model
            // with utils.setDeviceKey(DEVICE KEY)
            // -------------------------------------

            v// YOUR CODE GOES HERE

            msg = deviceId + " successfully registered with IoT Hub";
            res.render('device', {
                title: "smart meter simulator",
                deviceId: deviceId,
                footer: msg
            });
            break;

        case 'delete':
            //do something here
            break;
        default:
            console.log('cant get there form here');
    }
});

router.get('/msg', function (req, res, next) {
    res.render('messaging', {
        title: "smart meter simulator",
        deviceId: deviceId
    });
});

router.post('/msg', function (req, res, next) {

    switch (req.body.action) {
        case 'on':
            var device = utils.getDevice();
            hubName = device.cs.substring(device.cs.indexOf('=') + 1, device.cs.indexOf(';'));
            var devCS = 'HostName=' + hubName + ';DeviceId=' + device.id + ';SharedAccessKey=' + device.key;

            var client = clientFromConnectionString(devCS);
            if (req.body.interval != '')
                interval = req.body.interval;
            devfunc.updateTwin('interval', interval);

            client.open(function (err) {
                if (err) {
                    msg = 'Could not connect: ' + err;
                } else {

                    myTimer = setInterval(function () {
                        var reading = utils.getConsumption();
                        var data = JSON.stringify({ deviceId: deviceId, timestamp: Date.now(), consumption: reading.pwr, appliances: reading.appls });
                        var message = new Message(data);
                        // --------------------------------------
                        // task four:
                        // send the mesage created above to azure
                        // bonus task:
                        // only send a message if the reading on
                        // the meter has changed in case "delta"
                        // was selected on the UI
                        // ---------------------------------------

                    }, interval);
                }
            })
            msg = 'starting telemetry at ' + interval + ' ms interval';

            res.render('messaging', {
                title: "smart meter simulator",
                deviceId: deviceId,
                footer: msg
            });
            break;
        case 'off':
            clearInterval(myTimer);
            res.render('messaging', {
                title: "smart meter simulator",
                deviceId: deviceId,
                footer: 'telemetry stopped'
            });
            break;
    }

})






