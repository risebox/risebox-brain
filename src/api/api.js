var querystring = require('querystring'),
    https = require('https');

var API_URL = 'rbdev-api.herokuapp.com';
var HEADERS = { 'Accept': 'application/json',
                'RISEBOX-USER-EMAIL': process.env.RISEBOX_USER_EMAIL,
                'RISEBOX-USER-SECRET': process.env.RISEBOX_USER_SECRET
              };

function post(path, data, success, error){
  postData = querystring.stringify(data);

  options = {
    hostname: API_URL,
    path: path,
    method: 'POST',
    headers: HEADERS
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
      //console.log(responseString);
      if (success){
        var responseObject = JSON.parse(responseString);
        success(responseObject);
      }
    });
  });

  req.on('error', function(e) {
    console.log('problem with request: ' + e.message);
    if (error){error(e);}
  });

  req.write(postData);
  req.end();

}

function get(path, data, success, error){
  qs = querystring.stringify(data);

  options = {
    hostname: API_URL,
    path: path + '?' + qs,
    method: 'GET',
    headers: HEADERS
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
      if (success){
        var responseObject = JSON.parse(responseString);
        success(responseObject);
      }
    });

  });

  req.on('error', function(e) {
    console.log('problem with request: ' + e.message);
    if (error){error(e);}
  });

  req.end();

}

/*var requestApi = function (verb, path, data, success, error) {
  try {
   this[verb](path, data, success, error)
  }
  catch (e) {
     console.log('error on request API');
  }
}*/

var sendMeasure = function (metricKey, value){
  formData = { 'value' : value };
  path = '/api/devices/' + process.env.RISEBOX_DEVICE_KEY + '/metrics/' + metricKey + '/measures';
  post(path, formData);
  /*requestApi('post', path, formData, );*/
}

var sendAlert = function (metricKey, value, description){
  formData = { 'value' : value, 'description' : description };
  path = '/api/devices/' + process.env.RISEBOX_DEVICE_KEY + '/metrics/' + metricKey + '/alerts';
  post(path, formData);
}

var sendLog = function (level, msg){
  var now = new Date().getTime();
  formData = { 'level': level, 'body': msg, 'logged_at': parseInt(now/1000)};
  path = '/api/devices/' + process.env.RISEBOX_DEVICE_KEY + '/logs';
  post(path, formData);
}

var getAllSettings = function (success, error) {
  path = '/api/devices/' + process.env.RISEBOX_DEVICE_KEY + '/settings';
  get(path, { 'mode' : 'full' }, success, error);
}

var getDeltaSettings = function (success, error) {
  path = '/api/devices/' + process.env.RISEBOX_DEVICE_KEY + '/settings';
  get(path, { 'mode' : 'delta' }, success, error);
}


module.exports.sendMeasure       = sendMeasure;
module.exports.sendAlert         = sendAlert;
module.exports.sendLog           = sendLog;
module.exports.getAllSettings    = getAllSettings;
module.exports.getDeltaSettings  = getDeltaSettings;

