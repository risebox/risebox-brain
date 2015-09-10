module.exports = {
    LightController : require(controllersPath('light-controller')),
    FanController : require(controllersPath('fan-controller')),
    PumpController : require(controllersPath('pump-controller')) };
    
function controllersPath(ctrlName){
  if (process.env.MOCK_SENSORS === 'true') {
    return './mocks/' + ctrlName
  } else {
    return './' + ctrlName
  }
}