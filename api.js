var querystring = require('querystring'),
    https = require('https');

function post(path, data){
  postData = querystring.stringify(data);
  
  options = {
    hostname: 'rbdev-api.herokuapp.com',
    path: path,
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'RISEBOX-SECRET': process.env.RISEBOX_SECRET
    }
  };
  
  req = https.request(options, function(res) {
    console.log('STATUS: ' + res.statusCode);
    console.log('HEADERS: ' + JSON.stringify(res.headers));
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
      console.log('BODY: ' + chunk);
    });
  });
  
  req.on('error', function(e) {
    console.log('problem with request: ' + e.message);
  });
  
  req.write(postData);
  req.end();

}

var sendMeasure = function (metricKey, value){
  formData = { 'value' : value };
  path = '/api/devices/' + process.env.RISEBOX_KEY + '/metrics/' + metricKey + '/measures';
  post(path, formData);
}

var sendAlert = function (metricKey, value, description){
  formData = { 'value' : value, 'description' : description };
  path = '/api/devices/' + process.env.RISEBOX_KEY + '/metrics/' + metricKey + '/alerts';
  post(path, formData);
}
 

module.exports.sendMeasure = sendMeasure;
module.exports.sendAlert   = sendAlert;