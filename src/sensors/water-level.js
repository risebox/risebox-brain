var b = require('bonescript'),
    l = require('../utils/logger');

var WaterLevelProbe = function(position, pin){
  console.log('in water level '+ position + ' pin' + pin);
  this.position = position;
  this.pin = pin;
  this.lastLevels = {};
  this.cycleMaxDurations = {full: 600, empty: 600};
 
  b.pinMode(this.pin, b.INPUT);
  
 
  this.direction = function(value){
    return (value == 0 ? 'down' : 'up')
  }
  
  this.lastFlushTime = function() {
    return this.lastLevels['down'];
  }
  
  this.watchCycle = function(callback){
    if (this.pin == null) return;
    
    l.log('info', 'Water level ' + this.position + ' - now watching');
    var that = this;
    
    var handleInterrupt = function(x){
      if (x.attached){
        l.log('info', 'Water level ' + that.position + ' - attachment done');
      } else {
        if (x.value === 0 || x.value === 1){
          l.log('info', 'Water level ' + that.position + ' - value changed to ' + x.value);
          that.computeLevelChange(x.value, function(duration){
            callback(duration, that.direction(x.value));
          });
        } else {
          l.log('warn', 'Water level ' + that.position + ' - wrong value received');
        }
      }
    };

    b.attachInterrupt(this.pin, true, b.CHANGE, handleInterrupt);
  }
  
  this.computeLevelChange = function(levelValue, callback){
    direction = this.direction(levelValue);
    now       = parseInt(Date.now() / 1000);
    lastTime  = this.lastLevels[direction];
    
    if (lastTime != null){
      duration = (now - lastTime);
      callback(duration);
    }
    else {
      duration = null; 
      l.log('info', 'Water level ' + this.position + ' - Last timing water going ' + direction + ' not available : can\'t compute duration');
    }
    this.lastLevels[direction] = now;
  }
  
  this.checkCycleDuration = function(callback){
    now          = parseInt(Date.now()/1000);
    lastTimeUp   = this.lastLevels['up'];
    lastTimeDown = this.lastLevels['down'];
    duration = null;
    
    if (lastTimeUp == null && lastTimeDown == null){
      l.log("info", 'Water level ' + this.position + " - Not enough data: can't check cycle durations");
    } else {
      if (lastTimeUp == null) {
        duration = now - lastTimeDown;
        if (duration > this.cycleMaxDurations['empty']) {
          l.log("warning", 'Water level ' + this.position + " - water level is stuck empty, maybe pump is too high");
          callback(duration + this.cycleMaxDurations['full'], "Le bac reste vide : Baissez le flux d'alimentation du bac")
        }
        return;
      }
      if (lastTimeDown == null) {
        duration = now - lastTimeUp;
        if (duration > this.cycleMaxDurations['full']){
          l.log("warning", 'Water level ' + this.position + " - water level is stuck full, maybe pump is too low");
          callback(duration + this.cycleMaxDurations['empty'], "Le bac ne se vide pas : Augmentez le flux d'alimentation du bac")
        }
        return;
      }
      if (lastTimeUp > lastTimeDown) {
        duration = now - lastTimeUp;
        if (duration > this.cycleMaxDurations['full']) {
          l.log("warning", 'Water level ' + this.position + " - water level is stuck full, maybe pump is too low");
          callback(duration + this.cycleMaxDurations['empty'], "Le bac ne se vide pas : Augmentez le flux d'alimentation du bac")
        }
        return;
      }
      if (lastTimeDown > lastTimeUp) {
        duration = now - lastTimeDown;
        if (duration > this.cycleMaxDurations['empty']) {
          l.log("warning", 'Water level ' + this.position + " - water level is stuck empty, maybe pump is too high");
          callback(duration + this.cycleMaxDurations['full'], "Le bac reste vide : Baissez le flux d'alimentation du bac")
        }
        return;
      }
    }
  }
  
  this.stopWatching = function(){
    b.detachInterrupt(pin);
    l.log("info", 'Water level ' + this.position + ' - stop watching');
  }
  
}

module.exports = WaterLevelProbe;
