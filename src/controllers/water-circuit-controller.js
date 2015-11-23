var b              = require('bonescript'),
    PumpController = require('./pump-controller'),
    l              = require('../utils/logger'),
    sensors        = require('../sensors/sensors');

var WaterCircuitController = function(pumpPin, tankDimensions, levelPins, overflowPins){
  var pump   = new PumpController(pumpPin);
  var volumeProbe = new sensors.WaterVolumeProbe(tankDimensions);

  var levelSensors = [];
  levelKeys = Object.keys(levelPins);
  for (var i=0; i<levelKeys.length; i++) {
    levelSensors.push(new sensors.WaterLevelProbe(levelKeys[i].toUpperCase(), levelPins[levelKeys[i]]));
  };

  var overflowSensors = [];
  overflowKeys = Object.keys(overflowPins);
  for (var i=0; i<overflowKeys.length; i++) {
    overflowSensors.push(new sensors.WaterOverflowProbe(overflowKeys[i].toUpperCase(), overflowPins[overflowKeys[i]]));
  };

  var setPinMode = function(){
    b.pinMode(pin, b.OUTPUT);
  }

  var otherWaterlevelProbe = function(probe){
    position = levelSensors.indexOf(probe);
    otherPosition = (position == 1 ? 0 : 1)
    return levelSensors[otherPosition];
  }

  this.getWaterVolume = function(callback) {
    volumeProbe.getVolume(callback);
  }

  this.watchWaterLevels = function(waterCycleCb, waterVolumeCb){
    levelSensors.forEach(function(sensor){
      sensor.watchCycle(function(cycleTime, direction){
        if (direction == 'down'){
          now = parseInt(Date.now()/1000);
          lastOtherFlush = otherWaterlevelProbe(sensor).lastFlushTime();
          if (now - lastOtherFlush < 60){
            l.log('info', 'Water Volume - Time to compute tank water volume in 30 sec');
            setTimeout(function(){
              volumeProbe.getVolume(function(volume){
                l.log('info', 'volume is '+volume);
                waterVolumeCb(volume);
              }, function(error){
                l.log('error', error);
              });
            }, 30000);
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
      emergencyStop();
    } else {
      endEmergencyStop();
    }
  }

  var overflowCallback = null;

  this.watchOverflows = function(callback){
    overflowCallback = callback;
    overflowSensors.forEach(function(sensor){
      sensor.getStatus(controlPump);
      sensor.watchOverflow(controlPump);
    });
  }

  var circuitPaused = false;
  var circuitEmergencyStopped = false;

  this.pause = function(){
    if (circuitPaused == false){
      circuitPaused = true;
      pump.stop();
    }
  }

  this.endPause = function(){
    circuitPaused = false;
    if (circuitEmergencyStopped == false){
      pump.start();
    }
  }

  var emergencyStop = function(){
    circuitEmergencyStopped = true;
    pump.stop();
    l.log('warning', 'emergencyStop - Overflow => Stopping the pump');
    overflowCallback();
  }

  var endEmergencyStop = function(){
    circuitEmergencyStopped = false;
    if (circuitPaused == false){
      pump.start();
    }
    l.log('warning', 'endEmergencyStop - No Overflow => Starting the pump');
  }

  this.detectStuckWaterLevel = function(callback, interval){
    setInterval(function(){
      levelSensors.forEach(function(sensor){
        sensor.checkCycleDuration(function(cycleTime, description){
          callback(sensor.position, cycleTime, description);
        });
      });
    }, interval);
  }

}

module.exports = WaterCircuitController;
