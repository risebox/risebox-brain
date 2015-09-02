var b = require('bonescript'),
    OneWireFolder = "/sys/devices/w1_bus_master1/",
    _probeId = null;
    
function getProbeId(callback){
  if (_probeId === undefined || _probeId === null) {
    setProbeId(callback);
  } else {
    callback(_probeId);
  }
}

function setProbeId(callback){
  b.readTextFile('/sys/bus/w1/devices/w1_bus_master1/w1_master_slaves', function(x){
    _probeId = x.data.substring(0, x.data.length-1)
    callback(_probeId);  
  });
}

function extractTempFromW1FileContent(fileContent){
  regexp = /([^t]*)t=([^$]*)/;
  result = regexp.exec(fileContent);
  return parseInt(result[2])/1000;
}

var getWaterTemp = function(callback){
  getProbeId(function(probeId){
    b.readTextFile(OneWireFolder + probeId + '/w1_slave', function(x){
       callback(extractTempFromW1FileContent(x.data));
    });
  });
}

module.exports.getWaterTemp = getWaterTemp;
