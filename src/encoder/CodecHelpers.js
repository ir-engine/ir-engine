"use strict";
exports.__esModule = true;
exports.PNGToBasis = exports.encodeMeshToDraco = exports.decodeDracoData = void 0;
var fs = require("fs");
var child_process_1 = require("child_process");
// @ts-ignore
var basisu_1 = require("basisu");
// @ts-ignore
var draco3d_1 = require("draco3d");
var arrayBufferToBuffer = require("arraybuffer-to-buffer");
const draco3d = require('draco3d');
const decoderModule = draco3d.createDecoderModule({});
const encoderModule = draco3d.createEncoderModule({});
// const decoder = new decoderModule.Decoder();

function decodeDracoData(rawBuffer, decoder) {

  const buffer = new this.decoderModule.DecoderBuffer();
  buffer.Init(new Int8Array(rawBuffer), rawBuffer.byteLength);
  const geometryType = decoder.GetEncodedGeometryType(buffer);
  var dracoGeometry;
  var status;
  if (geometryType === this.decoderModule.TRIANGULAR_MESH) {
    dracoGeometry = new this.decoderModule.Mesh();
    status = decoder.DecodeBufferToMesh(buffer, dracoGeometry);
  } else if (geometryType === this.decoderModule.POINT_CLOUD) {
    dracoGeometry = new this.decoderModule.PointCloud();
    status = decoder.DecodeBufferToPointCloud(buffer, dracoGeometry);
  } else {
    var errorMsg = "Error: Unknown geometry type.";
    console.error(errorMsg);
  }
  this.decoderModule.destroy(buffer);
  return dracoGeometry;
}

exports.decodeDracoData = decodeDracoData;

async function encodeMeshToDraco(mesh) {
  var dracoEncoderType = {};
  var encoder = null;
  const _this = this;

  let encodedPromise = new Promise((resolve, reject) => {
    dracoEncoderType["onModuleLoaded"] = async function (module) {
      encoder = new module.Encoder();
      var meshBuilder = new encoderModule.MeshBuilder();
      var dracoMesh = new encoderModule.Mesh();
      var numFaces = mesh.faces.length;
      var numPoints = mesh.vertices.length;
      var numUvs = mesh.vertices.length * 2;
      // var numUvs = mesh.faceVertexUvs[0].length * 3;
      var numIndices = numFaces * 3;
      var indices = new Uint32Array(numIndices);
      console.log("Number of faces " + numFaces);
      console.log("Number of vertices " + numPoints);
      var vertices = new Float32Array(mesh.vertices.length * 3);
      var normals = new Float32Array(mesh.vertices.length * 3);
      // var faceVertexUvs = new Float32Array(mesh.vertices.length * 2);

      var uvs = new Float32Array(mesh.vertices.length * 2);

      //  Add Faces and UVs to mesh
      for (var i = 0; i < numFaces; i++) {
        var index = i * 3;
        indices[index] = mesh.faces[i].a;
        indices[index + 1] = mesh.faces[i].b;
        indices[index + 2] = mesh.faces[i].c;

        let face = mesh.faces[i];
        let faceUvs = mesh.faceVertexUvs[0][i];

        uvs[face.a * 2] = faceUvs[0].x;
        uvs[face.a * 2 + 1] = faceUvs[0].y;

        uvs[face.b * 2] = faceUvs[1].x;
        uvs[face.b * 2 + 1] = faceUvs[1].y;

        uvs[face.c * 2] = faceUvs[2].x;
        uvs[face.c * 2 + 1] = faceUvs[2].y;

      }
      meshBuilder.AddFacesToMesh(dracoMesh, numFaces, indices);
      // Add POSITION to mesh (Vertices)
      for (var i = 0; i < mesh.vertices.length; i++) {
        var index = i * 3;
        vertices[index] = mesh.vertices[i].x;
        vertices[index + 1] = mesh.vertices[i].y;
        vertices[index + 2] = mesh.vertices[i].z;
      }
      meshBuilder.AddFloatAttributeToMesh(
        dracoMesh,
        encoderModule.POSITION,
        numPoints,
        3,
        vertices
      );
      // Add UVs to mesh

      meshBuilder.AddFloatAttributeToMesh(
        dracoMesh,
        encoderModule.TEX_COORD,
        numUvs,
        2,
        uvs
      );

      // Add NORMAL to mesh
      for (var _i = 0, _a = mesh.faces; _i < _a.length; _i++) {
        var face = _a[_i];
        normals[face["a"] * 3] = face.vertexNormals[0].x;
        normals[face["a"] * 3 + 1] = face.vertexNormals[0].y;
        normals[face["a"] * 3 + 2] = face.vertexNormals[0].z;
        normals[face["b"] * 3] = face.vertexNormals[1].x;
        normals[face["b"] * 3 + 1] = face.vertexNormals[1].y;
        normals[face["b"] * 3 + 2] = face.vertexNormals[1].z;
        normals[face["c"] * 3] = face.vertexNormals[2].x;
        normals[face["c"] * 3 + 1] = face.vertexNormals[2].y;
        normals[face["c"] * 3 + 2] = face.vertexNormals[2].z;
      }

      meshBuilder.AddFloatAttributeToMesh(
        dracoMesh,
        encoderModule.NORMAL,
        numPoints,
        3,
        normals
      );
      console.log("//DRACO UNCOMPRESSED MESH STATS//////////");
      console.log("Number of faces " + dracoMesh.num_faces());
      console.log("Number of Vertices " + dracoMesh.num_points());
      console.log("Number of Attributes " + dracoMesh.num_attributes());
      // Compressing using DRACO
      var encodedData = new encoderModule.DracoInt8Array();
      // encoder.SetSpeedOptions(5, 5);
      encoder.SetAttributeQuantization(encoderModule.POSITION, 16);
      encoder.SetAttributeQuantization(encoderModule.NORMAL, 16);
      encoder.SetAttributeQuantization(encoderModule.TEX_COORD, 16);
      encoder.SetAttributeQuantization(encoderModule.COLOR, 16);
      encoder.SetAttributeQuantization(encoderModule.GENERIC, 16);
      // encoder.SetEncodingMethod(encoderModule.MESH_SEQUENTIAL_ENCODING);
      encoder.SetEncodingMethod(encoderModule.MESH_EDGEBREAKER_ENCODING);

      console.log("Encoding...");
      var encodedLen = encoder.EncodeMeshToDracoBuffer(dracoMesh, encodedData);
      encoderModule.destroy(dracoMesh);
      if (encodedLen > 0) console.log("Encoded size is " + encodedLen);
      else console.log("Error: Encoding failed.");

      console.log("Encoded Length", encodedLen);
      // Copy encoded data to buffer.
      var outputBuffer = new ArrayBuffer(encodedLen);
      const outputData = new Int8Array(outputBuffer);
      for (let i = 0; i < encodedLen; ++i) {
        outputData[i] = encodedData.GetValue(i);
      }

      // encoderModule.destroy(encodedData);
      encoderModule.destroy(encoder);
      encoderModule.destroy(meshBuilder);
      console.log("DRACO ENCODED////////////////////////////");
      console.log("Length of buffer: " + outputBuffer.byteLength);

      resolve(Buffer(outputBuffer));

      // resolve(arrayBufferToBuffer(outputBuffer));
    };

    var encoderModule = draco3d_1.createEncoderModule(dracoEncoderType);
  });

  var outputBuffer = await encodedPromise;
  mesh = null;

  return outputBuffer;
}
exports.encodeMeshToDraco = encodeMeshToDraco;

async function PNGToBasis(inPath) {
  var basisFilePath = inPath.replace(".png", ".basis");
  var basisFilePathArray = basisFilePath.split("/");
  basisFilePath = basisFilePathArray[basisFilePathArray.length - 1];

  let basisDataPromise = new Promise((resolve, reject) => {
    child_process_1.execFile(
      basisu_1.path,
      [inPath],
      (error, stdout, stderr) => {
        if (error) {
          console.error("stderr", stderr);
          throw error;
        }
        // Read file into array
        var basisData = fs.readFileSync(basisFilePath);
        // destroy file
        fs.unlinkSync(basisFilePath);
        // Return array
        resolve(basisData);
      }
    );
  });
  var basisData = await basisDataPromise;
  return basisData;
}
exports.PNGToBasis = PNGToBasis;
