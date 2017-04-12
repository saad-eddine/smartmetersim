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
var Client = require('azure-iot-device').Client;
var Protocol = require('azure-iot-device-mqtt').Mqtt;
var clientFromConnectionString = require('azure-iot-device-mqtt').clientFromConnectionString;

var deviceKey = '';
var deviceId = '';
var cs = '';
var devCS = '';
var hubName = '';
var msg = '';
var myTimer,
    interval = 60000;

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

// direct methods
var onReboot = function (request, response) {
    var client = clientFromConnectionString(utils.getDevice().cs);
    console.log('client: ' + client);
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
            console.error('could not get twin: ' + JSON.stringify(err));
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
var reportProperty = function (property, value) {
    var msg = '';
    var client = Client.fromConnectionString(utils.getDevice().cs, Protocol);

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


// routing 
module.exports = function (app) {
    app.use('/', router);
};

router.get('/', function (req, res, next) {
    res.render('index', {
        title: "smart meter simulator",
        footer: 'tips: the connection string is available on the azure portal'
    });
});

router.get('/device', function (req, res, next) {
    res.render('device', {
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
            msg = "device successfully registered with IoT Hub";
            res.render('device', {
                title: "smart meter simulator",
                deviceId: deviceId,
                footer: msg
            });
            break;

        case 'activate':
            hubName = cs.substring(cs.indexOf('=') + 1, cs.indexOf(';'));
            devCS = 'HostName=' + hubName + ';DeviceId=' + deviceId + ';SharedAccessKey=' + deviceKey;
            utils.createDevice(devCS, deviceId);
            var client = clientFromConnectionString(devCS);
            client.open(function (err) {
                if (err) {
                    console.log('Could not connect: ' + err);
                } else {
                    console.log('Client connected');
                    // start listeners
                    client.onDeviceMethod('reboot', onReboot);
                }
            });
            msg = "device successfully connected to IoT Hub";
            res.render('device', {
                title: "smart meter simulator",
                deviceId: deviceId,
                footer: msg
            });
            break;

        case 'tele':
            client = clientFromConnectionString(devCS);

            console.log('TELEMETRY: ' + client)

            client.open(function (err) {
                if (err) {
                    console.log('Could not connect: ' + err);
                } else {
                    if (req.body.interval != '')
                        interval = req.body.interval;
                    console.log('starting telemetry at ' + interval + ' ms interval')
                    msg = reportProperty('interval', interval);
                    console.log('reported: ' + interval)

                    // Create a message and send it to the IoT Hub at interval
                    myTimer = setInterval(function () {
                        var data = JSON.stringify({ deviceId: deviceId, reading: pwr });
                        var message = new Message(data);
                        console.log("Sending message: " + message.getData());
                        client.sendEvent(message, printResultFor('send'));
                    }, 60000);
                }
            });
            msg = 'telemetry started. interval: ' + interval;
            res.render('device', {
                title: "smart meter simulator",
                deviceId: deviceId,
                footer: msg
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
                    clearInterval(myTimer);
                }
            });

            msg = "device successfully disconnected from IoT Hub";
            res.render('device', {
                title: "smart meter simulator",
                footer: msg
            });
            break;

        default:
            console.log('cant get there form here');
    }


});

router.get('/appliances', function (req, res, next) {
    res.render('appliances', {
    });
});

router.post('/appliances', function (req, res, next) {

    var index = req.body.appliance;
    appliances[index] = !appliances[index];
    msg = 'toggled ' + defaults[index].type

    setConsumption(index);
    res.render('appliances', {
        footer: msg
    });
});


router.get('/twin', function (req, res, next) {
    res.render('twin', {
        title: "smart meter simulator",
        footer: 'ready to manage device properties',
        deviceId: deviceId
    });


});

router.post('/twin', function (req, res, next) {
    switch (req.body.action) {
        case 'fw':
            msg = reportProperty('fw_version', req.body.fw);
            break;
        case 'location':
            msg = reportProperty('location', req.body.zipcode);
            break;
        case 'connType':
            msg = reportProperty('connType', req.body.connType);
            break;
    }

    res.render('twin', {
        title: "smart meter simulator",
        deviceId: deviceId,
        footer: msg
    });
});
