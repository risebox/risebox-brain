var b    = require('bonescript'),
    exec = require('child_process').exec,
    l    = require('../utils/logger');

var WaterVolumeProbe = function(dimensions){
  var probeScript = './lib/hcr.sh';
  this.dimensions = dimensions
  
  function averageDistance(sensorOutput) {
    regexp = /Distance = ([\d|\.]*)/g;
    total = 0;
    count = 0;
    console.log('sensorOutput '+sensorOutput);
    while (match = regexp.exec(sensorOutput)) {
      console.log('match[1]' + match[1]);
      total = total + parseFloat(match[1]);
      count = count + 1;
    }
    return total / count;
  }
  
  function volumeFromDistance(waterSurfaceDistance){
    volume = (dimensions.probeHeight - waterSurfaceDistance) * dimensions.width * dimensions.depth / 1000;
    return volume
  }
  
  this.getVolume = function(successCb, errorCb){
    exec(probeScript, function(error, stdout, stderr){
      console.log('error '+error);
      console.log('stderr '+stderr);
      console.log('stdout '+stdout);
      if (error == null) {
        waterVolume = volumeFromDistance(averageDistance(stdout));
        successCb(waterVolume);
      } else {
        l.log('error', 'Could not measure water volume');
        errorCb(error);
      }
    });
  }
}

module.exports = WaterVolumeProbe
