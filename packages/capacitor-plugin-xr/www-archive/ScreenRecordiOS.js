var exec = require('cordova/exec');

var Replay = {
    isAvailable: function (success, error) {
        exec(success, error, 'ScreenRecord', 'isAvailable');
    },
    startRecording: function (isMicrophoneEnabled, success, error) {
        exec(success, error, "ScreenRecord", "startRecording", [isMicrophoneEnabled]);
    },
    stopRecording: function (success, error) {
        exec(success, error, "ScreenRecord", "stopRecording");
    },
    isRecording: function (success, error) {
        exec(success, error, "ScreenRecord", "isRecording");
    },
    startBroadcast: function (success, error) {
        exec(success, error, "ScreenRecord", "startBroadcast");
    },
    stopBroadcast: function (success, error) {
        exec(success, error, "ScreenRecord", "stopBroadcast");
    },
    isBroadcasting: function (success, error) {
        exec(success, error, "ScreenRecord", "isBroadcasting");
    },
    isBroadcastAvailable: function (success, error) {
        exec(success, error, "ScreenRecord", "isBroadcastAvailable");
    }
};

module.exports = Replay;