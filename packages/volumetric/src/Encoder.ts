var glob = require('glob');
var fs = require('fs');
var THREE = require('three');
var OBJLoader = require('three/examples/jsm/loaders/OBJLoader');
var Utilities = require('./Utilities');

global.XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

export default class CortosisFileCreator {
  _meshFiles: any[];
  _frameData: any[];
  _maxVertices: number;
  _maxFaces: number;
  _manager: any;
  _loader: any;
  mesh: any;
  geometry: any;
  _frameIn: any;
  _frameOut: any;
  _outputFileName: any;
  constructor(
    // renderer,
    meshFileSuffix,
    frameIn,
    frameOut,
    outputFileName,
    progressCallback
  ) {
    this._meshFiles = [];
    this._frameData = [];
    this._maxVertices = 0;
    this._maxFaces = 0;
    this._manager = new THREE.LoadingManager();
    this._loader = new OBJLoader.OBJLoader(this._manager);
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
      this._meshFiles = files;
    });
  }

  createEncodedFile = async function (
    fileName,
    callback
  ) {
    console.log('Writing file to ' + fileName);
    var writeStream = fs.createWriteStream('./assets/temp.drcs');
    var currentPositionInWriteStream = 0;
    // If user specificies frame out, this it the range we process
    var frameOut = this._frameOut > 0 ? this._frameOut : this._meshFiles.length;
    // Iterate over all files and write an output file
    for (var i = this._frameIn; i < frameOut; i++) {
      // load obj
      let objPath = this._meshFiles[i].replace('.crt','.obj');

      var rawObjData = fs.readFileSync(objPath, 'utf8');
      var rawObjDataCRT = fs.readFileSync(this._meshFiles[i]);
      let rawCRTFrame = Buffer.from(rawObjDataCRT)
      var objData = this._loader.parse(rawObjData);
      var noNormals = rawObjData.indexOf('vn ') === -1;
      //   var children = objData.children;
      objData.traverse(function (child) {
        if (child.type == 'Mesh') {
          this.mesh = child;
          var bufferGeometry = child.geometry;

          this.geometry = new THREE.Geometry().fromBufferGeometry(bufferGeometry);

          if (this.geometry.vertices.length > this._maxVertices)
            this._maxVertices = this.geometry.vertices.length;
          if (this.geometry.faces.length > this._maxFaces)
            this._maxFaces = this.geometry.faces.length;

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
      
      // var encodedMesh = await promiseMesh;
      var encodedMesh = rawCRTFrame;
      // console.log(rawObjData,'rawObjData')

      var frame = {
        frameNumber: i,
        startBytePosition: currentPositionInWriteStream,
        vertices: this.geometry.vertices.length,
        faces: this.geometry.faces.length,
        meshLength: encodedMesh.byteLength
      };

      // Add to the data array
      this._frameData.push(frame);
      // Write to file stream, mesh first
      writeStream.write(encodedMesh);
      console.log('Wrote ' + encodedMesh.byteLength + ' bytes');
      // update progress callback
      currentPositionInWriteStream += encodedMesh.byteLength
      encodedMesh = null;
      this.geometry = null;
      console.log("Memory Usage", process.memoryUsage());

      // progress callback
      if (callback) callback(i - this._frameIn / frameOut - this._frameIn);
    }
    // // Close file stream
    writeStream.close();

    // create object with maxVertices, textureWidth and textureHeight, then pack frames {} in
    var fileData = {
      maxVertices: this._maxVertices,
      maxTriangles: this._maxFaces,
      frameData: this._frameData,
    };

    console.log('FileData', fileData);
    // // Convert our file info into buffer and save to file stream
    var fileDataBuffer = Buffer.from(JSON.stringify(fileData), 'utf-8');
    // Write the length so we know how to read it back out into an object
    var fileDataBufferLengthEncoded = new Buffer(
      Utilities.longToByteArray(fileDataBuffer.byteLength)
    );
    console.log('Byte array length: ' + fileDataBufferLengthEncoded.length);
    console.log('Data buffer byte length: ' + fileDataBuffer.byteLength);
    // Get length of that buffer and save as 32 bit number, append to end of file
    console.log('Wrote ' + this._frameData.length + ' meshes into file ' + this._outputFileName);

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
}
new CortosisFileCreator('crt', 0, 2759, 'PLY-luna-med2760.drcs', function () {
  console.log('Converted to Dracosis');
});
