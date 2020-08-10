import ReadStream from 'fs-readstream-seek';
// import * as pathToRegExp from 'path-to-regexp';
import {
  IFileHeader,
  WorkerDataRequest,
  IBuffer,
  WorkerDataResponse,
  WorkerInitializationResponse,
  WorkerInitializationRequest,
} from './Interfaces';
import { RingBuffer } from 'ring-buffer-ts';
import { MessageType } from './Enums';
import { decodeDracoData } from './DecodeCodecHelpers';
// import * as draco3d from 'draco3d';
import axios from 'axios';
const fetch = require('node-fetch');

import {
  Scene,
  BufferGeometry,
  SphereBufferGeometry,
  CompressedTexture,
  BoxBufferGeometry,
  MeshBasicMaterial,
  MeshStandardMaterial,
  MeshPhongMaterial,
  Mesh,
  FileLoader,
} from 'three';

let fileHeader: IFileHeader;
let filePath: string;
let fileReadStream: ReadStream;
let isInitialized = false;
const bufferSize = 100;
const ringBuffer = new RingBuffer<IBuffer>(bufferSize);
let tempBufferObject: IBuffer;
let readStreamOffset = 0;

let startFrame = 0;
let endFrame = 0;
let loop = true;
let message: WorkerDataResponse;
// let _decoderModule = draco3d.createDecoderModule({});

// const decoderModule = draco3d.createDecoderModule({});
// console.log('31 decoder', decoderModule);

self.addEventListener('message', (event) => {
  const data = (<any>event).data;
  console.log(data);
  const type = (<any>event).data.type;
  switch (type) {
    case MessageType.InitializationRequest:
      initialize(data);
      break;
    case MessageType.DataRequest:
      fetchData(event.data);
      break;
    case MessageType.SetLoopRequest:
      loop = data.value;
      break;
    case MessageType.SetStartFrameRequest:
      startFrame = data.values.startFrame;
      break;
    case MessageType.SetEndFrameRequest:
      endFrame = data.values.endFrame;
      break;
    default:
      console.error(data.action + ' was not understood by the worker');
  }
});

function initialize(data: WorkerInitializationRequest): void {
  if (isInitialized)
    return console.error(
      'Worker has already been initialized for file ' + data.filePath
    );

  isInitialized = true;
  fileHeader = data.fileHeader;
  filePath = data.filePath;
  endFrame = data.endFrame;
  startFrame = data.startFrame;
  loop = data.loop;
  // Create readstream starting from after the file header and long
  // fileReadStream = new ReadStream(filePath, { start: data.readStreamOffset });

  readStreamOffset = data.readStreamOffset;

  postMessage({
    type: MessageType.InitializationResponse,
    isInitialized: isInitialized,
  } as WorkerInitializationResponse);
}

async function fetchData(data: WorkerDataRequest): Promise<void> {
  // Clear Ring Buffer
  ringBuffer.clear();
  // Make a list of buffers to transfer
  let transferableBuffers: Buffer[] = [];
  let lastFrame = -1;
  let endOfRangeReached = false;

  tempBufferObject = {
    frameNumber: 1,
    bufferGeometry: null,
    compressedTexture: null,
  };

  let count = 0;

  // var loader = new FileLoader();
  // loader.setResponseType('arraybuffer');
  // loader.load(
  //   filePath,

  //   function (data) {
  //     const startBytePosition = 1299;
  //     const meshLength = 428890;
  //     console.log('hello');
  //     console.log(typeof data);
  //     // const startData = Buffer.alloc(startBytePosition);
  //     // @ts-ignore
  //     // data.copy(startData, 0, 0, startBytePosition);
  //     // console.log('124', data.length);
  //     // console.log('125', data);
  //   },

  //   // onProgress callback
  //   function (xhr) {
  //     console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
  //   },

  //   // onError callback
  //   function (err) {
  //     console.error('An error happened');
  //   }
  // );

  // fetch('http://localhost:8000/dracosis-file')
  //   .then((res) => {
  //     console.log(res.status);
  //     console.log(res.statusText);
  //     console.log(res.headers.get('content-type'));
  //     // @ts-ignore
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

  // Iterate over values in ascending order...
  data.framesToFetch.sort().forEach((frame) => {
    //  If this frame > end frame...
    // ... warn the dev, since this might be unexpected

    if (frame > endFrame) {
      console.warn('Frame fetched outside of loop range');
      // If loop is off, flag end reached
      if (!loop) {
        endOfRangeReached = true;
        return;
      }
      // If loop is on, make sure the frame request fits within start and end frame range
      frame %= endFrame;
      // If the start frame is not zero, add to the current frame number
      if (frame < startFrame) frame += startFrame;
    }

    const body = {
      startByte:
        readStreamOffset + fileHeader.frameData[frame].startBytePosition,
      meshLength: fileHeader.frameData[frame].meshLength,
      textureLength: fileHeader.frameData[frame].textureLength,
    };

    console.log('Body', body);

    fetch('http://localhost:8000/dracosis-stream', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    })
      .then((res) => {
        console.log(res.status);
        console.log(res);
        // @ts-ignore
        return res.arrayBuffer();
        // return res.buffer();
      })
      .then((buffer) => {
        // const geometryString = text.substring(startBytePosition, meshLength);
        // const bufferGeom = Buffer.from(geometryString);
        // console.log(hexdump(buffer));
        console.log('202 inside fetch');
        console.log(buffer.byteLength);

        const bufferGeom = buffer.slice(
          0,
          fileHeader.frameData[frame].meshLength
        );

        const bufferTex = buffer.slice(
          fileHeader.frameData[frame].meshLength,
          fileHeader.frameData[frame].textureLength
        );
        // const bufferGeom = Buffer.alloc(fileHeader.frameData[frame].meshLength);
        // const bufferTex = Buffer.alloc(
        //   fileHeader.frameData[frame].textureLength
        // );

        // buffer.copy(bufferGeom, 0, 0, fileHeader.frameData[frame].meshLength);
        // buffer.copy(bufferTex, 0, fileHeader.frameData[frame].meshLength);

        tempBufferObject.frameNumber = frame;
        tempBufferObject.bufferGeometry = bufferGeom;
        tempBufferObject.compressedTexture = bufferTex;

        ringBuffer.add(tempBufferObject);

        // Add buffers to transferableBuffers
        transferableBuffers.push(tempBufferObject.bufferGeometry);
        transferableBuffers.push(tempBufferObject.compressedTexture);

        tempBufferObject = {
          frameNumber: 0,
          bufferGeometry: null,
          compressedTexture: null,
        };

        count++;

        // Set whether end was reached
        if (count == ringBuffer.getSize()) {
          // Post message
          message = {
            type: MessageType.DataResponse,
            buffers: ringBuffer.toArray(),
            endReached: endOfRangeReached,
          };
          console.log('RingBuffer', ringBuffer);
          // postMessage(message);
          postMessage(message);
        }
      });

    // axios
    //   .post('http://localhost:8000/dracosis-stream', {
    //     startByte:
    //       readStreamOffset + fileHeader.frameData[frame].startBytePosition,
    //     meshLength: fileHeader.frameData[frame].meshLength,
    //     textureLength: fileHeader.frameData[frame].textureLength,
    //   })
    //   .then(function (response) {
    //     // If we're not reading from the position of the last frame, seek to start frame
    //     if (!(frame == lastFrame + 1 && frame != startFrame)) {
    //       // Get frame start byte pose
    //       // fileReadStream.seek(fileHeader.frameData[frame].startBytePosition);
    //     }

    //     const bufferGeom = Buffer.alloc(fileHeader.frameData[frame].meshLength);
    //     const bufferTex = Buffer.alloc(
    //       fileHeader.frameData[frame].textureLength
    //     );

    //     const buffer = Buffer.from(<any>response.data);
    //     buffer.copy(bufferGeom, 0, 0, fileHeader.frameData[frame].meshLength);
    //     buffer.copy(bufferTex, 0, fileHeader.frameData[frame].meshLength);

    //     console.log('Buffer Geomtery', bufferGeom);

    //     // bufferTex.write(<any>response.data, fileHeader.frameData[frame].meshLength, )

    //     // tell the stream reader to read out the next bytes..
    //     // Set temp buffer object frame number
    //     tempBufferObject.frameNumber = frame;

    //     // Then mesh
    //     // tempBufferObject.bufferGeometry = fileReadStream.read(
    //     //   fileHeader.frameData[frame].meshLength
    //     // );
    //     tempBufferObject.bufferGeometry = bufferGeom;

    //     // Then texture
    //     // tempBufferObject.compressedTexture = fileReadStream.read(
    //     //   fileHeader.frameData[frame].textureLength
    //     // );
    //     tempBufferObject.compressedTexture = bufferTex;

    //     // Add it to the ring buffer
    //     ringBuffer.add(tempBufferObject);

    //     // Add buffers to transferableBuffers
    //     transferableBuffers.push(tempBufferObject.bufferGeometry);
    //     transferableBuffers.push(tempBufferObject.compressedTexture);

    //     tempBufferObject = {
    //       frameNumber: 0,
    //       bufferGeometry: null,
    //       compressedTexture: null,
    //     };

    //     count++;

    //     // Set whether end was reached
    //     if (count == ringBuffer.getSize()) {
    //       // Post message
    //       message = {
    //         type: MessageType.DataResponse,
    //         buffers: ringBuffer.toArray(),
    //         endReached: endOfRangeReached,
    //       };
    //       console.log('RingBuffer', ringBuffer);
    //       // postMessage(message);
    //       postMessage(message);
    //     }
    //   });
    // Set the last frame
    lastFrame = frame;
  });
}
