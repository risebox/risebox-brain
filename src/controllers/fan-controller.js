var b = require('bonescript'),
    l = require('../utils/logger');

var FanController = function(pin){
  var pin = pin;
  
  var setPinMode = function(){
    b.pinMode(pin, b.OUTPUT);
  }
  
  this.stop = function(){
    setPinMode();
    b.digitalWrite(pin, b.LOW, function(x){
      if (x.err){
        l.log('error', 'Fans - could not stop the fans'); 
      }
    });
  }
  
  this.start = function(){
    setPinMode();
    b.digitalWrite(pin, b.HIGH, function(x){
      if (x.err){
        l.log('error', 'Fans - could not start the fans'); 
      }
    });
  }
}

module.exports = FanController;