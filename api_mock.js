
var sendMeasure = function (metricKey, value){
  formData = { 'value' : value };
  path = '/api/devices/' + process.env.RISEBOX_KEY + '/metrics/' + metricKey + '/measures';
  console.log('Mocked API call : https POST to ' + path + ' with form data: ' + value)
}
 

module.exports.sendMeasure = sendMeasure;