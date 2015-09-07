var events = require('events');

var dimensions = {'width': 110, 'depth': 50, 'probeHeight': 45};
var settings   = {};
var settingsNotifier = new events.EventEmitter();


var api = require(apiPath()),
    wtempProbe = require(sensorPath('ds18b20')),
    airProbe   = require(sensorPath('dht22')),
    WaterLevelProbe   = require(sensorPath('water_level')),
    upperWaterLevelProbe   = new WaterLevelProbe('UPPER', 'P8_7'),
    lowerWaterLevelProbe   = new WaterLevelProbe('LOWER', null),
    WaterVolumeProbe   = require(sensorPath('hc-sr04')),
    waterVolumeProbe = new WaterVolumeProbe(dimensions),
    PHProbe = require(sensorPath('ph-meter-pro')),
    phProbe = new PHProbe('P9_36');

function sensorPath(sensorName){
  if (process.env.MOCK_SENSORS === 'true') {
    return './sensors/mocks/' + sensorName
  } else {
    return './sensors/' + sensorName
  }
}

function apiPath(){
  if (process.env.MOCK_API === 'true') {
    return './api_mock'
  } else {
    return './api'
  }
}

var sendWaterTempMeasure = function (){
  wtempProbe.getWaterTemp(function(value){
    api.sendMeasure('WTEMP', value);
  });
}

var sendAirTempAndHumMeasure = function (){
  airProbe.getAirTempAndHum(function(value){
    api.sendMeasure('ATEMP', value.temp);
    api.sendMeasure('AHUM', value.hum);
  });
}

var watchUpperWaterLevel = function(){
  upperWaterLevelProbe.watchCycle(function(cycleTime, direction){
    if (direction == 'down'){
      now = parseInt(Date.now()/1000);
      lastLowerFlush = lowerWaterLevelProbe.lastFlushTime();
      if (now - lastLowerFlush < 60){
        waterVolumeProbe.getVolume(function(volume){
          api.sendMeasure('WVOL', volume);
        });
      }
    }
    api.sendMeasure('UCYC', cycleTime);
  });
}

var watchLowerWaterLevel = function(){
  lowerWaterLevelProbe.watchCycle(function(cycleTime, direction){
    if (direction == 'down'){
      now = parseInt(Date.now()/1000);
      lastUpperFlush = upperWaterLevelProbe.lastFlushTime();
      if (now - lastUpperFlush < 60){
        waterVolumeProbe.getVolume(function(volume){
          api.sendMeasure('WVOL', volume);
        });
      }
    }
    api.sendMeasure('LCYC', cycleTime);
  });

}

var checkWaterCycleDurations = function(){
  upperWaterLevelProbe.checkCycleDuration(function(cycleTime, description){
    console.log('sending alert for UPPER waterLevel: cycle time ' + cycleTime + ' is not OK');
    api.sendAlert('UCYC', cycleTime, description);
  });
  /*lowerWaterLevelProbe.checkCycleDuration(function(cycleTime){
     //api.sendAlert('LCYC', cycleTime);
  });*/
}

var sendPHMeasure = function() {
  phProbe.getPH(function(phValue) {
    api.sendMeasure('PH', phValue);
  });
}

var loadDeviceSettings = function(){
  function addToSettings(element, index, array) {
      settings[element.key] = element.value;
    }
    
  function watchAndUpdateSettings(){
    api.getDeltaSettings(function(result){
      if(result.result.length > 0) {
        result.result.forEach(addToSettings);
        settingsNotifier.emit('settingsUpdate');
      }
    });
  }
  api.getAllSettings(function(result){
    result.result.forEach(addToSettings);
    settingsNotifier.emit('settingsUpdate');
    setInterval(watchAndUpdateSettings, 5000);
  });
}

var initLightingSystem = function(){
  settingsNotifier.on('settingsUpdate', function(){
    console.log('something was updated, lets recompute all lights to be sure !');
  });
}

module.exports.sendWaterTempMeasure = sendWaterTempMeasure;
module.exports.sendAirTempAndHumMeasure = sendAirTempAndHumMeasure;
module.exports.watchUpperWaterLevel = watchUpperWaterLevel;
module.exports.watchLowerWaterLevel = watchLowerWaterLevel;
module.exports.checkWaterCycleDurations = checkWaterCycleDurations;
module.exports.sendPHMeasure = sendPHMeasure;
module.exports.loadDeviceSettings = loadDeviceSettings;
module.exports.initLightingSystem = initLightingSystem;