var fs = require('fs');

var Box = function(tankDimensions) {

  var dimensions = tankDimensions;
  
  var api = require(apiPath());
  var SettingsManager = require('./settings-manager');
  var settings = new SettingsManager(api);
  
  var sensors = require('./sensors/sensors');
  var airProbe              = new sensors.AirProbe("P9_15"),
      waterTempProbe        = new sensors.WaterTempProbe("P9_12"),
      upperWaterLevelProbe  = new sensors.WaterLevelProbe('UPPER', 'P8_7'),
      lowerWaterLevelProbe  = new sensors.WaterLevelProbe('LOWER', null),
      waterVolumeProbe      = new sensors.WaterVolumeProbe(dimensions),
      phProbe               = new sensors.PHProbe('P9_36');
  
  function apiPath(){
    if (process.env.MOCK_API === 'true') {
      return './api/api_mock'
    } else {
      return './api/api'
    }
  }
  
  this.sendWaterTempMeasure = function (){
    waterTempProbe.getWaterTemp(function(value){
      api.sendMeasure('WTEMP', value);
    });
  }
  
  this.sendAirTempAndHumMeasure = function (){
    airProbe.getAirTempAndHum(function(value){
      api.sendMeasure('ATEMP', value.temp);
      api.sendMeasure('AHUM', value.hum);
    });
  }
  
  this.watchUpperWaterLevel = function(){
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
  
  this.watchLowerWaterLevel = function(){
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
  
  this.checkWaterCycleDurations = function(){
    upperWaterLevelProbe.checkCycleDuration(function(cycleTime, description){
      console.log('sending alert for UPPER waterLevel: cycle time ' + cycleTime + ' is not OK');
      api.sendAlert('UCYC', cycleTime, description);
    });
    /*lowerWaterLevelProbe.checkCycleDuration(function(cycleTime){
       //api.sendAlert('LCYC', cycleTime);
    });*/
  }
  
  this.sendPHMeasure = function() {
    phProbe.getPH(function(phValue) {
      api.sendMeasure('PH', phValue);
    });
  }
  
  settings.load();
  
}

module.exports = Box;