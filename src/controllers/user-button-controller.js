var b = require('bonescript'),
    l = require('../utils/logger');

var UserButtonController = function(buttonPin, ledPin){
  var buttonPin = buttonPin;
  var ledPin    = ledPin;
  
  this.lightUp = function(){
  	b.analogWrite(ledPin, 0.5, 2000, function(x){
      if (x.data){
        l.log('info', 'StatusLight - ' + JSON.stringify(x));
      } else {
        l.log('error', 'StatusLight - Error ' + x.err);
      }
    });
  }

  this.onShortClick = function(callback){
  	b.attachInterrupt(buttonPin, true, b.CHANGE, callback);
  }


}