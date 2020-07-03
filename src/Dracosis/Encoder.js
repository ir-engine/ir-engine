"use_strict";
"use strict";
exports.__esModule = true;
var glob = require("glob");
var fs = require("fs");
var three_1 = require("three");
// var BasisTextureLoader_1 = require("three/examples/jsm/loaders/BasisTextureLoader");
// var OBJLoader_1 = require("three/examples/jsm/loaders/OBJLoader");
// @ts-ignore
var prepend_file_1 = require("prepend-file");
var image_size_1 = require("image-size");
var CodecHelpers_1 = require("./CodecHelpers");
var Utilities_1 = require("../Shared/Utilities");
var DracoFileCreator = /** @class */ (function () {
  function DracoFileCreator(
    renderer,
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
    this._basisLoader = new BasisTextureLoader_1.BasisTextureLoader();
    this._manager = new three_1.LoadingManager();
    this._loader = new OBJLoader_1.OBJLoader(this._manager);
    this.textureWidth = 0;
    this.textureHeight = 0;
    this.mesh = new three_1.Mesh();
    this.geometry = new three_1.Geometry();
    this._frameIn = frameIn;
    this._frameOut = frameOut;
    this._frameIn = frameIn;
    this._outputFileName = outputFileName;
    this._basisLoader.detectSupport(renderer);
    this._basisLoader.setTranscoderPath("examples/js/libs/basis/");
    this._manager.onProgress = function (item, loaded, total) {
      console.log(item, loaded, total);
      if (progressCallback) progressCallback(item, loaded, total);
    };
    // Read path to OBJs and make array
    glob(__dirname + "/*." + meshFileSuffix, {}, function (err, files) {
      if (err) console.log(err);
      _this._meshFiles = files;
      console.log(files);
    });
    // Get path to jpg, png and make array
    glob(__dirname + "/*." + textureFileSuffix, {}, function (err, files) {
      if (err) console.log(err);
      _this._textureFiles = files;
      console.log(files);
    });
  }
  DracoFileCreator.prototype.createEncodedFile = function (fileName, callback) {
    var _this = this;
    if (this._meshFiles.length != this._textureFiles.length)
      return console.error(
        "Mesh and texture sequence lengths are not the same,         Mesh[] is " +
          this._meshFiles.length +
          ", Texture[] is " +
          this._textureFiles.length
      );
    console.log("Writing file to " + fileName);
    var writeStream = fs.createWriteStream(fileName);
    var currentPositionInWriteStream = 0;
    // If user specificies frame out, this it the range we process
    var frameOut = this._frameOut > 0 ? this._frameOut : this._meshFiles.length;
    // Iterate over all files and write an output file
    for (var i = this._frameIn; i < frameOut; i++) {
      // load obj
      this._loader.load(
        this._meshFiles[i],
        function (obj) {
          // Search for mesh object
          obj.traverse(function (child) {
            if (child instanceof three_1.Mesh) {
              _this.mesh = child;
              _this.geometry = child.geometry;
              if (child.geometry.vertices > _this._maxVertices)
                _this._maxVertices = child.geometry.vertices;
              if (child.geometry.faces > _this._maxFaces)
                _this._maxFaces = child.geometry.faces;
              return; // Only get the first mesh in the obj
            }
          });
        },
        function (progress) {
          console.log(
            "model " +
              Math.round((progress.loaded / progress.total) * 100) +
              "% downloaded"
          );
        },
        function (err) {
          console.log(err);
        }
      );
      // If we haven't set the texture width yet, do that here automatically so we can store in the file
      if (this.textureWidth === 0) {
        var dimensions = image_size_1.imageSize(this._textureFiles[i]);
        this.textureWidth = dimensions.width;
        this.textureHeight = dimensions.height;
      }
      var encodedTexture = CodecHelpers_1.PNGToBasis(this._textureFiles[i]); // Takes a path, returns a buffer
      var encodedMesh = CodecHelpers_1.encodeMeshToDraco(this.mesh.geometry); // convert obj to draco
      var frame = {
        frameNumber: i,
        startBytePosition: currentPositionInWriteStream,
        vertices: this.geometry.vertices.length,
        faces: this.geometry.faces.length,
        meshLength: encodedMesh.length,
        textureLength: encodedTexture.length,
      };
      console.log(frame);
      // Add to the data array
      this._frameData.push(frame);
      // Write to file stream, mesh first
      writeStream.write(encodedMesh);
      console.log("Wrote " + encodedMesh.length + " bytes");
      writeStream.write(encodedTexture);
      console.log("Wrote " + encodedTexture.length + " bytes");
      // update progress callback
      currentPositionInWriteStream +=
        encodedMesh.length + encodedTexture.length;
      // progress callback
      if (callback) callback(i - this._frameIn / frameOut - this._frameIn);
    }
    // Close file stream
    writeStream.close;
    // create object with maxVertices, textureWidth and textureHeight, then pack frames {} in
    var fileData = {
      textureHeight: this.textureHeight,
      textureWidth: this.textureWidth,
      maxVertices: this._maxVertices,
      maxTriangles: this._maxFaces,
      frameData: this._frameData,
    };
    // Convert our file info into buffer and save to file stream
    var fileDataBuffer = Buffer.from(JSON.stringify(fileData), "utf-8");
    // Write the length so we know how to read it back out into an object
    var fileDataBufferLengthEncoded = new Buffer(
      Utilities_1.longToByteArray(fileDataBuffer.byteLength)
    );
    console.log("Byte array length: " + fileDataBufferLengthEncoded.length);
    console.log("Data buffer byte length: " + fileDataBuffer.byteLength);
    // Get length of that buffer and save as 32 bit number, append to end of file
    console.log(
      "Wrote " +
        this._frameData.length +
        " meshes and textures into file " +
        this._outputFileName
    );
    // We're going to prepend our data (and the length of that data), so combine buffers in order
    var combinedBuffer = Buffer.concat([
      fileDataBufferLengthEncoded,
      fileDataBuffer,
    ]);
    console.log("Prepending file data and how long the file data is");
    prepend_file_1["default"](fileName, combinedBuffer, function (err) {
      if (err) console.error(err);
      else console.log("Prepended data to " + fileName);
    });
    // Progress callback
    if (callback) callback(1);
  };
  return DracoFileCreator;
})();
exports["default"] = DracoFileCreator;
