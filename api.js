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
    var responseString = '';
    res.setEncoding('utf8');
    
    //console.log('STATUS: ' + res.statusCode);
    //console.log('HEADERS: ' + JSON.stringify(res.headers));
    
    res.on('data', function (chunk) {
      responseString += chunk;
      //console.log('BODY: ' + chunk);
    });
    
    res.on('end', function() {
      console.log(responseString);
      //var responseObject = JSON.parse(responseString);
      //success(responseObject);
    });
  });
  
  req.on('error', function(e) {
    console.log('problem with request: ' + e.message);
  });
  
  req.write(postData);
  req.end();

}

function get(path, data, success){
  qs = querystring.stringify(data);
  
  options = {
    hostname: 'rbdev-api.herokuapp.com',
    path: path + '?' + qs,
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'RISEBOX-SECRET': process.env.RISEBOX_SECRET
    }
  };
  
  req = https.request(options, function(res) {
    
    var responseString = '';
    res.setEncoding('utf8');
    
    //console.log('STATUS: ' + res.statusCode);
    //console.log('HEADERS: ' + JSON.stringify(res.headers));

    res.on('data', function(chunk) {
      responseString += chunk;
      //console.log('BODY: ' + chunk);
    });
    
    res.on('end', function() {
      //console.log(responseString);
      var responseObject = JSON.parse(responseString);
      success(responseObject);
    });
    
  });
  
  req.on('error', function(e) {
    console.log('problem with request: ' + e.message);
  });
  
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

var getAllSettings = function (callback) {
  path = '/api/devices/' + process.env.RISEBOX_KEY + '/settings';
  get(path, { 'mode' : 'full' }, callback);
}
 
var getDeltaSettings = function (callback) {
  path = '/api/devices/' + process.env.RISEBOX_KEY + '/settings';
  get(path, { 'mode' : 'delta' }, callback);
}


module.exports.sendMeasure       = sendMeasure;
module.exports.sendAlert         = sendAlert;
module.exports.getAllSettings    = getAllSettings;
module.exports.getDeltaSettings  = getDeltaSettings;
