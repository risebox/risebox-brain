var b    = require('bonescript'),
    exec = require('child_process').exec;

var pin = "P9_15",
    pythonScript = '/home/risebox/Adafruit_Python_DHT/examples/AdafruitDHT.py';


function extractTempAndHum(sensorOutput) {
  regexp = /Temp=(.[^\s\*]*)(.*)  Humidity=(.[^\s\%]*)/;
  result = regexp.exec(sensorOutput);
  return {temp: parseFloat(result[1]), hum: parseFloat(result[3])};
}

function getAirTempAndHum(callback) {
  var cmd = pythonScript + ' 22 ' + pin;
  exec(cmd, function(error, stdout, stderr) {
    callback(extractTempAndHum(stdout));
  });
}

module.exports.getAirTempAndHum = getAirTempAndHum;