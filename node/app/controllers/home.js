'use strict';

var express = require('express'),
    router = express.Router();
var utils = require('../lib/utils');
Device = require('../models/device');

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
var cs = '', devCS = '', hubName = '';
var msg = '';
var version = 'not set';
var location = 'not set';
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

function printDeviceInfo(err, deviceInfo, res) {
    if (deviceInfo) {
        deviceKey = deviceInfo.authentication.symmetricKey.primaryKey;
    }
}

// direct methods
var onBlock = function (request, response) {
    var client = clientFromConnectionString(utils.getDevice().cs);
    console.log('client: ' + client);
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

router.get('/device', function (req, res, next) {
    res.render('device', {
    });
});

router.post('/device', function (req, res, next) {
    var timer = 10;
    switch (req.body.action) {
        case 'register':

            cs = req.body.cs;
            var registry = iothub.Registry.fromConnectionString(cs);

            // register device if not already done
            // then save the device suthentication key
            var device = new iothub.Device(null);
            deviceId = req.body.devID;
            device.deviceId = req.body.devID;
            devCS = req.body.cs;

            // populate model
            utils.setDevice(deviceId, devCS);

            registry.create(device, function (err, deviceInfo, res) {
                if (err)
                    registry.get(device.deviceId, printDeviceInfo);
                if (deviceInfo)
                    printDeviceInfo(err, deviceInfo, res);
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
            msg = "device successfully connected to IoT Hub";
            res.render('messaging', {
                title: "smart meter simulator",
                deviceId: deviceId,
                footer: msg
            });
            break;

        case 'deactivate':
            console.log('deactivate');
            utils.resetHouse();

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

router.get('/msg', function (req, res, next) {
    res.render('messaging', {
        title: "smart meter simulator",
        deviceId: deviceId
    });
});

router.post('/msg', function (req, res, next) {
    //var timer = 10;


    switch (req.body.action) {
        case 'on':
            var client = clientFromConnectionString(devCS);
            if (req.body.interval != '')
                interval = req.body.interval;
            reportProperty('interval', interval);

            client.open(function (err) {
                if (err) {
                    msg = 'Could not connect: ' + err;
                } else {

                    // Create a message and send it to the IoT Hub at interval
                    myTimer = setInterval(function () {
                        var reading = utils.getConsumption();
                        var data = JSON.stringify({ deviceId: deviceId, timestamp: Date.now(), consumption: reading.pwr, appliances: reading.appls });
                        var message = new Message(data);

                        if (req.body.msgType == 'delta') {
                            if (reading != watt) {
                                client.sendEvent(message, printResultFor('send'));
                                watt = reading;
                            } else
                                console.log('skip mesaging as no changes');
                        } else
                            client.sendEvent(message, printResultFor('send'));
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
/*
router.get('/appreg', function (req, res, next) {
    res.render('appreg', {
        title: "smart meter simulator",
        deviceId: deviceId
    });
});

router.post('/appreg', function (req, res, next) {
    console.log('adding: ' + req.body.name);
    var applObj = {};
    applObj.name = req.body.name;
    applObj.kwm = req.body.kwm;

    appliancesArray.push(applObj)
    
    console.log('array: ' + JSON.stringify(appliancesArray));
    
    
    res.render('appreg', {
        title: "smart meter simulator",
        deviceId: deviceId
    });
});
*/
router.get('/appliances', function (req, res, next) {

    var appliances = utils.getAppliances();
    var index;
    var appl = [];
    console.log(appliances.length)
    for (index = 0; index < appliances.length; index++) {
        appl[index] = appliances[index].name
    }

    res.render('appliances', {
        title: "smart meter simulator",
        appls: appl,
        deviceId: deviceId
    });
});



router.get('/twin', function (req, res, next) {
    res.render('twin', {
        title: "smart meter simulator",
        footer: 'ready to manage device properties',
        deviceId: deviceId,
        location: location,
        version: version
    });
});

router.post('/twin', function (req, res, next) {
    switch (req.body.action) {
        case 'fw':
            version = req.body.fw;
            msg = reportProperty('fw_version', version);
            break;
        case 'location':
            location = req.body.zipcode;
            msg = reportProperty('location', location);
            break;
        case 'connType':
            msg = reportProperty('connType', req.body.connType);
            break;
    }

    res.render('twin', {
        title: "smart meter simulator",
        deviceId: deviceId,
        footer: msg,
        location: location,
        version: version
    });
});

