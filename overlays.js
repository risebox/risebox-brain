var exec = require('child_process').exec;

var slotsFile = '/sys/devices/bone_capemgr.9/slots';

function init(callback) {
  if (process.env.MOCK_SENSORS != true){
    ensureOverlayLoaded('BB-W1', function(){
      ensureOverlayLoaded('hcsr04', function(){
          callback();
      });  
    });
  }
}

function ensureOverlayLoaded(sensorCode, callback){
  checkOverlayLoaded(sensorCode, function(loaded){
    if (loaded !== true) {
      loadOverlay(sensorCode, callback);
    }
    callback();
  })
};

function loadOverlay(sensorCode, callback){
  console.log('Overlay ' + sensorCode + ' not loaded => loading...');
  var cmd = 'echo ' + sensorCode + ' > ' + slotsFile;
  exec(cmd , function(error, stdout, stderr) {
    console.log('done loading overlay');
    callback();
  });
};

function checkOverlayLoaded(sensorCode, callback){
  var cmd = 'cat ' + slotsFile + ' | grep ' + sensorCode
  exec(cmd , function(error, stdout, stderr) {
    callback(stdout.length > 0);
  });
}

module.exports.init = init;