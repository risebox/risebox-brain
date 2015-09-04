var dimensions = {'width': 110, 'depth': 50, 'probeHeight': 45};

var api = require(apiPath()),
    wtempProbe = require(sensorPath('ds18b20')),
    airProbe   = require(sensorPath('dht22')),
    WaterLevelProbe   = require(sensorPath('water_level')),
    upperWaterLevelProbe   = new WaterLevelProbe('UPPER', 'P8_7'),
    lowerWaterLevelProbe   = new WaterLevelProbe('LOWER', null),
    WaterVolumeProbe   = require(sensorPath('hc-sr04')),
    waterVolumeProbe = new WaterVolumeProbe(dimensions);

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

module.exports.sendWaterTempMeasure = sendWaterTempMeasure;
module.exports.sendAirTempAndHumMeasure = sendAirTempAndHumMeasure;
module.exports.watchUpperWaterLevel = watchUpperWaterLevel;
module.exports.watchLowerWaterLevel = watchLowerWaterLevel;
module.exports.checkWaterCycleDurations = checkWaterCycleDurations;