var querystring = require('querystring'),
    https = require('https');

var sendMeasure = function (metricKey, value){
  var postData = querystring.stringify({
    'value' : value
  });
  
  var options = {
    hostname: 'rbdev-api.herokuapp.com',
    path: '/api/devices/' + process.env.RISEBOX_KEY + '/metrics/' + metricKey + '/measures',
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'RISEBOX-SECRET': process.env.RISEBOX_SECRET
    }
  };
  
  var req = https.request(options, function(res) {
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
  
  // write data to request body
  req.write(postData);
  req.end();
}

module.exports.sendMeasure = sendMeasure;