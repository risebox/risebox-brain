var b  = require('bonescript'),
    fs = require('fs'),
    l  = require('../utils/logger');

var LightController = function(pins){
  var bluePin = pins.blue;
  var redPin  = pins.red;
  var whitePin  = pins.white;
  var currentLights = [];
  
  this.growLights = function(blue, red, white){
    l.log('info', 'Lights - setting Grow Mode');
    max = Math.max(blue, red, white);
    setLights(blue/max, red/max, white/max);
  } 
  
  this.sightLights = function(){
    l.log('info', 'Lights - setting Sight Mode');
    setLights(0, 0, 1);
  }
  
  this.noLights = function(){
    l.log('info', 'Lights - setting No lights Mode');
    setLights(0, 0, 0);
  }
  
  function setLights(blue, red, white){
    if(anythingToChange(blue, red, white)) {
      l.log('info', 'Lights : change recipe to B ' + blue + ' R ' + red + ' W ' + white);
      b.analogWrite(bluePin, blue, 2000, printJSON);
      b.analogWrite(redPin, red, 2000, printJSON);
      b.analogWrite(whitePin, white, 2000, printJSON);
      currentLights = [blue, red, white];
    }
  }
  
  function anythingToChange(blue, red, white){
    newLights = [blue, red, white];
    var i = newLights.length;
    if (i != currentLights.length) return true;
    while (i--) {
        if (newLights[i] !== currentLights[i]) return true;
    }
    return false;
  }
  
  function printJSON(x) {
    l.log(JSON.stringify(x));
  }
}

module.exports = LightController;