var b = require('bonescript'),
    fs = require('fs'),
    path = require("path");

var OneWireFolder = "/sys/devices/w1_bus_master1/";

//var waterTempProbeId = ;

function printStatus(x) {
  console.log('x.data = ' + x.data);
  console.log('x.err = ' + x.err);
}

function printValue(x){
  console.log(x);
}

function getWaterTempProbeId(callback){
  b.readTextFile('/sys/bus/w1/devices/w1_bus_master1/w1_master_slaves', function(x){
    callback(x.data.substring(0, x.data.length-1));  
  });
}

function getWaterTemp(){
  getWaterTempProbeId(function(probeId){
    console.log("probeId "+ probeId);
    b.readTextFile(OneWireFolder + probeId + '/w1_slave', function(x){
      regexp = /([^t]*)t=([^$]*)/;
      result = regexp.exec(x.data);
      /*console.log('result[2] ' + result[2]);*/
      printValue(parseInt(result[2])/1000);
    });
  });
}

setInterval(getWaterTemp, 1000);