var fs = require('fs');
var settingsFile = path('/settings/current-settings.json');
var settings   = require(settingsFile);

var SettingsManager = function(api){
  var api = api;
  
  this.load = function(){
    //appeler la méthode de traduction avec callback :
    console.log("chargement des settings depuis le fichier :");
    console.log(settings);
    api.getAllSettings(processFullUpdate, askFullUpdateAgain)
  }
  
  function addToSettings(element, index, array) {
    settings[element.key] = element.value;
  }
    
  function watchAndUpdateSettings(){
    api.getDeltaSettings(function(result){
      if(result.result.length > 0) { 
        updateSettings(result.result);
        // appeler la methode de traduction de settings en ordres
        }
    });
  }
  
  function processFullUpdate(result){
    updateSettings(result.result)
    // appeler la methode de traduction de settings en ordres
    setInterval(watchAndUpdateSettings, 5000);
  }
  
  function askFullUpdateAgain(error){
    setTimeout(function(){api.getAllSettings(processFullUpdate, askFullUpdateAgain)}, 5000)
  }
  
  function updateSettings(result) {
    result.forEach(addToSettings);
    console.log("settings updated with :");
    console.log(result);
    fs.writeFile(settingsFile, JSON.stringify(settings, null, 2));
  }
  
}

module.exports = SettingsManager;