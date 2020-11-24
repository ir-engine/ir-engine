// Copyright 2017 The Draco Authors.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
'use_strict';

const fs = require('fs');
const assert = require('assert');
const axios = require('axios');
const draco3d = require('draco3d');
const http = require('http');
const url = require('url');
const hexdump = require('hexdump-nodejs');
const fetch = require('node-fetch');
const fileType = require('file-type');

const decoderModule = draco3d.createDecoderModule({});
const encoderModule = draco3d.createEncoderModule({});

const startBytePosition = 1299;
const meshLength = 428890;
const textureLength = 113599;

// fetch('http://localhost:8000/dracosis-file')
//   .then((res) => {
//     console.log(res.status);
//     console.log(res.statusText);
//     console.log(res.headers.get('content-type'));
//     return res.buffer();
//   })
//   .then((buffer) => {
//     // const geometryString = text.substring(startBytePosition, meshLength);
//     // const bufferGeom = Buffer.from(geometryString);
//     // console.log(hexdump(buffer));
//     const bufferGeom = Buffer.alloc(meshLength);
//     buffer.copy(bufferGeom, 0, startBytePosition, meshLength);
//     const decoder = new decoderModule.Decoder();
//     const decodedGeometry = decodeDracoData(bufferGeom);

//     encodeMeshToFile(decodedGeometry, decoder);
//     decoderModule.destroy(decoder);
//     decoderModule.destroy(decodedGeometry);
//   });

body = {
  startByte: startBytePosition,
  meshLength: meshLength,
  textureLength: textureLength,
};

fetch('http://localhost:8000/dracosis-stream', {
  method: 'POST',
  body: JSON.stringify(body),
  headers: { 'Content-Type': 'application/json' },
})
  .then((res) => {
    console.log(res.status);
    // console.log(res.statusText);
    // console.log(res.headers.get('content-type'));
    return res.buffer();
  })
  .then((buffer) => {
    // const geometryString = text.substring(startBytePosition, meshLength);
    // const bufferGeom = Buffer.from(geometryString);
    // console.log(hexdump(buffer));
    // const start = Buffer.alloc(startBytePosition);
    const bufferGeom = Buffer.alloc(meshLength);
    const bufferTex = Buffer.alloc(textureLength);
    // buffer.copy(start, 0, 0, startBytePosition);
    buffer.copy(bufferGeom, 0, 0, meshLength);
    buffer.copy(bufferTex, 0, meshLength);

    // console.log(start.toString());

    const decoder = new decoderModule.Decoder();
    const decodedGeometry = decodeDracoData(bufferGeom);

    encodeMeshToFile(decodedGeometry, decoder);
    decoderModule.destroy(decoder);
    decoderModule.destroy(decodedGeometry);
  });

// fetch('http://localhost:8000/dracosis-file')
//   .then((res) => {
//     res.buffer();
//   })
//   .then((buffer) => {
//     console.log(buffer);
//     // fileType(buffer);
//   });
// .then((type) => {
//   /* ... */
// });

// axios.get('http://localhost:8000/dracosis-file', {}).then(function (response) {
//   console.log('Response', response.headers);
//   console.log('Data length', response.data.length);

//   const startData = Buffer.alloc(startBytePosition);
//   const bufferGeom = Buffer.alloc(meshLength);
//   const bufferTex = Buffer.alloc(textureLength);
//   const testData = Buffer.alloc(startBytePosition);

//   const buffer = Buffer.from(response.data);

//   buffer.copy(startData, 0, 0, startBytePosition);
//   buffer.copy(bufferGeom, 0, startBytePosition, meshLength);
//   buffer.copy(
//     testData,
//     0,
//     startBytePosition,
//     startBytePosition + startBytePosition
//   );
//   console.log('Hexdump', hexdump(testData));

//   const decoder = new decoderModule.Decoder();
//   const decodedGeometry = decodeDracoData(bufferGeom);
//   // Encode mesh
//   encodeMeshToFile(decodedGeometry, decoder);
//   decoderModule.destroy(decoder);
//   decoderModule.destroy(decodedGeometry);
// });

function decodeDracoData(rawBuffer) {
  const decoder = new decoderModule.Decoder();
  const buffer = new decoderModule.DecoderBuffer();
  console.log('Buffer', typeof buffer);
  buffer.Init(new Int8Array(rawBuffer), rawBuffer.byteLength);
  const geometryType = decoder.GetEncodedGeometryType(buffer);

  console.log('Buffer', buffer);

  let dracoGeometry;
  let status;

  if (geometryType === decoderModule.TRIANGULAR_MESH) {
    dracoGeometry = new decoderModule.Mesh();
    status = decoder.DecodeBufferToMesh(buffer, dracoGeometry);
  } else if (geometryType === decoderModule.POINT_CLOUD) {
    dracoGeometry = new decoderModule.PointCloud();
    status = decoder.DecodeBufferToPointCloud(buffer, dracoGeometry);
  } else {
    const errorMsg = 'Error: Unknown geometry type.';
    console.error(errorMsg);
  }

  decoderModule.destroy(buffer);

  return dracoGeometry;
}

function encodeMeshToFile(mesh, decoder) {
  const encoder = new encoderModule.Encoder();
  const meshBuilder = new encoderModule.MeshBuilder();
  // Create a mesh object for storing mesh data.
  const newMesh = new encoderModule.Mesh();

  const numFaces = mesh.num_faces();
  const numIndices = numFaces * 3;
  const numPoints = mesh.num_points();
  const indices = new Uint32Array(numIndices);

  console.log('Number of faces ' + numFaces);
  console.log('Number of vertices ' + numPoints);

  // Add Faces to mesh
  const ia = new decoderModule.DracoInt32Array();
  for (let i = 0; i < numFaces; ++i) {
    decoder.GetFaceFromMesh(mesh, i, ia);
    const index = i * 3;
    indices[index] = ia.GetValue(0);
    indices[index + 1] = ia.GetValue(1);
    indices[index + 2] = ia.GetValue(2);
  }
  decoderModule.destroy(ia);
  meshBuilder.AddFacesToMesh(newMesh, numFaces, indices);

  const attrs = { POSITION: 3, NORMAL: 3, COLOR: 3, TEX_COORD: 2 };

  Object.keys(attrs).forEach((attr) => {
    const stride = attrs[attr];
    const numValues = numPoints * stride;
    const decoderAttr = decoderModule[attr];
    const encoderAttr = encoderModule[attr];
    const attrId = decoder.GetAttributeId(mesh, decoderAttr);

    if (attrId < 0) {
      return;
    }

    console.log('Adding %s attribute', attr);

    const attribute = decoder.GetAttribute(mesh, attrId);
    const attributeData = new decoderModule.DracoFloat32Array();
    decoder.GetAttributeFloatForAllPoints(mesh, attribute, attributeData);

    assert(numValues === attributeData.size(), 'Wrong attribute size.');

    const attributeDataArray = new Float32Array(numValues);
    for (let i = 0; i < numValues; ++i) {
      attributeDataArray[i] = attributeData.GetValue(i);
    }

    decoderModule.destroy(attributeData);
    meshBuilder.AddFloatAttributeToMesh(
      newMesh,
      encoderAttr,
      numPoints,
      stride,
      attributeDataArray
    );
  });

  let encodedData = new encoderModule.DracoInt8Array();
  // Set encoding options.
  encoder.SetSpeedOptions(5, 5);
  encoder.SetAttributeQuantization(encoderModule.POSITION, 10);
  encoder.SetEncodingMethod(encoderModule.MESH_EDGEBREAKER_ENCODING);

  // Encoding.
  console.log('Encoding...');
  const encodedLen = encoder.EncodeMeshToDracoBuffer(newMesh, encodedData);
  encoderModule.destroy(newMesh);

  if (encodedLen > 0) {
    console.log('Encoded size is ' + encodedLen);
  } else {
    console.log('Error: Encoding failed.');
  }
  // Copy encoded data to buffer.
  const outputBuffer = new ArrayBuffer(encodedLen);
  const outputData = new Int8Array(outputBuffer);
  for (let i = 0; i < encodedLen; ++i) {
    outputData[i] = encodedData.GetValue(i);
  }
  encoderModule.destroy(encodedData);
  encoderModule.destroy(encoder);
  encoderModule.destroy(meshBuilder);
  // Write to file. You can view the the file using webgl_loader_draco.html
  // example.
  fs.writeFile(
    'assets/sample_converted_v7.drc',
    Buffer(outputBuffer),
    'binary',
    function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log('The file was saved!');
      }
    }
  );
}
