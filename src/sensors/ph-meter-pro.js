var b = require('bonescript');

var PHProbe = function(powerPin, analogPin){
  this.analogPin = analogPin;
  this.powerPin = powerPin;
  b.pinMode(this.powerPin, b.OUTPUT);
  this.PHOffset = 0.15;
  
  this.getPH = function(callback) {
    var that = this;
    b.digitalWrite(this.powerPin, b.HIGH, function(x){
      setTimeout(function(){
        b.analogRead(that.analogPin, function(x){
          callback(that.normalizePH(parseFloat(x.value)));
          console.log('ok shut down probe');
          b.digitalWrite(that.powerPin, b.LOW);
        });
      }, 2000);
    });
  }
  
  this.normalizePH = function(ph) {
    console.log('computing ph');
    return (ph * 5 * 3.5 + this.PHOffset);
  }
}

module.exports = PHProbe