var env = require('node-env-file');
var fs = require('fs');

env('.env');

path = function(pathString) {
  return process.cwd() + pathString;
}

src_path = function(pathString) {
  return path('/src/' + pathString);
}

u = require('./utils/utils');

var Box      = require('./box');
var box = new Box({'width': 110, 'depth': 50, 'probeHeight': 45});

box.sendWaterTempMeasure();
box.sendAirTempAndHumMeasure();
box.sendPHMeasure();

setInterval(box.sendWaterTempMeasure, 1200000);
setInterval(box.sendAirTempAndHumMeasure, 1200000);
setInterval(box.sendPHMeasure, 1200000);

box.statusLight();

var gracefullShutdown = function(eventName){
  console.log(eventName + ' received => shutting down the box');
  box.shutdown(function(){
    console.log('Box successfully shut down. Quitting...');
    process.exit(0);
  });
  setTimeout(function() {
   console.error("Could not close everything in time, forcefully shutting down");
   process.exit()
  }, 10*1000);
};

process.on('SIGTERM', function(){
   gracefullShutdown('SIGTERM');
});

process.on('SIGINT', function(){
   gracefullShutdown('SIGINT');
});

process.on('SIGABRT', function(){
   gracefullShutdown('SIGABRT');
});

process.on('SIGQUIT', function(){
  gracefullShutdown('SIGQUIT');
});

fs.watch('/var/log/wtmp', function (event, filename) {
  gracefullShutdown('VAR_LOG_TMP');
});