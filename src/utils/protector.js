logger = require('./logger')

var safeExec = function (obj, func) {
  var params = [].slice.call(arguments, 2);
  console.log('safeExec => Object: ' + JSON.stringify(obj) + ' func: ' + func + ' params: '+ params);
  try {
    func.apply(obj, params);
  }
  catch (e) {
    console.log('**********************');
    console.log('***** Catched an error');
    console.log('**********************');
    logger.log('error', e);
  }
}

module.exports = safeExec;