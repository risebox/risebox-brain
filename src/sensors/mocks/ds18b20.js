var b = require('bonescript');
    
var WaterTempProbe = function(pin){
  this.getWaterTemp = function(callback){
    b.readTextFile(__dirname + '/fixtures/ds18b20.txt', function(x){
      callback(parseInt(x.data.substring(0, x.data.length-1))/1000);
    });
  }
}

module.exports = WaterTempProbe;
