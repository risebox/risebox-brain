var logger = exports;

logger.debugLevel = process.env.LOG_LEVEL;

logger.log = function(level, message) {
  var levels = ['info', 'warning', 'error'];
  if (levels.indexOf(level) >= levels.indexOf(logger.debugLevel) ) {
    if (typeof message !== 'string') {
      message = JSON.stringify(message);
    };
    console.log(level+': '+message);
  }
}