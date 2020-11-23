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
const fetch = require('node-fetch');

let fileHeader: IFileHeader;
let isInitialized = false;
const bufferSize = 100;
let tempBufferObject: IBuffer;
let readStreamOffset = 0;

let startFrame = 0;
let endFrame = 0;
let loop = true;
let message: WorkerDataResponse;

self.addEventListener('message', (event) => {
  const data = (<any>event).data;
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
  endFrame = data.endFrame;
  startFrame = data.startFrame;
  loop = data.loop;
  readStreamOffset = data.readStreamOffset;

  //@ts-ignore
  postMessage({
    type: MessageType.InitializationResponse,
    isInitialized: isInitialized,
  } as WorkerInitializationResponse);
}

async function fetchData(data: WorkerDataRequest): Promise<void> {
  // Clear Ring Buffer
  // ringBuffer.clear();
  const ringBuffer = new RingBuffer<IBuffer>(data.framesToFetch.length);

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

  // Iterate over values in ascending order...
  data.framesToFetch.forEach((frame) => {
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

    fetch('https://thawing-harbor-02376.herokuapp.com/dracosis-stream', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    })
      .then((res) => {
        // @ts-ignore
        return res.arrayBuffer();
      })
      .then((buffer) => {
        const bufferGeom = buffer.slice(
          0,
          fileHeader.frameData[frame].meshLength
        );

        const bufferTex = buffer.slice(fileHeader.frameData[frame].meshLength);

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
          // postMessage(message);
          postMessage(message);
        }
      });

    lastFrame = frame;
  });
}
