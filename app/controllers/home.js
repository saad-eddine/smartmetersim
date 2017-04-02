'use strict';

var express = require('express'),
    router = express.Router();

var utils = require('../lib/utils');

var defaults = require('../../config/appliances.js');

//middleware
var bodyParser = require('body-parser');
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

// azure sdk
var iothub = require('azure-iothub');
var clientFromConnectionString = require('azure-iot-device-mqtt').clientFromConnectionString;
var Message = require('azure-iot-device').Message;

var deviceKey = '';
var deviceId = '';
var cs = '';
var devCS = '';
module.exports.devCS = devCS;

var appliances = [false, false, false, false, false, false, false, false, false, false, false, false, false, false]
var pwr = 0;

// auxiliary functions
function printResultFor(op) {
    return function printResult(err, res) {
        if (err) console.log(op + ' error: ' + err.toString());
        if (res) console.log(op + ' status: ' + res.constructor.name);
    };
}

function printDeviceInfo(err, deviceInfo, res) {
    if (deviceInfo) {
        console.log('Device ID: ' + deviceInfo.deviceId);
        console.log('Device key: ' + deviceInfo.authentication.symmetricKey.primaryKey);
        deviceKey = deviceInfo.authentication.symmetricKey.primaryKey;

    }
}

function setConsumption(index) {
    if (appliances[index])
        pwr += defaults[index].wattph
    else
        pwr -= defaults[index].wattph

    console.log('new power consumption: ' + pwr);
}

function resetAppliances() {
    pwr = 0;
    for (var i = 0; i < appliances.length; i++)
        appliances[i] = false;
}

// routing 

module.exports = function (app) {
    app.use('/', router);
};

router.get('/', function (req, res, next) {
    res.render('index', {
        title: "smart meter simulator",
        msg: 'the connection string is available on the azure portal'
    });
});

router.get('/device', function (req, res, next) {
    res.render('device', {
    });
});

router.get('/appliances', function (req, res, next) {
    res.render('appliances', {
    });
});

router.post('/device', function (req, res, next) {

    var timer = 10;
    switch (req.body.action) {
        case 'register':
            console.log('register');

            cs = req.body.cs;
            var registry = iothub.Registry.fromConnectionString(cs);

            // register device if not already done
            // then save the device suthentication key
            var device = new iothub.Device(null);
            deviceId = req.body.devID;
            device.deviceId = req.body.devID;
            registry.create(device, function (err, deviceInfo, res) {

                if (err) {
                    registry.get(device.deviceId, printDeviceInfo);

                }
                if (deviceInfo) {
                    printDeviceInfo(err, deviceInfo, res);

                }
            });
            var msg = "device successfully registered with IoT Hub";
            res.render('device', {
                title: "smart meter simulator",
                deviceId: deviceId,
                msg: msg
            });
            break;

        case 'activate':
            console.log('activate');

            //var clientFromConnectionString = require('azure-iot-device-mqtt').clientFromConnectionString;
            //var Message = require('azure-iot-device').Message;

            var hubName = cs.substring(cs.indexOf('=') + 1, cs.indexOf(';'));
            devCS = 'HostName=' + hubName + ';DeviceId=' + deviceId + ';SharedAccessKey=' + deviceKey;

            utils.createDevice(devCS, deviceId);


            var client = clientFromConnectionString(devCS);
            client.open(function (err) {
                if (err) {
                    console.log('Could not connect: ' + err);
                } else {
                    console.log('Client connected');

                    // Create a message and send it to the IoT Hub at interval
                    msg = setInterval(function () {
                        var data = JSON.stringify({ deviceId: deviceId, reading: pwr });
                        var message = new Message(data);
                        console.log("Sending message: " + message.getData());
                        client.sendEvent(message, printResultFor('send'));
                    }, 60000);
                }
            });
            var msg = "device successfully connected to IoT Hub";
            res.render('twin', {
                title: "smart meter simulator",
                deviceId: deviceId
            });
            break;

        case 'deactivate':
            console.log('deactivate');
            resetAppliances();



            devCS = 'HostName=' + hubName + ';DeviceId=' + deviceId + ';SharedAccessKey=' + deviceKey;
            var client = clientFromConnectionString(devCS);

            client.close(function (err) {
                if (err) {
                    console.log('Could not connect: ' + err);
                } else {
                    console.log('Client disconnected');
                    clearInterval(msg);
                }
            });

            var msg = "device successfully disconnected from IoT Hub";
            res.render('device', {
                title: "smart meter simulator",
                msg: msg
            });
            break;

        default:
            console.log('cant get there form here');
    }


});

router.post('/appliances', function (req, res, next) {

    var index = req.body.appliance;
    appliances[index] = !appliances[index];
    var msg = 'toggled ' + defaults[index].type

    setConsumption(index);
    res.render('appliances', {
        msg: msg
    });
});
