var exec = require('cordova/exec');

exports.open = function(success, fail) {
	exec(success, fail, 'ARCore', 'open', []);
}
