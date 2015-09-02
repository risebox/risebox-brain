var api = require(apiPath()),
    wtempProbe = require(sensorPath('ds18b20'));

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

module.exports.sendWaterTempMeasure = sendWaterTempMeasure;