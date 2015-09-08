var fs = require('fs');
var settingsFile = path('/settings/current-settings.json');
var settings   = require(settingsFile);

var Box = function(tankDimensions) {

  var dimensions = tankDimensions;
  
  var sensors = require('./sensors/sensors');
  var airProbe              = new sensors.AirProbe("P9_15"),
      waterTempProbe        = new sensors.WaterTempProbe("P9_12"),
      upperWaterLevelProbe  = new sensors.WaterLevelProbe('UPPER', 'P8_7'),
      lowerWaterLevelProbe  = new sensors.WaterLevelProbe('LOWER', null),
      waterVolumeProbe      = new sensors.WaterVolumeProbe(dimensions),
      phProbe               = new sensors.PHProbe('P9_36');
  
  var api = require(apiPath());
  
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
  
  this.loadDeviceSettings = function(){
    function addToSettings(element, index, array) {
        settings[element.key] = element.value;
      }
      
    function watchAndUpdateSettings(){
      api.getDeltaSettings(function(result){
        if(result.result.length > 0) { 
          updateSettings(result.result);
          // appeler la methode de traduction de settings en ordres
          }
      });
    }
    
    function processFullUpdate(result){
      updateSettings(result.result)
      // appeler la methode de traduction de settings en ordres
      setInterval(watchAndUpdateSettings, 5000);
    }
    
    function askFullUpdateAgain(error){
      setTimeout(function(){api.getAllSettings(processFullUpdate, askFullUpdateAgain)}, 5000)
    }
    
    function updateSettings(result) {
      result.forEach(addToSettings);
      console.log("settings updated with :");
      console.log(result);
      fs.writeFile(settingsFile, JSON.stringify(settings, null, 2));
    }
    
    //appeler la méthode de traduction avec callback :
    console.log("chargement des settings depuis le fichier :");
    console.log(settings);
    api.getAllSettings(processFullUpdate, askFullUpdateAgain)
  }
  
}

module.exports = Box;