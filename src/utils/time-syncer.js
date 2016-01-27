var exec = require('child_process').exec;

var TimeSyncer = function() {
  var api = require('../api/api');
  
  this.sync = function(){
   now = new Date();
   api.sendLog('info', 'Before sync now is ' + now);
   exec('ntpdate -s 0.fr.pool.ntp.org', function(error, stdout, stderr) {
    if (error == null) {
      api.sendLog('info', 'System time setup with ntpdate');
      now = new Date();
      api.sendLog('info', 'After sync now is ' + now);
    } else {
      api.sendLog('error', 'Could not update system time with ntpdate');
    }
   });
  }
}

module.exports = TimeSyncer
