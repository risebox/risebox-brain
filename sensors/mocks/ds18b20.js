var b = require('bonescript');
    
var getWaterTemp = function(callback){
    console.log(__dirname + '/fixtures/ds18b20.txt');
    b.readTextFile(__dirname + '/fixtures/ds18b20.txt', function(x){
       callback(parseInt(x.data.substring(0, x.data.length-1))/1000);
    });
}

module.exports.getWaterTemp = getWaterTemp;
