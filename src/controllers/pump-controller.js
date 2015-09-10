var b = require('bonescript');

var PumpController = function(pin){
  var pin = pin;
  
  var setPinMode = function(){
    b.pinMode(pin, b.OUTPUT);
  }
  
  this.stop = function(){
    setPinMode();
    b.digitalWrite(pin, b.HIGH);
  }
  
  this.start = function(){
    setPinMode();
    b.digitalWrite(pin, b.LOW);
  }
}

module.exports = PumpController;