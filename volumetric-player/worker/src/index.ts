// import ReadStream from 'fs-readstream-seek';
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

let fileHeader: IFileHeader;
let filePath: string;
// let fileReadStream: ReadStream;
let isInitialized = false;
const bufferSize = 100;
const ringBuffer = new RingBuffer<IBuffer>(bufferSize);
let tempBufferObject: IBuffer;

let startFrame = 0;
let endFrame = 0;
let loop = true;
let message: WorkerDataResponse;

// var ctx = self;
// ctx.addEventListener('message', function (event) {
//   console.log('Inside worker of bundler');
//   console.log(event);
//   ctx.postMessage('Hello');
// });

self.addEventListener('message', (event) => {
  console.log('34', (<any>event).data.type);
  const data = (<any>event).data.data;
  switch (data.type) {
    case MessageType.InitializationResponse:
      initialize(data);
      break;
    case MessageType.DataRequest:
      fetch(data);
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
  console.log('59', data);
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
  // fileReadStream = new ReadStream(filePath, { start: data.readStreamOffset })

  postMessage({
    type: MessageType.InitializationResponse,
    isInitialized: isInitialized,
  } as WorkerInitializationResponse);
}
