var b  = require('bonescript'),
    fs = require('fs'),
    l  = require('../utils/logger');

var LightController = function(pins){
  var bluePin = pins.blue;
  var redPin  = pins.red;
  var whitePin  = pins.white;
  var currentLights = [];

  this.growLights = function(blue, red, white){
    l.log('info', 'Lights - setting Grow Mode');
    max = Math.max(blue, red, white);
    setLights(blue/max, red/max, white/max, null);
  }

  this.sightLights = function(){
    l.log('info', 'Lights - setting Sight Mode');
    setLights(0, 0, 1, null);
  }

  this.noLights = function(callback){
    l.log('info', 'Lights - setting No lights Mode');
    setLights(0, 0, 0, callback);
  }

  function setLights(blue, red, white, callback){
    if(anythingToChange(blue, red, white)) {
      l.log('info', 'Lights : change recipe to B ' + blue + ' R ' + red + ' W ' + white);
      var colorChangeCount = 0;
      b.analogWrite(bluePin, blue, 2000, function() {
        b.analogWrite(redPin, red, 2000, function() {
          b.analogWrite(whitePin, white, 2000, function() {
            if (callback != null) {
              callback();
            }
          });
        });
      });
      currentLights = [blue, red, white];
    } else {
      if (callback != null) {
        callback();
      }
    }
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

  function colorChanged(count, callback) {
    count ++;
    if (count == 3) {
      callback();
    }
  }
}

module.exports = LightController;
