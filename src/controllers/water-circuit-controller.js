var b              = require('bonescript'),
    controllers    = require('./controllers'),
    sensors        = require('../sensors/sensors');

var WaterCircuitController = function(pumpPin, tankDimensions, levelPins, overflowPins){
  var pump   = new controllers.PumpController(pumpPin);
  var volume = new sensors.WaterVolumeProbe(tankDimensions);

  this.levelSensors = [];
  levelKeys = Object.keys(levelPins);
  for (var i=0; i<levelKeys.length; i++) {
    this.levelSensors.push(new sensors.WaterLevelProbe(levelKeys[i].toUpperCase(), levelPins[levelKeys[i]]));
  };

  this.overflowSensors = [];
  overflowKeys = Object.keys(overflowPins);
  for (var i=0; i<overflowKeys.length; i++) {
    this.overflowSensors.push(new sensors.WaterOverflowProbe(overflowKeys[i].toUpperCase(), overflowPins[overflowKeys[i]]));
  };

  var setPinMode = function(){
    b.pinMode(pin, b.OUTPUT);
  }

  var otherWaterlevelProbe = function(probe){
    position = this.levelSensors.indexOf(probe);
    otherPosition = (position == 1 ? 0 : 1)
    return this.levelSensors[otherPosition];
  }

  this.watchWaterLevels = function(waterCycleCb, waterVolumeCb){
    this.levelSensors.forEach(function(sensor){
      sensor.watchCycle(function(cycleTime, direction){
        if (direction == 'down'){
          now = parseInt(Date.now()/1000);
          lastOtherFlush = otherWaterlevelProbe(sensor).lastFlushTime();
          if (now - lastOtherFlush < 60){
            l.log('info', 'Water Volume - Time to compute tank water volume');
            waterVolumeProbe.getVolume(function(volume){
              waterVolumeCb('WVOL', volume);
            }, function(error){
              l.log('error', error);
            });
          }
        }
        waterCycleCb(sensor.position, duration);
      });
    });
  }

  var overFlowStatuses = {};

  var shouldStopPump = function(position, status){
    overFlowStatuses[position] = status;

    var stopPump = false;
    for (var key in overFlowStatuses) {
      stopPump = (overFlowStatuses[key] == 'overflow');
      if (stopPump == true){
        break;
      }
    }
    return stopPump;
  }

  var controlPump = function(position, status){
    if (shouldStopPump(position, status)){
      this.emergencyStop();
    } else {
      this.endEmergencyStop();
    }
  }

  this.watchOverflows = function(callback){
    this.overflowCallback = callback;
    this.overflowSensors.forEach(function(sensor){
      sensor.getStatus(controlPump);
      sensor.watchOverflow(controlPump);
    }
  }

  var circuitPaused = false;
  var circuitEmergencyStopped = false;

  this.pause = function(){
    circuitPaused = true;
    pump.stop();
  }

  this.endPause = function(){
    circuitPaused = false;
    if (circuitEmergencyStopped == false){
      pump.start();
    }
  }

  this.emergencyStop = function(){
    circuitEmergencyStopped = true;
    pump.stop();
    l.log('warning', 'emergencyStop - Overflow => Stopping the pump');
    this.overflowCallback();
  }

  this.endEmergencyStop = function(){
    circuitEmergencyStopped = false;
    if (circuitPaused == false){
      pump.start();
    }
    l.log('warning', 'endEmergencyStop - No Overflow => Starting the pump');
  }

  this.detectStuckWaterLevel = function(callback, interval){
    setInterval(function(){
      this.levelSensors.forEach(function(sensor){
        sensor.checkCycleDuration(function(cycleTime, description){
          callback(sensor.position, cycleTime, description);
        });
      });
    }, interval);
  }

}

module.exports = PumpController;