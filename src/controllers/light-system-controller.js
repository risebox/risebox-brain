var b  = require('bonescript'),
    fs = require('fs'),
    l  = require('../utils/logger'),
    LightController = require('./light-controller');

var LightSystemController = function(powerPin, lightControllersPins){
  this.powerPin = powerPin;
  b.pinMode(this.powerPin, b.OUTPUT);
  this.powerOn = null;
  var lightControllers = [];
  
  for (var i=0; i<lightControllersPins.length; i++) {
    lightControllers.push(new LightController(lightControllersPins[i]));
  };

  this.growLights = function(recipies){
    l.log('info', 'Lights - grow lights');
    i = 0;
    this.ensurePowerIsOn(function(){
      lightControllers.forEach(function(controller){
        controller.growLights.apply(this, recipies[i]);
        i++;
      });
    });
  }

  this.sightLights = function(){
    l.log('info', 'Lights - sight lights');
    i = 0;
    this.ensurePowerIsOn(function(){
      lightControllers.forEach(function(controller){
        controller.sightLights();
        i++;
      });
    });
  }

  this.pause = function(callback){
    l.log('info', 'Lights - pausing lights');
    var pausedControllersCount = 0;
    for (var i=0; i<lightControllers.length; i++) {
      lightControllers[i].noLights(function(){
        pausedControllersCount++;
        if (pausedControllersCount == lightControllers.length) {
          if (callback != null){
            callback();
          }
        }
      });
    }
  }

  this.stop = function(){
    l.log('info', 'Lights - stopping lights');
    if (this.powerOn == null || this.powerOn == true) {
      var that = this;
      this.pause(function(){
        that.switchPowerOff();
      });
    }
  }

  this.ensurePowerIsOn = function(callback){
    l.log('info', 'Lights - ensurePowerIsOn');
    l.log('info', 'this.powerOn' + this.powerOn);
    if (this.powerOn == null || this.powerOn == false) {
      l.log('info', 'should switch power to on');
      var that = this;
      this.pause(function(){
        that.switchPowerOn(callback);
      });
    } else {
      callback();
    }
  }

  this.switchPowerOn = function(callback){
    l.log('info', 'Lights - powerOn');
    var that = this;
    b.digitalWrite(this.powerPin, b.HIGH, function(x){
      l.log('info', JSON.stringify(x));
      that.powerOn = true;
      callback();
    });
  }

  this.switchPowerOff = function() {
    l.log('info', 'Lights - powerOff');
    var that = this;
    b.digitalWrite(this.powerPin, b.LOW, function(x){
      l.log('info', JSON.stringify(x));
      that.powerOn = false;
    });
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
