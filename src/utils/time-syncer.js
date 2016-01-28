var exec = require('child_process').exec;

var TimeSyncer = function() {
  var api = require('../api/api');
  
  this.sync = function(){
    if (isWebAvailable()) {
      console.log("Web is available will sync");
      ntpSync();
      setTimeout(sync, 10*60*1000);
    } else {
      console.log("No Web so No time sync possible will try again in 10 secs");
      setTimeout(sync, 10*1000);
    }
  }

  var ntpSync = function(){
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

  var isWebAvailable = function(){
    http.get('http://www.google.com/index.html', (res) => {
      if (res.statusCode == 200) {
        return true;
      } else {
        console.log("Web is not available - got http code: ${res.statusCode}");
        return false;
      }
    }).on('error', (e) => {
      console.log("Web is not available: got error with message ${e.message}");
      return false;
    });
  }
}

module.exports = TimeSyncer
