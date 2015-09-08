var fs = require('fs');
var settingsFile = path('/settings/current-settings.json');
var settings   = require(settingsFile);
EventEmitter = require('events').EventEmitter;
var util = require('util');

var SettingsManager = function(api){
  var api = api;
  EventEmitter.call(this);
  var that = this;
  
  this.load = function(){
    this.emit('change', settings);
    api.getAllSettings(processFullUpdate, askFullUpdateAgain)
  }
  
  function addToSettings(element, index, array) {
    settings[element.key] = element.value;
  }
    
  function watchAndUpdateSettings(){
    api.getDeltaSettings(function(result){
      if(result.result.length > 0) { 
        updateSettings(result.result);
          that.emit('change', settings);
        }
    });
  }
  
  function processFullUpdate(result){
    updateSettings(result.result)
    that.emit('change', settings);
    setInterval(watchAndUpdateSettings, 5000);
  }
  
  function askFullUpdateAgain(error){
    setTimeout(function(){api.getAllSettings(processFullUpdate, askFullUpdateAgain)}, 5000)
  }
  
  function updateSettings(result) {
    result.forEach(addToSettings);
    fs.writeFile(settingsFile, JSON.stringify(settings, null, 2));
  }
  
}

util.inherits(SettingsManager, EventEmitter);

module.exports = SettingsManager;