var b = require('bonescript');
var fs = require('fs');

var LightController = function(pins){
  var bluePin = pins.blue;
  var redPin  = pins.red;
  var whitePin  = pins.white;
  var currentLights = [];
  
  this.growLights = function(blue, red, white){
    max = Math.max(blue, red, white);
    setLights(blue/max, red/max, white/max);
  } 
  
  this.sightLights = function(){
    console.log("in sightLights");
    setLights(0, 0, 1);
  }
  
  this.noLights = function(){
    setLights(0, 0, 0);
  }
  
  function setLights(blue, red, white){
    if(anythingToChange(blue, red, white)) {
      console.log('Change lights : B ' + blue + ' R ' + red + ' W ' + white);
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
      console.log(JSON.stringify(x));
    }
}

module.exports = LightController;
