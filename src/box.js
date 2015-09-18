var fs = require('fs');
var b = require('bonescript');

var Box = function(tankDimensions) {

  var dimensions = tankDimensions;
  
  var api = require(apiPath());
  var SettingsManager = require('./settings-manager');
  var settings = new SettingsManager(api);
  
  settings.on('change', function(){
    console.log('settings were changed');
  });
  
  settings.on('process', function(settings){
    applySettingsChanges(settings);
  });
  
  var sensors = require('./sensors/sensors');
  var airProbe                 = new sensors.AirProbe("P9_15"),
      waterTempProbe           = new sensors.WaterTempProbe("P9_12"),
      upperWaterLevelProbe     = new sensors.WaterLevelProbe('UPPER', 'P8_7'),
      upperWaterOverflowProbe  = new sensors.WaterOverflowProbe('UPPER', 'P8_8'),
      lowerWaterLevelProbe     = new sensors.WaterLevelProbe('LOWER', 'P8_9'),
      lowerWaterOverflowProbe  = new sensors.WaterOverflowProbe('LOWER', 'P8_10'),
      waterVolumeProbe         = new sensors.WaterVolumeProbe(dimensions),
      phProbe                  = new sensors.PHProbe('P9_23', 'P9_36');
  
  var controllers = require('./controllers/controllers');
  
  var upperLights = new controllers.LightController({blue: 'P8_36', red: 'P8_45', white: 'P8_46'});
  var lowerLights = new controllers.LightController({blue: 'P9_29', red: 'P9_31', white: 'P9_42'});
  var pump        = new controllers.PumpController('P8_16');
  var fan         = new controllers.FanController('P8_15');
  
  function applySettingsChanges(s){
    now = new Date();
    allWhiteDate = Date.parse(s.all_white_until);
    noLightsDate = Date.parse(s.no_lights_until);
    thisMoment = now.getHours() + now.getMinutes() / 60;
    dayStart = s.day_hours + s.day_minutes / 60;
    dayEnd = s.night_hours + s.night_minutes / 60;
    silentDate = Date.parse(s.silent_until);
    currentHourlyRatio = now.getMinutes() / 60;
    
    if(noLightsDate > now) { 
      lightMode = 'dark';
    }
    else {
      if(allWhiteDate > now) {
        lightMode = 'sight';
      }
      else {
        if(thisMoment >= dayStart && thisMoment <= dayEnd) {
          lightMode = 'grow';
        }
        else {
          lightMode = 'dark';
        }
      }
    }
    
    console.log('lightMode ' + lightMode);
    switch (lightMode) {
      case 'dark':
        upperLights.noLights();
        lowerLights.noLights();
        break;
      case 'sight':
        upperLights.sightLights();
        lowerLights.sightLights();
        break;
      default:
        upperLights.growLights(s.upper_blue, s.upper_red, s.upper_white);
        lowerLights.growLights(s.lower_blue, s.lower_red, s.lower_white);
    }
    
    if (now < silentDate){
      pump.stop();
      fan.stop();
    } else {
      if (currentHourlyRatio <= s.fan_duty_ratio){
        fan.start();
      } else {
        fan.stop();
      }
    }
  }
  
  function apiPath(){
    if (process.env.MOCK_API === 'true') {
      return './api/api_mock'
    } else {
      return './api/api'
    }
  }
  
  this.statusLight = function (){
    b.analogWrite('P8_34', 0.5, 2000, function(x){
      console.log('statusLight ' + JSON.stringify(x));
    });
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
    }, function(error){
      api.sendLog(error);
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
    lowerWaterLevelProbe.checkCycleDuration(function(cycleTime, description){
       api.sendAlert('LCYC', cycleTime, description);
    });
  }
  
  var overFlowStatuses = {};
  
  var stopPump = function(position, status){
    overFlowStatuses[position] = status;
    
    var stopPump = false;
    for (var key in overFlowStatuses) {
      stopPump = (overFlowStatuses[key] == 'overflow');
      if (stopPump == true){ 
        break;
      }
    }
    
    return stopPump;
  }
  
  var controlPump = function(position, status){
    if (stopPump(position, status)){
      console.log('warn', 'ZOOMMGG overflow !!! => Stopping the pump');
      pump.stop();
    } else {
      console.log('No overflow => Starting the pump');
      pump.start();
    }
  }
  
  this.watchUpperWaterOverflow = function(){
    upperWaterOverflowProbe.getStatus(controlPump);
    upperWaterOverflowProbe.watchOverflow(controlPump);
  }
  
  this.watchLowerWaterOverflow = function(){
    lowerWaterOverflowProbe.getStatus(controlPump);
    lowerWaterOverflowProbe.watchOverflow(controlPump);
  }
  
  this.sendPHMeasure = function() {
    phProbe.getPH(function(phValue) {
      api.sendMeasure('PH', phValue);
    },function(errorMsg){
      api.sendLog('PH', errorMsg);
    });
  }
  
  settings.load();
}

module.exports = Box;