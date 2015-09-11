var fs = require('fs');

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
      lowerWaterLevelProbe     = new sensors.WaterLevelProbe('LOWER', null),
      lowerWaterOverflowProbe  = new sensors.WaterOverflowProbe('UPPER', null),
      waterVolumeProbe         = new sensors.WaterVolumeProbe(dimensions),
      phProbe                  = new sensors.PHProbe('P9_36');
  
  var controllers = require('./controllers/controllers');
  
  var upperLights = new controllers.LightController({blue: 'P9_14', red: 'P9_16', white: 'P8_13'});
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
        break;
      case 'sight':
        upperLights.sightLights();
        break;
      default:
        upperLights.growLights(s.upper_blue, s.upper_red, s.upper_white);
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
  
  var overFlowStatuses = {};
  
  var stopPump = function(position, status){
    overFlowStatuses[position] = status;
    
    var stopPump = false;
    Object.keys(overFlowStatuses).forEach(function(level){
      stopPump = (overFlowStatuses[level] == 'overflow');
      if (stopPump == true){ return; }
    });
    return stopPump;
  }
  
  var controlPump = function(position, status){
    if (stopPump(position, status)){
      console.log('ZOOMMGG overflow !!! => Stopping the pump');
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
    /*lowerWaterOverflowProbe.getStatus(controlPump);
    lowerWaterOverflowProbe.watchOverflow(controlPump);*/
  }
  
  this.sendPHMeasure = function() {
    phProbe.getPH(function(phValue) {
      api.sendMeasure('PH', phValue);
    });
  }
  
  settings.load();
  
}

module.exports = Box;