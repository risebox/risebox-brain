var b = require('bonescript');

var WaterLevelProbe = function(position, pin){
  this.position = position;
  this.pin = pin;

  this.watchCycle = function(callback){
    if (this.pin == null) return;
    
    b.pinMode(this.pin, b.INPUT);
    console.log('I\'m watching ' + this.position + " level" + " on pin " + this.pin);
    that = this;
    
    var handleInterrupt = function(x){
      if (x.attached){
        console.log('Attachment done at ' + that.position + " level");
      } else {
        if (x.value === 0 || x.value === 1){
          console.log('Value changed at ' + that.position + " level");
          callback(x.value);
        }
      }
    };

    b.attachInterrupt(this.pin, true, b.CHANGE, handleInterrupt);
  }
  
  this.stopWatching = function(){
    b.detachInterrupt(pin);
    console.log('Interrupt detached');
  }
  
}

module.exports = WaterLevelProbe