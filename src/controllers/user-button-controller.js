var b = require('bonescript'),
    l = require('../utils/logger');

var UserButtonController = function(buttonPin, ledPin){
  var buttonPin = buttonPin;
  var ledPin    = ledPin;
  b.pinMode(buttonPin, b.INPUT);

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
  	var handleInterrupt = function(x){
          if (x.attached) {
            l.log('info', 'user button click event attached');
          } else {
            if (x.value === 1){
              l.log('info', 'user button - button released');
              callback();
            } else {
              l.log('warn', 'user button - button pressed');
            }
          }
        };
  	b.attachInterrupt(buttonPin, true, b.CHANGE, handleInterrupt);
  }
}

module.exports = UserButtonController;
