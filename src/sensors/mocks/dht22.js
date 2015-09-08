var b = require('bonescript');

var AirProbe = function(pin){    
  this. getAirTempAndHum = function(callback){
    b.readTextFile(__dirname + '/fixtures/dht22.txt', function(x){
      regexp = /Temp=(.[^\s\*]*)(.*)  Humidity=(.[^\s\%]*)/;
      result = regexp.exec(x.data);
      callback({temp: parseFloat(result[1]), hum: parseFloat(result[3])});
    });
  }
}

module.exports = AirProbe;
