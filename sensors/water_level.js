var b = require('bonescript');

var WaterLevelProbe = function(position, pin){
  this.position = position;
  this.pin = pin;
  this.lastLevels = {};
  
  this.direction = function(value){
    return (value == 0 ? 'down' : 'up')
  }
  
  this.isFlooding = function(){
    
  }
  
  this.isDraining = function(){
    
  }

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
          that.computeLevelChange(x.value, function(duration){
            callback(duration);
          });
        }
      }
    };

    b.attachInterrupt(this.pin, true, b.CHANGE, handleInterrupt);
  }
  
  this.computeLevelChange = function(levelValue, callback){
    direction = this.direction(levelValue);
    now      = Date.now();
    lastTime = this.lastLevels[direction];
    
    if (lastTime != null){
      duration = now - lastTime;
      callback(duration);
    }
    else {
      duration = null; 
      console.log('Last timing water going ' + direction + ' not available : can\'t compute daration');
    }
    
    this.lastLevels[direction] = now;
  }
  
  this.stopWatching = function(){
    b.detachInterrupt(pin);
    console.log('Interrupt detached');
  }
  
}

module.exports = WaterLevelProbe