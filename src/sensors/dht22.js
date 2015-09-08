var b    = require('bonescript'),
    exec = require('child_process').exec;

var pythonScript = '/home/risebox/Adafruit_Python_DHT/examples/AdafruitDHT.py';

var AirProbe = function(pin){
  this.pin = pin;
  
  extractTempAndHum = function(sensorOutput) {
    regexp = /Temp=(.[^\s\*]*)(.*)  Humidity=(.[^\s\%]*)/;
    result = regexp.exec(sensorOutput);
    return {temp: parseFloat(result[1]), hum: parseFloat(result[3])};
  }
  
  this.getAirTempAndHum = function(callback) {
    var cmd = pythonScript + ' 22 ' + pin;
    exec(cmd, function(error, stdout, stderr) {
      callback(extractTempAndHum(stdout));
    });
  }
}

module.exports = AirProbe