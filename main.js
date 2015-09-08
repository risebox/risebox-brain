var env = require('node-env-file');
env(__dirname + '/.env');

var box      = require('./box');

box.loadDeviceSettings();

box.initLightingSystem();

setInterval(box.sendWaterTempMeasure, 6000);
setInterval(box.sendAirTempAndHumMeasure, 6000);
setInterval(box.sendPHMeasure, 6000);

box.watchUpperWaterLevel();
box.watchLowerWaterLevel();
setInterval(box.checkWaterCycleDurations, 30000);
  
