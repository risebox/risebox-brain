var fs = require('fs'),
    b = require('bonescript'),
    l = require('./utils/logger');

var Box = function(tankDimensions) {

  var dimensions = tankDimensions;
  
  var api = require(apiPath());
  var SettingsManager = require('./settings-manager');
  var settings = new SettingsManager(api);
  
  settings.on('change', function(){
    l.log('info', 'SettingsManager - Settings were changed');
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
    l.log('info', 'SettingsManager - Applying settings');
    
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
    
    l.log('info', 'SettingsManager - Light is ' + lightMode);
    
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
      l.log('info', 'SettingsManager - Applying silent Mode');
      pump.stop();
      fan.stop();
    } else {
      if (currentHourlyRatio <= s.fan_duty_ratio){
        l.log('info', 'SettingsManager - Fans on duty');
        fan.start();
      } else {
        l.log('info', 'SettingsManager - Fans off duty');
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
      if (x.data){
        l.log('info', 'StatusLight - ' + JSON.stringify(x)); 
      } else {
        l.log('error', 'StatusLight - Error ' + x.err); 
      }
    });
  }
  
  this.sendWaterTempMeasure = function (){
    waterTempProbe.getWaterTemp(function(value){
      api.sendMeasure('WTEMP', value);
    }, function(error){
      api.sendLog('error', error);
    });
  }
  
  this.sendAirTempAndHumMeasure = function (){
    airProbe.getAirTempAndHum(function(value){
      api.sendMeasure('ATEMP', value.temp);
      api.sendMeasure('AHUM', value.hum);
    }, function(error){
      api.sendLog('error', error);
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
          }, function(error){
            api.sendLog('error', error);
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
          }, function(error){
            api.sendLog('error', error);
          });
        }
      }
      api.sendMeasure('LCYC', cycleTime);
    });
  }
  
  this.checkWaterCycleDurations = function(){
    upperWaterLevelProbe.checkCycleDuration(function(cycleTime, description){
      l.log('warning', 'checkWaterCycleDurations - Alert for UPPER waterLevel: cycle time ' + cycleTime + ' is not OK');
      api.sendAlert('UCYC', cycleTime, description);
    });
    lowerWaterLevelProbe.checkCycleDuration(function(cycleTime, description){
      l.log('warning', 'checkWaterCycleDurations - Alert for LOWER waterLevel: cycle time ' + cycleTime + ' is not OK');
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
      l.log('warning', 'controlPump - Overflow => Stopping the pump');
      pump.stop();
      api.sendLog('warning', 'controlPump - Overflow => Stopping the pump');
    } else {
      l.log('info', 'controlPump - No Overflow => Starting the pump');
      pump.start();
      api.sendLog('info', 'controlPump - No Overflow => Starting the pump');
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
      api.sendLog('error', errorMsg);
    });
  }
  
  settings.load();
  api.sendLog('info', 'Box - Started');
}

module.exports = Box;