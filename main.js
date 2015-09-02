var env = require('node-env-file');
env(__dirname + '/.env');

var box = require('./box');

setInterval(box.sendWaterTempMeasure, 1000);