import glob from 'glob';
import fs from 'fs';
import THREE from 'three';
import OBJLoader from 'three-obj-loader-cjs-module';
import CortoDecoder from './libs/cortodecoder.js';

import HttpRequest from 'xmlhttprequest';
global.XMLHttpRequest = HttpRequest.XMLHttpRequest;

function longToByteArray(/*long*/long) {
  // we want to represent the input as a 8-bytes array
  let byteArray = [0, 0, 0, 0, 0, 0, 0, 0];
  for (let index = 0; index < byteArray.length; index++) {
    const byte = long & 0xff;
    byteArray[index] = byte;
    long = (long - byte) / 256;
  }
  return byteArray;
};

class CortosisFileCreator {
  _meshFile;
  _frameData;
  _maxVertices;
  _maxFaces;
  _manager;
  _loader;
  mesh;
  keyframeGeometry;
  _frameIn;
  _frameOut;
  _outputFileName;

  lastKeyframe = 0;

  constructor(
    frameIn,
    frameOut,
    outputFileName,
    frameRate,
    progressCallback
  ) {
    this._meshFiles = [];
    this._frameData = [];
    this._maxVertices = 0;
    this._maxFaces = 0;
    this._manager = new THREE.LoadingManager();
    this._loader = new OBJLoader(this._manager);
    this.keyframeGeometry = new THREE.BufferGeometry();
    this._frameIn = frameIn;
    this._frameOut = frameOut;
    this._frameIn = frameIn;
    this.frameRate = frameRate;
    this._outputFileName = outputFileName;
    this._manager.onProgress = (item, loaded, total) => {
      console.log(item, loaded, total);
      if (progressCallback) progressCallback(item, loaded, total);
    };

    const dir = process.cwd() + '/' + 'assets/';
    glob(dir + '*.crt', {}, (err, files) => {
      if (err) console.log(err);
      this._meshFiles = files;
      this.createEncodedFile(this._outputFileName, () => { "file created! " });
    });
  }

  createEncodedFile = async (
    fileName,
    callback
  ) => {
    console.log('Writing file to ' + fileName);
    let writeBuffer = Buffer.alloc(0);
    let currentPositionInWriteStream = 0;
    // If user specificies frame out, this it the range we process
    const frameOut = this._frameOut > 0 ? this._frameOut : this._meshFiles.length;
    // Iterate over all files and write an output file
    for (let i = this._frameIn; i < frameOut; i++) {
      // load obj
      let objPath = this._meshFiles[i].replace('.crt', '.obj');

      let rawObjData = fs.readFileSync(objPath, 'utf8');
      let rawObjDataCRT = fs.readFileSync(this._meshFiles[i]);
      let rawCRTFrame = Buffer.from(rawObjDataCRT)
      let objData = this._loader.parse(rawObjData);
      let noNormals = rawObjData.indexOf('vn ') === -1;
      let returnedMesh = null;
      //   const children = objData.children;
      objData.traverse((child) => {
          if (child.type == 'Mesh') {
            returnedMesh = child;
            return;
      }
      });

      if(returnedMesh !== null){
        console.log(returnedMesh.type, "found in child", i);

        this.lastKeyframe = i;

        this.keyframeGeometry = returnedMesh.geometry;

        if (this.keyframeGeometry.vertices.length > this._maxVertices)
        this._maxVertices = this.keyframeGeometry.vertices.length;
      if (this.keyframeGeometry.faces && this.keyframeGeometry.faces.length > this._maxFaces)
        this._maxFaces = this.keyframeGeometry.faces.length;



      if (noNormals && this.keyframeGeometry.faces && this.keyframeGeometry.faces.length > 0) {
        console.log("No normals");
        this.keyframeGeometry.computeVertexNormals();
      }

      const frame = {
        frameNumber: i,
        keyframeNumber: i,
        startBytePosition: currentPositionInWriteStream,
        vertices: this.keyframeGeometry.vertices.length,
        faces: this.keyframeGeometry.faces.length,
        meshLength: rawCRTFrame.byteLength,
        type: 'mesh'
      };

      // Add to the data array
      this._frameData.push(frame);
      } else {
        console.log("Mesh not returned, must be iframe");

      const frame = {
        frameNumber: i,
        keyframeNumber: this.lastKeyframe,
        startBytePosition: currentPositionInWriteStream,
        vertices: this.keyframeGeometry.vertices.length,
        faces: this.keyframeGeometry.faces.length,
        meshLength: rawCRTFrame.byteLength,
        type: 'group'
      };

    this._frameData.push(frame);
      }

          // Write to file stream, mesh first
          writeBuffer = Buffer.concat([writeBuffer, Buffer.from(rawCRTFrame)]);
          currentPositionInWriteStream += rawCRTFrame.byteLength

          // update progress callback
          rawCRTFrame = null;
          rawObjData = null;
          objData = null;
          noNormals = null;


      // progress callback
      if (callback) callback(i - this._frameIn / frameOut - this._frameIn);
    }


    // create object with maxVertices, textureWidth and textureHeight, then pack frames {} in
    const fileData = {
      frameRate: this.frameRate,
      maxVertices: this._maxVertices,
      maxTriangles: this._maxFaces,
      frameData: this._frameData,
    };


    console.log(this._frameData);
    // // Convert our file info into buffer and save to file stream
    const fileDataBuffer = Buffer.from(JSON.stringify(fileData), 'utf-8');

    const manifestStream = fs.createWriteStream(fileName.replace('drcs', 'manifest'));
    manifestStream.write(fileDataBuffer, err => {
      if (err) console.log("ERROR", err);
    });

    manifestStream.close;


    const dracosisStream = fs.createWriteStream(fileName);
    dracosisStream.write(writeBuffer, err => {
      if (err)
        console.log("ERROR", err);
    });

    dracosisStream.close;

    // Progress callback
    if (callback) callback(1);
  };
}

const myArgs = process.argv.slice(2);
const outputFileName = myArgs[0];
const frameRate = myArgs[1] ?? 25;
const frameIn = myArgs[2] ?? 0;
const frameOut = myArgs[3] ?? -1;

new CortosisFileCreator(frameIn, frameOut, outputFileName, frameRate, () => {
  console.log('Converted to Dracosis');
});