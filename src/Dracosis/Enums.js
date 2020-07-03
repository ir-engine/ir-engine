"use strict";
exports.__esModule = true;
exports.MessageType = void 0;
var MessageType;
(function (MessageType) {
    MessageType[MessageType["InitializationRequest"] = 0] = "InitializationRequest";
    MessageType[MessageType["InitializationResponse"] = 1] = "InitializationResponse";
    MessageType[MessageType["DataRequest"] = 2] = "DataRequest";
    MessageType[MessageType["DataResponse"] = 3] = "DataResponse";
    MessageType[MessageType["SetLoopRequest"] = 4] = "SetLoopRequest";
    MessageType[MessageType["SetStartFrameRequest"] = 5] = "SetStartFrameRequest";
    MessageType[MessageType["SetEndFrameRequest"] = 6] = "SetEndFrameRequest";
})(MessageType = exports.MessageType || (exports.MessageType = {}));
