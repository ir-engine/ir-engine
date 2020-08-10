"use strict";
exports.__esModule = true;
exports.lerp = exports.padFrameNumberWithZeros = exports.byteArrayToLong = exports.longToByteArray = void 0;
function longToByteArray(/*long*/ long) {
    // we want to represent the input as a 8-bytes array
    var byteArray = [0, 0, 0, 0, 0, 0, 0, 0];
    for (var index = 0; index < byteArray.length; index++) {
        var byte = long & 0xff;
        byteArray[index] = byte;
        long = (long - byte) / 256;
    }
    return byteArray;
}
exports.longToByteArray = longToByteArray;
;
function byteArrayToLong(/*byte[]*/ byteArray) {
    var value = 0;
    for (var i = byteArray.length - 1; i >= 0; i--) {
        value = (value * 256) + byteArray[i];
    }
    return value;
}
exports.byteArrayToLong = byteArrayToLong;
;
function padFrameNumberWithZeros(n, width) {
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join('0') + n;
}
exports.padFrameNumberWithZeros = padFrameNumberWithZeros;
function lerp(v0, v1, t) {
    return v0 * (1 - t) + v1 * t;
}
exports.lerp = lerp;
