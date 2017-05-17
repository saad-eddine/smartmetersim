'use strict';

var express = require('express'),
    router = express.Router();
var utils = require('../lib/utils');

var appliancesArray = [];

//middleware
var bodyParser = require('body-parser');
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

// routing 
module.exports = function (app) {
    app.use('/', router);
};

router.get('/house', function (req, res, next) {
    appliancesArray = utils.getAppliances();

    res.render('house', {
        title: "smart meter simulator",
        appls: appliancesArray,
        deviceId: utils.getDevice().id
    });
});

router.post('/house', function (req, res, next) {
    var keys = [];
    appliancesArray = utils.getAppliances();

    for (var k in req.body) 
        keys.push(k);

    for (var i = 0; i < appliancesArray.length; i++) {
        for (var j = 0; j < keys.length; j++) {
            if (appliancesArray[i].name == keys[j]) {
                if (appliancesArray[i].state == 'on')
                    appliancesArray[i].state = 'off'
                else
                    appliancesArray[i].state = 'on'
            }
        }
    }

    var pwr = utils.getConsumption().pwr;
    var msg = 'consumption per minute: ' + pwr + ' watts/min'

    res.render('appreg', {
        title: "smart meter simulator",
        footer: msg,
        appls: appliancesArray
    });
});

router.get('/appliances', function (req, res, next) {
    appliancesArray = utils.getAppliances();

    res.render('appreg', {
        title: "smart meter simulator",
        appls: appliancesArray,
        deviceId: utils.getDevice().id
    });
});

router.post('/appliances', function (req, res, next) {
    var applObj = {};
    applObj.name = req.body.name;
    applObj.kwm = req.body.kwm;
    applObj.state = 'off';
    appliancesArray.push(applObj);

    utils.setAppliances(appliancesArray);
    res.render('appreg', {
        title: "smart meter simulator",
        deviceId: utils.getDevice().id,
        appls: appliancesArray
    });
});

