import glob from 'glob';
import fs from 'fs';
import THREE from 'three';
import OBJLoader from 'three-obj-loader-cjs-module';

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
  lastMesh;
  mesh;
  geometry;
  _frameIn;
  _frameOut;
  _outputFileName;
  keyframes = [];
  constructor(
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
    this._loader = new OBJLoader(this._manager);
    this.mesh = new THREE.Mesh();
    this.geometry = new THREE.Geometry();
    this._frameIn = frameIn;
    this._frameOut = frameOut;
    this._frameIn = frameIn;
    this._outputFileName = outputFileName;
    this._manager.onProgress = (item, loaded, total) => {
      console.log(item, loaded, total);
      if (progressCallback) progressCallback(item, loaded, total);
    };

const dir = process.cwd() + '/' + 'assets/';
    glob(dir + '*.crt', {}, (err, files) => {
      if (err) console.log(err);
      this._meshFiles = files;
      this.createEncodedFile(this._outputFileName, () => { "file created! "});
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
      let objPath = this._meshFiles[i].replace('.crt','.obj');

      let rawObjData = fs.readFileSync(objPath, 'utf8');
      let rawObjDataCRT = fs.readFileSync(this._meshFiles[i]);
      let rawCRTFrame = Buffer.from(rawObjDataCRT)
      let objData = this._loader.parse(rawObjData);
      let noNormals = rawObjData.indexOf('vn ') === -1;
      
      // Set last mesh for comparison
      this.lastMesh = this.mesh;
      
      //   const children = objData.children;
      objData.traverse((child) => {
        if (child.type == 'Mesh') {
          this.mesh = child;
          const bufferGeometry = child.geometry;

          this.geometry = new THREE.Geometry().fromBufferGeometry(bufferGeometry);

          if (this.geometry.vertices.length > this._maxVertices)
            this._maxVertices = this.geometry.vertices.length;
          if (this.geometry.faces.length > this._maxFaces)
            this._maxFaces = this.geometry.faces.length;

          return; // Only get the first mesh in the obj
        }
      });

      if(this.lastMesh !== undefined){
        console.log("Mesh geo is", this.lastMesh.geometry);

        const lastMeshVertexCount = new THREE.Geometry().fromBufferGeometry(this.lastMesh.geometry).vertices.length;
        const meshVertexCount = new THREE.Geometry().fromBufferGeometry(this.mesh.geometry).vertices.length;

        if(lastMeshVertexCount === meshVertexCount) console.log("Vertex count is the same between meshes");
      }
        

      if (noNormals) {
        // this.geometry.mergeVertices();
        this.geometry.computeVertexNormals();
      }

      rawObjData = null;
      objData = null;
      noNormals = null;
      
      // const encodedMesh = await promiseMesh;
      let encodedMesh = rawCRTFrame;
      // console.log(rawObjData,'rawObjData')

      const frame = {
        frameNumber: i,
        startBytePosition: currentPositionInWriteStream,
        vertices: this.geometry.vertices.length,
        faces: this.geometry.faces.length,
        meshLength: encodedMesh.byteLength
      };

      // Add to the data array
      this._frameData.push(frame);
      // Write to file stream, mesh first
      writeBuffer = Buffer.concat([writeBuffer, Buffer.from(encodedMesh)]);
      console.log('Wrote ' + encodedMesh.byteLength + ' bytes');
      // update progress callback
      currentPositionInWriteStream += encodedMesh.byteLength
      encodedMesh = null;
      this.geometry = null;
      console.log("Memory Usage", process.memoryUsage());

      // progress callback
      if (callback) callback(i - this._frameIn / frameOut - this._frameIn);
    }

    // create object with maxVertices, textureWidth and textureHeight, then pack frames {} in
    const fileData = {
      maxVertices: this._maxVertices,
      maxTriangles: this._maxFaces,
      frameData: this._frameData,
    };

    console.log('FileData', fileData);
    // // Convert our file info into buffer and save to file stream
    const fileDataBuffer = Buffer.from(JSON.stringify(fileData), 'utf-8');
 
    const manifestStream = fs.createWriteStream(fileName.replace('drcs', 'manifest'));
    manifestStream.write(fileDataBuffer, err => {
      if(err) console.log("ERROR", err);
    });

    manifestStream.close;


    const dracosisStream = fs.createWriteStream(fileName);
    dracosisStream.write(writeBuffer, err => {
      if(err)
      console.log("ERROR", err);
    });

    console.log("Bytes written to createStream", dracosisStream.path);
    dracosisStream.close;

    // Progress callback
    if (callback) callback(1);
  };
}

const myArgs = process.argv.slice(2);
console.log('myArgs: ', myArgs);

new CortosisFileCreator(myArgs[1] ? myArgs[1] : 0, myArgs[2] ? myArgs[2] : -1, myArgs[0], () => {
  console.log('Converted to Dracosis');
});
