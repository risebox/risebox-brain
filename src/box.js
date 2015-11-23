var fs = require('fs'),
    b = require('bonescript'),
    l = require('./utils/logger'),
    exec = require('child_process').exec;

var Box = function(tankDimensions) {

  var dimensions = tankDimensions;

  var api = require(apiPath());
  var SettingsManager = require('./settings-manager');
  var settings = new SettingsManager(api);
  var brainVersion = null;

  fs.readFile('./VERSION', 'utf8', function(err, data){
    if(!err){
      brainVersion = data;
    };
  });

  settings.on('change', function(){
    l.log('info', 'SettingsManager - Settings were changed');
  });

  settings.on('process', function(settings){
    applySettingsChanges(settings);
  });

  var sensors = require('./sensors/sensors');
  var airProbe                 = new sensors.AirProbe("P9_15"),
      waterTempProbe           = new sensors.WaterTempProbe("P9_12"),
      phProbe                  = new sensors.PHProbe('P9_23', 'P9_36');

  var controllers = require('./controllers/controllers');
  var lights      = new controllers.LightSystemController('P8_17', [  {blue: 'P8_36', red: 'P8_45', white: 'P8_46'},
                                                                      {blue: 'P9_29', red: 'P9_31', white: 'P9_42'}  ]);
  var waterCircuit = new controllers.WaterCircuitController('P8_16', tankDimensions, {lower: 'P8_7', upper: 'P8_10'},
                                                                                   {lower: 'P8_8', upper: 'P8_9'});

  var fan         = new controllers.FanController('P8_15');
  var userButton  = new controllers.UserButtonController('P8_32', 'P8_34');
  var localAllWhiteUntil = new Date();

  function applySettingsChanges(s){
    l.log('info', 'SettingsManager - Applying settings');

    now = new Date();
    allWhiteDate = Date.parse(s.all_white_until);
    noLightsDate = Date.parse(s.no_lights_until);
    thisMoment = now.getHours() + now.getMinutes() / 60;
    dayStart = s.day_hours + s.day_minutes / 60;
    dayEnd = s.night_hours + s.night_minutes / 60;
    silentDate = Date.parse(s.silent_until);
    currentHourlyRatio = now.getMinutes() / 60;

    if(noLightsDate > now) {
      lights.pause();
    }
    else {
      if(localAllWhiteUntil > now || allWhiteDate > now) {
        lights.sightLights();
      }
      else {
        if(thisMoment >= dayStart && thisMoment <= dayEnd) {
          lights.growLights([[s.lower_blue, s.lower_red, s.lower_white],
                             [s.upper_blue, s.upper_red, s.upper_white ]]);
        }
        else {
          lights.stop();
        }
      }
    }


    if (now < silentDate){
      l.log('info', 'SettingsManager - Applying silent Mode');
      waterCircuit.pause();
      fan.stop();
    } else {
      waterCircuit.endPause();
      if (currentHourlyRatio <= s.fan_duty_ratio){
        l.log('info', 'SettingsManager - Fans on duty');
        fan.start();
      } else {
        l.log('info', 'SettingsManager - Fans off duty');
        fan.stop();
      }
    }

    if (s.brain_update == 1){
      if (brainVersion == s.brain_version){
        l.log('info', 'Brain succesfully updated to version ' + brainVersion + ': will tell server');
        api.brainUpdated(brainVersion);
      } else {
        if (s.brain_version != null){
          l.log('info', 'Brain update requested to version' + s.brain_version + ' (currently v' + brainVersion + ')');
          updateBrain(s.brain_version);
        } //else s.brain_version == null => default file : Do Not update
      }
    }

  }

  function updateBrain(version){
    api.sendLog('info', 'Box - Updating to version ' + version);
    var cmd = './update-brain.sh v' + version;
    exec(cmd, function(error, stdout, stderr) {
      if (error == null) {
        api.sendLog('info', 'Box - Brain updated! will now reboot');
        box.shutdown();
      } else {
        l.log('error', 'Could not update brain');
      }
    });
  }

  function apiPath(){
    if (process.env.MOCK_API === 'true') {
      return './api/api_mock'
    } else {
      return './api/api'
    }
  }

  function switchToWhiteLocally(){
    now = new Date();
    localAllWhiteUntil = new Date(now.getTime() + (settings.get['all_white_duration'] * 1000)); // in milliseconds
    lights.sightLights();
  };

  this.activateUserButton = function (){
    userButton.lightUp();
    userButton.onShortClick(switchToWhiteLocally);
  }

  this.sendWaterTempMeasure = function (){
    waterTempProbe.getWaterTemp(function(value){
      api.sendMeasure('WTEMP', value);
    }, function(error){
      api.sendLog('error', error);
    });
  }

  this.sendAirTempAndHumMeasure = function (){
    airProbe.getAirTempAndHum(function(value){
      api.sendMeasure('ATEMP', value.temp);
      api.sendMeasure('AHUM', value.hum);
    }, function(error){
      api.sendLog('error', error);
    });
  }

  var metricKeyFromPosition = function(position){
    apiKey = (position == 'UPPER') ? 'UCYC' : 'LCYC';
    return apiKey
  }

  var sendWaterCycleMeasure = function(position, duration){
    api.sendMeasure(metricKeyFromPosition(position), duration);
  }

  var sendWaterVolumeMeasure = function(volume){
    api.sendMeasure('WVOL', volume);
  }

  var raiseOverflowAlert = function(position){
    api.sendLog('warning', 'controlPump - Overflow on ' + position + ' bed => Stopping the pump');
    // TODO
    // api.sendAlert(metricKeyFromPosition(position, duration, description));
  }

  var raiseStuckLevelAlert = function(position, duration, description){
    api.sendAlert(metricKeyFromPosition(position), duration, description);
  }

  this.sendPHMeasure = function() {
    phProbe.getPH(function(phValue) {
      api.sendMeasure('PH', phValue);
    },function(errorMsg){
      api.sendLog('error', errorMsg);
    });
  }

  this.shutdown = function(callback){
    api.sendLog('warn', 'Box - Shutdown requested');

    lights.stop();
    fan.stop();

    callback();
  }

  settings.load();
  api.sendLog('info', 'Box - Started');

  waterCircuit.watchWaterLevels(sendWaterCycleMeasure, sendWaterVolumeMeasure);
  waterCircuit.watchOverflows(raiseOverflowAlert);
  waterCircuit.detectStuckWaterLevel(raiseStuckLevelAlert,30000);
}

module.exports = Box;
