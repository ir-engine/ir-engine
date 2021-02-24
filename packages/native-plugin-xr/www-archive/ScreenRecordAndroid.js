var exec = require('../../capacitor-arkit/www/node_modules/cordova/exec'),
  argscheck = require('cordova/argscheck');

var ScreenRecord = function(){
}

ScreenRecord.startRecord = function(options, filePath, success, error) {
  var getValue = argscheck.getValue;
  options = {
    isAudio: getValue(options.isAudio, false),
    width: getValue(options.width, 720),
    height: getValue(options.height, 1280),
    bitRate: getValue(options.bitRate, 6 * 1000000),
    dpi: getValue(options.dpi, 1)
  };
  exec(success, error, "ScreenRecord", "startRecord", [options, filePath]);
};

ScreenRecord.stopRecord = function(success, error) {
  exec(success, error, "ScreenRecord", "stopRecord", []);
}

module.exports = ScreenRecord;
