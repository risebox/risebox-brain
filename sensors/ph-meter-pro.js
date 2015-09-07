var b = require('bonescript');

var PHProbe = function(pin){
  this.pin = pin;
  this.PHOffset = 0.15;
  
  this.getPH = function(callback) {
    console.log('this.pin' + this.pin)
    that = this
    b.analogRead(this.pin, function(x){
      callback(that.normalizePH(parseFloat(x.value)));
    });
  }
  
  this.normalizePH = function(ph) {
    return (ph * 5 * 3.5 + this.PHOffset);
  }
}

module.exports = PHProbe