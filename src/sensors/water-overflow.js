var b = require('bonescript');

var WaterOverflowProbe = function(position, pin){
  this.position = position;
  this.pin = pin;
  
  this.status = function(value){
    return (value == 0 ? 'normal' : 'overflow')
  }
  
  this.getStatus = function(callback){
    if (this.pin == null) return;
    
    b.pinMode(this.pin, b.INPUT);
    var that = this;
    
    var handleStatus = function (x) {
      if (x.value === 0 || x.value === 1){
        console.log('Water overflow value at ' + that.position + " level is " + x.value);
        callback(that.status(x.value));
      }
    }
    
    b.digitalRead(this.pin, handleStatus);
  }
  
  this.watchOverflow = function(callback){
    if (this.pin == null) return;
    
    b.pinMode(this.pin, b.INPUT);
    console.log('I\'m watching ' + this.position + " water overflow");
    var that = this;
    
    var handleInterrupt = function(x){
      if (x.attached){
        console.log('Water overflow attached at ' + that.position + " level");
      } else {
        if (x.value === 0 || x.value === 1){
          console.log('Water overflow value changed at ' + that.position + " level");
          callback(that.status(x.value));
        }
      }
    };
    b.attachInterrupt(this.pin, true, b.CHANGE, handleInterrupt);
  }
  
  this.stopWatching = function(){
    b.detachInterrupt(pin);
    console.log('Overflow detached');
  }
  
}

module.exports = WaterOverflowProbe;