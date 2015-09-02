var env = require('node-env-file'),
    box = require('./box');
    
env(__dirname + '/.env');

setInterval(box.sendWaterTempMeasure, 1000);