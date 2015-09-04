var env = require('node-env-file');
env(__dirname + '/.env');

var box      = require('./box'),
    overlays = require('./overlays');

overlays.init(function() {
  setInterval(box.sendWaterTempMeasure, 10000);
  setInterval(box.sendAirTempAndHumMeasure, 1000);

  box.watchUpperWaterLevel();
  box.watchLowerWaterLevel();
  setInterval(box.checkWaterCycleDurations, 1000);  
});