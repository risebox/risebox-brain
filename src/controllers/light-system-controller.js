var b  = require('bonescript'),
    fs = require('fs'),
    l  = require('../utils/logger'),
    LightController = require('light-controller');

var LightSystemController = function(powerPin, lightControllersPins){
  this.powerPin = powerPin;
  b.pinMode(this.powerPin, b.INPUT);
  this.powerOn = null;
  this.lightControllers = [];
  lightControllersPins.forEach(function(controllerPins) {
    lightControllers.push(new LightController(controllerPins));
  });

  this.growLights = function(recipies){
    i = 0;
    ensurePowerIsOn(function(){
      lightControllers.forEach(function(controller){
        controller.growLights().apply(this, recipies[i]);
        i++;
      });
    });
  }

  this.sightLights = function(){
    i = 0;
    ensurePowerIsOn(function(){
      lightControllers.forEach(function(controller){
        controller.sightLights();
        i++;
      });
    });
  }

  this.pause = function(callback){
    l.log('info', 'Lights - pausing lights');
    var pausedControllersCount = 0;
    var that = this;
    lightControllers.forEach(function(controller){
      controller.noLights(function(){
        pausedControllersCount++;
        if (pausedControllersCount == that.lightControllers.size()) {
          callback();
        }
      });
    });
  }

  this.stop = function(){
    l.log('info', 'Lights - stopping lights');
    if (this.powerOn == null || this.powerOn == true) {
      this.pause(powerOff);
    }
  }

  function ensurePowerIsOn(callback){
    if (this.powerOn == null || this.powerOn == false) {
      this.pause(function(){
        powerOn(callback);
      });
    }
  });

  function powerOn(callback){
    b.digitalWrite(this.powerPin, b.HIGH, callback);
  }

  function powerOff(){
    b.digitalWrite(this.powerPin, b.LOW);
  }

  function anythingToChange(blue, red, white){
    newLights = [blue, red, white];
    var i = newLights.length;
    if (i != currentLights.length) return true;
    while (i--) {
        if (newLights[i] !== currentLights[i]) return true;
    }
    return false;
  }
}

module.exports = LightSystemController;