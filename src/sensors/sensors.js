module.exports = {
    AirProbe : require(sensorPath('dht22')),
    WaterTempProbe : require(sensorPath('ds18b20')),
    WaterLevelProbe : require(sensorPath('water-level')),
    WaterOverflowProbe : require(sensorPath('water-overflow')),
    WaterVolumeProbe : require(sensorPath('hc-sr04')),
    PHProbe : require(sensorPath('ph-meter-pro')) };
    
function sensorPath(sensorName){
  if (process.env.MOCK_SENSORS === 'true') {
    return './mocks/' + sensorName
  } else {
    return './' + sensorName
  }
}
