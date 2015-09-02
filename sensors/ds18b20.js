var b = require('bonescript'),
    OneWireFolder = "/sys/devices/w1_bus_master1/";

function getWaterTempProbeId(callback){
  b.readTextFile('/sys/bus/w1/devices/w1_bus_master1/w1_master_slaves', function(x){
    callback(x.data.substring(0, x.data.length-1));  
  });
}

var getWaterTemp = function(callback){
  getWaterTempProbeId(function(probeId){
    console.log("probeId "+ probeId);
    b.readTextFile(OneWireFolder + probeId + '/w1_slave', function(x){
      regexp = /([^t]*)t=([^$]*)/;
      result = regexp.exec(x.data);
      /*console.log('result[2] ' + result[2]);*/
      callback(parseInt(result[2])/1000);
    });
  });
}

module.exports.getWaterTemp = getWaterTemp;
