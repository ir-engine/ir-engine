const express = require("express");
const bodyParser = require("body-parser");
const { randomBytes } = require("crypto");
const cors = require("cors");
const axios = require("axios");
const fs = require("fs");

const app = express();
app.use(bodyParser.json());
app.use(cors());

const filePath = "sample.drcs";

function byteArrayToLong(/*byte[]*/ byteArray) {
  let value = 0;
  for (let i = byteArray.length - 1; i >= 0; i--) {
    value = value * 256 + byteArray[i];
  }
  return value;
}

app.get("/dracosis", (req, res) => {
  if (!fs.existsSync(filePath)) {
    console.error("File not found at " + filePath);
    return;
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

    buffer = Buffer.alloc(200);
    fs.readSync(fd, buffer, 0, 200, this._readStreamOffset); // Skip 8 bytes for the header length val
    // Buffer to json, json to object
    // this._fileHeader = JSON.parse(buffer.toString("utf8"));
    console.log(buffer);

    const initializeMessage = {
      // type: MessageType.InitializationResponse,
      filePath,
      fileHeader: this._fileHeader,
      readStreamOffset: this._readStreamOffset,
    };

    // This line opens the file as a readable stream
    // var readStream = fs.createReadStream(filePath);

    // // This will wait until we know the readable stream is actually valid before piping
    // readStream.on("open", function () {
    //   // This just pipes the read stream to the response object (which goes to the client)
    //   console.log("65");
    //   console.log(readStream);
    //   readStream.pipe(res);
    // });

    res.status(200).send(initializeMessage);
  });
});

app.listen(8000, () => {
  console.log("Listening on 8000");
});
