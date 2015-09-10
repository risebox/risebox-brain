var b = require('bonescript');

var WaterLevelProbe = function(position, pin){
  this.position = position;
  this.pin = pin;
  this.lastLevels = {};
  this.cycleMaxDurations = {full: 600, empty: 600};
  
  this.direction = function(value){
    return (value == 0 ? 'down' : 'up')
  }
  
  this.lastFlushTime = function() {
    return this.lastLevels['down'];
  }
  
  this.watchCycle = function(callback){
    if (this.pin == null) return;
    
    b.pinMode(this.pin, b.INPUT);
    console.log('I\'m watching ' + this.position + " water level");
    var that = this;
    
    var handleInterrupt = function(x){
      if (x.attached){
        console.log('Attachment done at ' + that.position + " level");
      } else {
        if (x.value === 0 || x.value === 1){
          console.log('Value changed at ' + that.position + " level");
          that.computeLevelChange(x.value, function(duration){
            callback(duration, that.direction(x.value));
          });
        }
      }
    };

    b.attachInterrupt(this.pin, true, b.CHANGE, handleInterrupt);
  }
  
  this.computeLevelChange = function(levelValue, callback){
    direction = this.direction(levelValue);
    now      = parseInt(Date.now() / 1000);
    lastTime = this.lastLevels[direction];
    
    if (lastTime != null){
      duration = (now - lastTime);
      callback(duration);
    }
    else {
      duration = null; 
      console.log('Last timing water going ' + direction + ' not available : can\'t compute duration');
    }
    this.lastLevels[direction] = now;
  }
  
  this.checkCycleDuration = function(callback){
    now          = parseInt(Date.now()/1000);
    lastTimeUp   = this.lastLevels['up'];
    lastTimeDown = this.lastLevels['down'];
    duration = null;
    
    if (lastTimeUp == null && lastTimeDown == null){
      console.log("Not enough data: can't check cycle durations");
    } else {
      if (lastTimeUp == null) {
        duration = now - lastTimeDown;
        if (duration > this.cycleMaxDurations['empty']) {
          console.log("ALERT: " + position + "water level is stuck empty, maybe pump is too high");
          callback(duration + this.cycleMaxDurations['full'], "Le bac reste vide : Baissez le flux d'alimentation du bac")
        }
        return;
      }
      if (lastTimeDown == null) {
        duration = now - lastTimeUp;
        if (duration > this.cycleMaxDurations['full']){
          console.log("ALERT: " + position + "water level is stuck full, maybe pump is too low");
          callback(duration + this.cycleMaxDurations['empty'], "Le bac ne se vide pas : Augmentez le flux d'alimentation du bac")
        }
        return;
      }
      if (lastTimeUp > lastTimeDown) {
        duration = now - lastTimeUp;
        if (duration > this.cycleMaxDurations['full']) {
          console.log("ALERT: " + position + "water level is stuck full, maybe pump is too low");
          callback(duration + this.cycleMaxDurations['empty'], "Le bac ne se vide pas : Augmentez le flux d'alimentation du bac")
        }
        return;
      }
      if (lastTimeDown > lastTimeUp) {
        duration = now - lastTimeDown;
        if (duration > this.cycleMaxDurations['empty']) {
          console.log("ALERT: " + position + "water level is stuck empty, maybe pump is too high");
          callback(duration + this.cycleMaxDurations['full'], "Le bac reste vide : Baissez le flux d'alimentation du bac")
        }
        return;
      }
    }
  }
  
  this.stopWatching = function(){
    b.detachInterrupt(pin);
    console.log('Interrupt detached');
  }
  
}

module.exports = WaterLevelProbe;