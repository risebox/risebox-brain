var api = require(apiPath()),
    wtempProbe = require(sensorPath('ds18b20')),
    airProbe   = require(sensorPath('dht22')),
    WaterLevelProbe   = require(sensorPath('water_level')),
    upperWaterLevelProbe   = new WaterLevelProbe('UPPER', 'P8_7'),
    lowerWaterLevelProbe   = new WaterLevelProbe('LOWER', null);

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
  upperWaterLevelProbe.watchCycle(function(cycleTime){
    console.log('computed duration: ' + cycleTime);
    //api.sendMeasure('UCYC', cycleTime);
  });
}

var watchLowerWaterLevel = function(){
  lowerWaterLevelProbe.watchCycle(function(cycleTime){
    //api.sendMeasure('LCYC', cycleTime);
  });
}

module.exports.sendWaterTempMeasure = sendWaterTempMeasure;
module.exports.sendAirTempAndHumMeasure = sendAirTempAndHumMeasure;
module.exports.watchUpperWaterLevel = watchUpperWaterLevel;
module.exports.watchLowerWaterLevel = watchLowerWaterLevel;