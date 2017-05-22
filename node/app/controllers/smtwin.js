'use strict';

var express = require('express'),
    router = express.Router();
var utils = require('../lib/utils');
var devfunc = require('../lib/devfunc');


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
var Client = require('azure-iot-device').Client;
var Protocol = require('azure-iot-device-mqtt').Mqtt;

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
                    client.onDeviceMethod('block', devfunc.onBlock);
                    client.onDeviceMethod('release', devfunc.onRelease);
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

    var location = 'not yet set'
    var version = 'not yet set'


    var registry = iothub.Registry.fromConnectionString(utils.getDevice().cs);
    var query = registry.createQuery("SELECT * FROM devices WHERE deviceId = '" + utils.getDevice().id + '\'', 100);
    query.nextAsTwin(function (err, prop) {
        if (err)
            console.error('Failed to fetch the results: ' + err.message);
        else {
            if (prop.length > 0) {
                location = prop[0].tags.location.zipcode;
                version = prop[0].properties.reported.fw_version.version;
            }

        }
        res.render('twin', {
            title: "smart meter simulator",
            footer: 'ready to manage device properties' + utils.getDevice().location + '/ ' + utils.getDevice().fw_version,
            deviceId: utils.getDevice().id,
            location: location,
            fw_version: version
        });
    })


});

router.post('/twin', function (req, res, next) {
    device = utils.getDevice();



    switch (req.body.action) {
        case 'fw_version':
            devfunc.updateTwin('fw_version', req.body.fw_version);
            device.fw_version = req.body.fw_version;
            break;
        case 'location':
            devfunc.updateTwin('location', req.body.location);
            device.location = req.body.location;
            break;
        case 'connType':
            devfunc.updateTwin('connType', req.body.connType);
            device.connType = req.body.connType;
            break;
    }

    res.render('twin', {
        title: "smart meter simulator",
        deviceId: utils.getDevice().id,
        footer: 'twin property updated',
        location: location,
        version: version
    });
});
