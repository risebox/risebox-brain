var b = require('bonescript');

var LightController = function(pins){
  var bluePin = pins.blue;
  var redPin  = pins.red;
  var whitePin  = pins.white;
  
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
    b.analogWrite(bluePin, blue, 2000, printJSON);
    b.analogWrite(redPin, red, 2000, printJSON);
    b.analogWrite(whitePin, white, 2000, printJSON);
  }
  
  function printJSON(x) { 
      console.log("color "+x.value+ " set");
    }
}

module.exports = LightController;
