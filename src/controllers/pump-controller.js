var b = require('bonescript');

var PumpController = function(pin){
  var pin = pin;

  var setPinMode = function(){
    b.pinMode(pin, b.OUTPUT);
  }

  this.stop = function(){
    setPinMode();
    b.digitalWrite(pin, b.HIGH, function(x){
      if (x.err){
        l.log('error', 'Pump - could not stop the pump');
      }
    });
  }

  this.start = function(){
    setPinMode();
    b.digitalWrite(pin, b.LOW, function(x){
      if (x.err){
        l.log('error', 'Pump - could not start the pump');
      }
    });
  }
}

module.exports = PumpController;