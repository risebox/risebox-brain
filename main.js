var b     = require('bonescript'),
    fs    = require('fs'),
    querystring = require('querystring'),
    path  = require('path'),
    https = require('https'),
    env   = require('node-env-file');

var OneWireFolder = "/sys/devices/w1_bus_master1/";

env(__dirname + '/.env');

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
      sendMeasure('WTEMP', parseInt(result[2])/1000);
    });
  });
}

function sendMeasure(metricKey, value){
  var postData = querystring.stringify({
    'value' : value
  });
  
  var options = {
    hostname: 'rbdev-api.herokuapp.com',
    path: '/api/devices/' + process.env.RISEBOX_KEY + '/metrics/' + metricKey + '/measures',
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'RISEBOX-SECRET': process.env.RISEBOX_SECRET
    }
  };
  
  var req = https.request(options, function(res) {
    console.log('STATUS: ' + res.statusCode);
    console.log('HEADERS: ' + JSON.stringify(res.headers));
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
      console.log('BODY: ' + chunk);
    });
  });
  
  req.on('error', function(e) {
    console.log('problem with request: ' + e.message);
  });
  
  // write data to request body
  req.write(postData);
  req.end();
}

setInterval(getWaterTemp, 1000);