var api = require('./api'),
    wtempProbe = require('./sensors/ds18b20');

var sendWaterTempMeasure = function (){
  wtempProbe.getWaterTemp(function(value){
    api.sendMeasure('WTEMP', value);
  });
}

module.exports.sendWaterTempMeasure = sendWaterTempMeasure;