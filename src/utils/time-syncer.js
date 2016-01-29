var exec = require('child_process').exec;
var http = require('http');

var TimeSyncer = function() {
  var api = require('../api/api');
  
  this.sync = function(){
    // ifWebAvailable(function(){
    //   console.log("Web is available will sync");
      ntpSync();
    //   setTimeout(this.sync, 10*60*1000);
    // },function(){
    //   console.log("No Web so No time sync possible will try again in 10 secs");
    //   setTimeout(this.sync, 10*1000);
    // });
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

  var ifWebAvailable = function(successCb, errorCb){
    http.get('http://risebox-api.herokuapp.com', function(res) {
      successCb();
    }).on('error', function(e) {
      console.log("Web is not available: got error with message " + e.message);
      errorCb();
    });
  }
}

module.exports = TimeSyncer
