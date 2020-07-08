"use_strict";
// exports.__esModule = true;
var fs = require("fs");
var filePath = "./../../examples/assets/sample.drcs";

if (!fs.existsSync(filePath)) {
  console.error("File not found at " + filePath);
  return;
}

function byteArrayToLong(/*byte[]*/ byteArray) {
  let value = 0;
  for (let i = byteArray.length - 1; i >= 0; i--) {
    value = value * 256 + byteArray[i];
  }
  return value;
}

fs.open(filePath, "r", (err, fd) => {
  if (err) return console.log(err.message);
  // Read first 8 bytes for header length (long)
  let buffer = Buffer.alloc(8);
  fs.readSync(fd, buffer, 0, 8, 0);
  const fileHeaderLength = byteArrayToLong(buffer);

  // Read the header bytes (skip the header length, first 8 bytes)
  buffer = Buffer.alloc(fileHeaderLength);
  fs.readSync(fd, buffer, 0, fileHeaderLength, 8); // Skip 8 bytes for the header length val
  // Buffer to json, json to object
  this._fileHeader = JSON.parse(buffer.toString("utf8"));
  this._readStreamOffset = fileHeaderLength + 8;
  // Get current frame
  // If the end frame was supplied, use it, otherwise determine from length
  this._endFrame = this._fileHeader.frameData.length;
  this._numberOfFrames = this._endFrame - this._startFrame;
  // Send init data to worker
  const initializeMessage = {
    filePath,
    fileHeader: this._fileHeader,
    readStreamOffset: this._readStreamOffset,
  };
  console.log(initializeMessage);
});
