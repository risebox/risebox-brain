module.exports = {
    LightController : require(controllersPath('light-controller')),
    LightSystemController : require(controllersPath('light-system-controller')), 
    FanController : require(controllersPath('fan-controller')),
    PumpController : require(controllersPath('pump-controller')),
    WaterCircuitController : require(controllersPath('water-circuit-controller')),
    UserButtonController : require(controllersPath('user-button-controller'))
};
    
function controllersPath(ctrlName){
  if (process.env.MOCK_SENSORS === 'true') {
    return './mocks/' + ctrlName
  } else {
    return './' + ctrlName
  }
}
