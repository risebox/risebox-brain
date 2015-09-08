var env = require('node-env-file');
env('.env');

path = function(pathString) {
  return process.cwd() + pathString;
}

var box      = require('./box');

box.loadDeviceSettings();

setInterval(box.sendWaterTempMeasure, 6000);
setInterval(box.sendAirTempAndHumMeasure, 6000);
setInterval(box.sendPHMeasure, 6000);

box.watchUpperWaterLevel();
box.watchLowerWaterLevel();
setInterval(box.checkWaterCycleDurations, 30000);
  
