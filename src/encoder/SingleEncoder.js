var glob = require('glob');
var fs = require('fs');
var THREE = require('three');
var OBJLoader_1 = require('three/examples/jsm/loaders/OBJLoader');
// @ts-ignore
var CodecHelpers_1 = require('./CodecHelpers');

global.XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

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
    glob('assets/*.' + meshFileSuffix, {}, function (
      err,
      files
    ) {
      if (err) console.log(err);
      _this._meshFiles = files;
    });
    // Get path to jpg, png and make array
    glob('assets/*.' + textureFileSuffix, {}, function (
      err,
      files
    ) {
      if (err) console.log(err);
      _this._textureFiles = files;
      _this.createEncodedFile(
        'assets/' + _this._outputFileName,
        undefined
      );
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
    var writeStream = fs.createWriteStream(fileName);
    // If user specificies frame out, this it the range we process
    var frameOut = this._frameOut > 0 ? this._frameOut : this._meshFiles.length;
    // Iterate over all files and write an output file
    for (var i = this._frameIn; i < frameOut; i++) {
      console.log(
        'Index--------------------------------------------------------',
        i
      );
      // load obj
      var rawObjData = fs.readFileSync(this._meshFiles[i], 'utf8');
      var objData = this._loader.parse(rawObjData);
      var noNormals = rawObjData.indexOf('vn ') === -1;
      //   var children = objData.children;
      objData.traverse(function (child) {
        if (child.type == 'Mesh') {
          _this.mesh = child;
          // _this.geometry = child.geometry;
          var bufferGeometry = child.geometry;

          _this.geometry = new THREE.Geometry().fromBufferGeometry(
            bufferGeometry
          );

          if (_this.geometry.vertices.length > _this._maxVertices)
            _this._maxVertices = _this.geometry.vertices.length;
          if (_this.geometry.faces.length > _this._maxFaces)
            _this._maxFaces = _this.geometry.faces.length;

          return; // Only get the first mesh in the obj
        }
      });

      if (noNormals) {
        this.geometry.mergeVertices();
        this.geometry.computeVertexNormals();
      }

      const encoder = this;

      let promiseMesh = new Promise((resolve, reject) => {
        var encodedMesh = CodecHelpers_1.encodeMeshToDraco(encoder.geometry);
        resolve(encodedMesh);
      });

      var encodedMesh = await promiseMesh;

      // Write to file stream, mesh first
      writeStream.write(encodedMesh);
      
      // progress callback
      if (callback) callback(i - this._frameIn / frameOut - this._frameIn);
    }
    // // Close file stream
    writeStream.close;
    
    // Progress callback
    if (callback) callback(1);
  };
  return DracoFileCreator;
})();

new DracoFileCreator('obj', 'jpg', 0, 1, 'sample.drcs', function () {
  console.log('Converted to Dracosis');
});
