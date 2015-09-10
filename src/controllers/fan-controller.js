var b = require('bonescript');

var FanController = function(pin){
  var pin = pin;
  
  var setPinMode = function(){
    b.pinMode(pin, b.OUTPUT);
  }
  
  this.stop = function(){
    setPinMode();
    b.digitalWrite(pin, b.LOW);
  }
  
  this.start = function(){
    setPinMode();
    b.digitalWrite(pin, b.HIGH);
  }
}

module.exports = FanController;