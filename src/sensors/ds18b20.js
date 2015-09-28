var b = require('bonescript'),
    l = require('../utils/logger');

var WaterTempProbe = function(pin){
  var OneWireFolder = "/sys/devices/w1_bus_master1/",
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
      if (x.data){
        _probeId = x.data.substring(0, x.data.length-1)
        callback(_probeId);
      } else {
        l.log('error', 'Could not write OneWire temperature file');
      }
    });
  }
  
  function extractTempFromW1FileContent(fileContent){
    regexp = /([^t]*)t=([^$]*)/;
    result = regexp.exec(fileContent);
    return parseInt(result[2])/1000;
  }
  
  this.getWaterTemp = function(successCb, errorCb){
    getProbeId(function(probeId){
      b.readTextFile(OneWireFolder + probeId + '/w1_slave', function(x){
        if (x.data){
          successCb(extractTempFromW1FileContent(x.data));
        } else {
          l.log('error', 'Could not read temperature');
          errorCb();
        }
      });
    });
  }
}

module.exports = WaterTempProbe;
