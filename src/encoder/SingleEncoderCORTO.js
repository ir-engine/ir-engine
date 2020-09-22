var glob = require('glob');
var fs = require('fs');
var THREE = require('three');
var OBJLoader_1 = require('three/examples/jsm/loaders/OBJLoader');
// @ts-ignore
var CodecHelpers_1 = require('./CodecHelpers');
var image_size_1 = require('image-size');
var Utilities_1 = require('./Utilities');
var prepend_file_1 = require('prepend-file');
var prepend = require('prepend');
const { create } = require('domain');

global.XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

function getFilesizeInBytes(filename) {
    var stats = fs.statSync(filename)
    var fileSizeInBytes = stats["size"]
    return fileSizeInBytes
}

var DracoFileCreator = /** @class */ (function () {
  function DracoFileCreator(
    // renderer,
    meshFileSuffix,
    textureFileSuffix,
    frameIn,
    frameOut,
    outputFileName,
    progressCallback
  ) {
    var _this = this;
    this._meshFiles = [];
    this._textureFiles = [];
    this._frameData = [];
    this._maxVertices = 0;
    this._maxFaces = 0;
    this._manager = new THREE.LoadingManager();
    this._loader = new OBJLoader_1.OBJLoader(this._manager);
    this.textureWidth = 0;
    this.textureHeight = 0;
    this.mesh = new THREE.Mesh();
    this.geometry = new THREE.Geometry();
    this._frameIn = frameIn;
    this._frameOut = frameOut;
    this._frameIn = frameIn;
    this._outputFileName = outputFileName;
    this._manager.onProgress = function (item, loaded, total) {
      console.log(item, loaded, total);
      if (progressCallback) progressCallback(item, loaded, total);
    };

    // Read path to OBJs and make array
    glob('assets/*.' + meshFileSuffix, {}, function (err, files) {
      if (err) console.log(err);
      _this._meshFiles = files;
    });
    // Get path to jpg, png and make array
    glob('assets/*.' + textureFileSuffix, {}, function (err, files) {
      if (err) console.log(err);
      _this._textureFiles = files;
      _this.createEncodedFile('assets/' + _this._outputFileName, undefined);
    });
  }

  DracoFileCreator.prototype.createEncodedFile = async function (
    fileName,
    callback
  ) {
    var _this = this;
    if (this._meshFiles.length != this._textureFiles.length)
      return console.error(
        'Mesh and texture sequence lengths are not the same, Mesh[] is ' +
        this._meshFiles.length +
        ', Texture[] is ' +
        this._textureFiles.length
      );
    console.log('Writing file to ' + fileName);
    var writeStream = fs.createWriteStream('./assets/temp.drcs');
    var currentPositionInWriteStream = 0;
    // If user specificies frame out, this it the range we process
    var frameOut = this._frameOut > 0 ? this._frameOut : this._meshFiles.length;
    // Iterate over all files and write an output file
    for (var i = this._frameIn; i < frameOut; i++) {
      console.log(
        'Index--------------------------------------------------------',
        i
      );
      // load obj
      let objPath = this._meshFiles[i].replace('.crt','.obj');

      var rawObjData = fs.readFileSync(objPath, 'utf8');




      var rawObjDataCRT = fs.readFileSync(this._meshFiles[i]);
      let rawCRTFrame = Buffer.from(rawObjDataCRT)
      console.log(rawCRTFrame.byteLength,this._meshFiles[i],'rawCRTFrame');




      // console.log(this._meshFiles[i],rawCRTFrame.byteLength,'===================');
      var objData = this._loader.parse(rawObjData);
      var noNormals = rawObjData.indexOf('vn ') === -1;
      //   var children = objData.children;
      objData.traverse(function (child) {
        if (child.type == 'Mesh') {
          _this.mesh = child;
          // _this.geometry = child.geometry;
          var bufferGeometry = child.geometry;

          _this.geometry = new THREE.Geometry().fromBufferGeometry(bufferGeometry);

          if (_this.geometry.vertices.length > _this._maxVertices)
            _this._maxVertices = _this.geometry.vertices.length;
          if (_this.geometry.faces.length > _this._maxFaces)
            _this._maxFaces = _this.geometry.faces.length;

          return; // Only get the first mesh in the obj
        }
      });

      if (noNormals) {
        // this.geometry.mergeVertices();
        this.geometry.computeVertexNormals();
      }

      rawObjData = null;
      objData = null;
      noNormals = null;

      const encoder = this;

      // If we haven't set the texture width yet, do that here automatically so we can store in the file
      if (this.textureWidth === 0) {
        var dimensions = image_size_1.imageSize(this._textureFiles[i]);
        this.textureWidth = dimensions.width;
        this.textureHeight = dimensions.height;
      }

      let promiseTexture = new Promise((resolve, reject) => {
        var encodedTexture = CodecHelpers_1.PNGToBasis(this._textureFiles[i]); // Takes a path, returns a buffer
        resolve(encodedTexture);
      });

      var encodedTexture = await promiseTexture;

      // let promiseMesh = new Promise((resolve, reject) => {
      //   var encodedMesh = CodecHelpers_1.encodeMeshToDraco(encoder.geometry);
      //   resolve(encodedMesh);
      // });

      // var encodedMesh = await promiseMesh;
      var encodedMesh = rawCRTFrame;
      // console.log(rawObjData,'rawObjData')

      var frame = {
        frameNumber: i,
        startBytePosition: currentPositionInWriteStream,
        vertices: _this.geometry.vertices.length,
        faces: _this.geometry.faces.length,
        meshLength: encodedMesh.byteLength,
        textureLength: encodedTexture.byteLength,
      };

      // Add to the data array
      this._frameData.push(frame);
      // Write to file stream, mesh first
      writeStream.write(encodedMesh);
      console.log('Wrote ' + encodedMesh.byteLength + ' bytes');
      writeStream.write(encodedTexture);
      console.log('Wrote ' + encodedTexture.byteLength + ' bytes');
      // update progress callback
      currentPositionInWriteStream +=
        encodedMesh.byteLength + encodedTexture.byteLength;

      // encodedMesh.clear();
      // encodedTexture.clear();
      encodedMesh = null;
      encodedTexture = null;
      promiseMesh = null;
      promiseTexture = null;
      this.geometry = null;
      // free(encodedMesh);
      // free(encodedTexture);


      console.log("Memory Usage", process.memoryUsage());

      // progress callback
      if (callback) callback(i - this._frameIn / frameOut - this._frameIn);
    }
    // // Close file stream
    writeStream.close();

    // create object with maxVertices, textureWidth and textureHeight, then pack frames {} in
    var fileData = {
      textureHeight: this.textureHeight,
      textureWidth: this.textureWidth,
      maxVertices: this._maxVertices,
      maxTriangles: this._maxFaces,
      frameData: this._frameData,
    };

    console.log('FileData', fileData);
    // // Convert our file info into buffer and save to file stream
    var fileDataBuffer = Buffer.from(JSON.stringify(fileData), 'utf-8');
    // Write the length so we know how to read it back out into an object
    var fileDataBufferLengthEncoded = new Buffer(
      Utilities_1.longToByteArray(fileDataBuffer.byteLength)
    );
    console.log('Byte array length: ' + fileDataBufferLengthEncoded.length);
    console.log('Data buffer byte length: ' + fileDataBuffer.byteLength);
    // Get length of that buffer and save as 32 bit number, append to end of file
    console.log(
      'Wrote ' +
      this._frameData.length +
      ' meshes and textures into file ' +
      this._outputFileName
    );

    // console.log('FileDataBuffer', JSON.stringify(fileData));

    // // We're going to prepend our data (and the length of that data), so combine buffers in order
    var combinedBuffer = Buffer.concat([
      fileDataBufferLengthEncoded,
      fileDataBuffer,
    ]);
    // console.log('Combined Buffer', JSON.stringify(combinedBuffer));
    // console.log(combinedBuffer.byteLength);

    var createStream = fs.createWriteStream(fileName);
    createStream.write(combinedBuffer);

    fs.readFile('./assets/temp.drcs', function (err, data) {
      if (err) {
        return console.log(err);
      }

      createStream.write(data);
      console.log(data.byteLength);
    });

    createStream.close;

    // Progress callback
    if (callback) callback(1);
  };
  return DracoFileCreator;
})();

new DracoFileCreator('crt', 'png', 0, 99, 'CRT_sample_v35_99frames.drcs', function () {
  console.log('Converted to Dracosis');
});
