const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const hexdump = require('hexdump-nodejs');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

// const filePath = 'sample_v35_300frames.drcs';
const filePath = 'CRT_fromPLY-meshlab2_sample_v35_299frames.drcs';

function byteArrayToLong(/*byte[]*/ byteArray) {
  let value = 0;
  for (let i = byteArray.length - 1; i >= 0; i--) {
    value = value * 256 + byteArray[i];
  }
  return value;
}

app.get('/dracosis', (req, res) => {
  if (!fs.existsSync(filePath)) {
    console.error('File not found at ' + filePath);
    return;
  }

  fs.open(filePath, 'r', (err, fd) => {
    if (err) return console.log(err.message);
    // Read first 8 bytes for header length (long)
    let buffer = Buffer.alloc(8);
    fs.readSync(fd, buffer, 0, 8, 0);
    const fileHeaderLength = byteArrayToLong(buffer);

    // Read the header bytes (skip the header length, first 8 bytes)
    buffer = Buffer.alloc(fileHeaderLength);
    fs.readSync(fd, buffer, 0, fileHeaderLength, 8); // Skip 8 bytes for the header length val
    // Buffer to json, json to object
    this._fileHeader = JSON.parse(buffer.toString('utf8'));
    this._readStreamOffset = fileHeaderLength + 8;
    this._endFrame = this._fileHeader.frameData.length;
    this._numberOfFrames = this._endFrame - this._startFrame;

    buffer = Buffer.alloc(200);
    fs.readSync(fd, buffer, 0, 200, this._readStreamOffset); // Skip 8 bytes for the header length val

    console.log('File Header', this._fileHeader);

    const initializeMessage = {
      type: 1,
      filePath,
      fileHeader: this._fileHeader,
      readStreamOffset: this._readStreamOffset,
    };

    res.status(200).send(initializeMessage);
  });
});

app.post('/dracosis-stream', (req, res) => {
  console.log(req.body);
  const startBytePosition = req.body.startByte;
  const meshLength = req.body.meshLength;
  const textureLength = req.body.textureLength;

  console.log('StartBytePosition', startBytePosition);
  console.log('MeshLength', meshLength);
  console.log('TextureLength', textureLength);

  var stream = fs
    .createReadStream(filePath, {
      start: startBytePosition,
      end: startBytePosition + meshLength + textureLength,
    })
    .on('open', function () {
      stream.pipe(res);
    })
    .on('error', function (err) {
      res.end(err);
    });
});

app.get('/dracosis-file', function (req, res) {
  // fs.readFile(filePath, function (err, data) {
  //   if (err) {
  //     return console.log(err);
  //   }

  //   const startBytePosition = 1299;
  //   const meshLength = 428890;
  //   console.log('Data length', data.byteLength);

  //   const startData = Buffer.alloc(startBytePosition);
  //   const bufferGeom = Buffer.alloc(meshLength);
  //   const testData = Buffer.alloc(startBytePosition);

  //   const buffer = Buffer.from(data);

  //   buffer.copy(startData, 0, 0, startBytePosition);
  //   buffer.copy(bufferGeom, 0, startBytePosition, meshLength);
  //   buffer.copy(
  //     testData,
  //     0,
  //     startBytePosition,
  //     startBytePosition + startBytePosition
  //   );

  //   console.log('Hexdump', hexdump(testData));
  // });
  res.sendFile('sample_v7_10frames.drcs', { root: __dirname }, function (err) {
    console.log('Sent file');
  });
});

app.listen(8000, () => {
  console.log('Listening on 8000');
});
