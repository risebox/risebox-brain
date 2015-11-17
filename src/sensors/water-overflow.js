var b = require('bonescript'),
    l = require('../utils/logger');

var WaterOverflowProbe = function(position, pin){
  const NORMAL = 'normal',
        OVERFLOW = 'overflow';

  console.log('in water_overflow '+position+' pin'+pin);
  this.position = position;
  this.pin = pin;

  b.pinMode(this.pin, b.INPUT);

  this.status = function(value){
    return (value == 0 ? NORMAL : OVERFLOW)
  }

  this.getStatus = function(callback){
    if (this.pin == null) return;

    var that = this;

    var handleStatus = function (x) {
      if (x.value === 0 || x.value === 1){
        l.log('info', 'Water overflow ' + that.position + ' -  level is ' + x.value);
        callback(that.position, that.status(x.value));
      }
    }

    b.digitalRead(this.pin, handleStatus);
  }

  this.watchOverflow = function(callback){
    if (this.pin == null) return;

    var that = this;

    var handleInterrupt = function(x){
      if (x.attached){
        l.log('info', 'Water overflow ' + that.position + ' - attached');
      } else {
        if (x.value === 0 || x.value === 1){
          l.log('info', 'Water overflow ' + that.position + ' - value changed');
          callback(that.position, that.status(x.value));
        }
      }
    };
    b.attachInterrupt(this.pin, true, b.CHANGE, handleInterrupt);
  }

  this.stopWatching = function(){
    b.detachInterrupt(pin);
    l.log("info", 'Water overflow ' + this.position + ' - stop watching');
  }

}

module.exports = WaterOverflowProbe;
