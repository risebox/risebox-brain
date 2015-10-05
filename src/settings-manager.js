var fs = require('fs');
var settingsFile = path('/settings/current-settings.json');
var settings   = require(settingsFile);
EventEmitter = require('events').EventEmitter;
var util = require('util');
var l = require('./utils/logger');

var SettingsManager = function(api){
  var api = api;
  EventEmitter.call(this);
  var that = this;
  
  this.load = function(){
    this.emit('change');
    this.emit('process', settings);
    api.getAllSettings(processFullUpdate, askFullUpdateAgain)
  }
  
  function addToSettings(element, index, array) {
    settings[element.key] = element.value;
  }
    
  function watchAndUpdateSettings(){
    api.getDeltaSettings(function(result){
      if(result.result.length > 0) { 
        updateSettings(result.result);
        that.emit('change');
      }
      that.emit('process', settings);
    });
  }
  
  function processFullUpdate(result){
    updateSettings(result.result)
    that.emit('change');
    that.emit('process', settings);
    setInterval(watchAndUpdateSettings, 5000);
  }
  
  function askFullUpdateAgain(error){
    setTimeout(function(){api.getAllSettings(processFullUpdate, askFullUpdateAgain)}, 5000)
  }
  
  function updateSettings(result) {
    result.forEach(addToSettings);
    fs.writeFile(settingsFile, JSON.stringify(settings, null, 2), function(err){
      if (err){
        l.log('error', 'SettingsManager - could not update settings file');
      }
      l.log('info', 'SettingsManager - settings file successfully updated');
    });
  }
  
}

util.inherits(SettingsManager, EventEmitter);

module.exports = SettingsManager;