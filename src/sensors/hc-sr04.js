var b    = require('bonescript'),
    exec = require('child_process').exec;

var WaterVolumeProbe = function(dimensions){
  var probeScript = './lib/hcr.sh';
  this.dimensions = dimensions
  
  function averageDistance(sensorOutput) {
    
    regexp = /Distance = ([\d|\.]*)/g;
    total = 0;
    count=0;
    
    while (match = regexp.exec(sensorOutput)) {
      total = total + parseFloat(match[1]);
      count = count + 1;
    }
    
    return total / count;
  }
  
  function volumeFromDistance(waterSurfaceDistance){
    volume = (dimensions.probeHeight - waterSurfaceDistance) * dimensions.width * dimensions.depth / 1000;
    return volume
  }
  
  this.getVolume = function(callback){
    exec(probeScript, function(error, stdout, stderr){
      waterVolume = volumeFromDistance(averageDistance(stdout));
      callback(waterVolume);
    });
  }
}

module.exports = WaterVolumeProbe