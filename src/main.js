var env = require('node-env-file');
env('.env');

path = function(pathString) {
  return process.cwd() + pathString;
}

var Box      = require('./box');
var box = new Box({'width': 110, 'depth': 50, 'probeHeight': 45});

box.sendWaterTempMeasure();
box.sendAirTempAndHumMeasure();
box.sendPHMeasure();

setInterval(box.sendWaterTempMeasure, 1200000);
setInterval(box.sendAirTempAndHumMeasure, 1200000);
setInterval(box.sendPHMeasure, 1200000);

box.watchUpperWaterLevel();
box.watchUpperWaterOverflow();
box.watchLowerWaterLevel();
box.watchLowerWaterOverflow();
box.statusLight();

setInterval(box.checkWaterCycleDurations, 30000);