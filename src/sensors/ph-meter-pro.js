var b = require('bonescript'),
    l = require('../utils/logger');

var PHProbe = function(powerPin, analogPin){
  this.analogPin = analogPin;
  this.powerPin = powerPin;
  b.pinMode(this.powerPin, b.OUTPUT);
  this.PHOffset = 0.15;
  
  this.getPH = function(successCb, errorCb) {
    var that = this;
    b.digitalWrite(this.powerPin, b.HIGH, function(x){
      setTimeout(function(){
        b.analogRead(that.analogPin, function(x){
          if (x.value) {
            l.log('info', 'Raw PH retrieved ' + x.value);
            successCb(that.normalizePH(parseFloat(x.value)));
          } else {
            errorCb(x.err);
          }
          l.log('info','PH retrieved, will shut down probe');
          b.digitalWrite(that.powerPin, b.LOW, function(x){
            if (x.err) {
              errorCb(x.err); 
            }
          });
        });
      }, 2000);
    });
  }
  
  this.normalizePH = function(ph) {
    l.log('info', 'Computing PH');
    return (ph * 5 * 3.5 + this.PHOffset);
  }
}

module.exports = PHProbe