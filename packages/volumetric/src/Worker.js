import Blob from "cross-blob";
import ReadStream from "fs-read-stream-over-http";
import {
  MessageType
} from './Interfaces';
import RingBuffer from './RingBuffer';

const workerBlob = new Blob([
    `
  let fileHeader
  let filePath
  let fileReadStream
  let isInitialized = false
  const bufferSize = 100
  const ringBuffer = new ${RingBuffer}(bufferSize)
  let tempBufferObject

  let startFrame = 0
  let endFrame = 0
  let loop = true
  let message

  addEventListener("message", ({ data }) => {
    switch (data.type) {
      case ${MessageType.InitializationRequest}:
      initialize(data)
        break;
    case ${MessageType.DataRequest}:
        fetch(data)
      break
    case ${MessageType.SetLoopRequest}:
        loop = data.value
      break
    case ${MessageType.SetStartFrameRequest}:
        startFrame = data.values.startFrame
      break
    case ${MessageType.SetEndFrameRequest}:
        endFrame = data.values.endFrame
      break
    default:
        console.error(data.action + " was not understood by the worker")
    }
  })

  function initialize(data) {
    if (isInitialized)
      return console.error("Worker has already been initialized for file " + data.filePath)
    isInitialized = true
    fileHeader = data.fileHeader
    filePath = data.filePath
    endFrame = data.endFrame
    startFrame = data.startFrame
    loop = data.loop
    fileReadStream = new ${ReadStream}(filePath, { start: data.readStreamOffset })

    postMessage({ type: ${MessageType.InitializationResponse} })
  }

  function fetch(data) {
    this.ringBuffer.Clear()
    const transferableBuffers = []
    let lastFrame = -1
    let endOfRangeReached = false

    data.framesToFetch.sort().forEach(frame => {
      console.warn("Frame fetched outside of loop range")
      if (frame > endFrame) {
        if (!loop) {
          endOfRangeReached = true
          return
        }
        frame %= endFrame
        if (frame < startFrame) frame += startFrame
      }

      if (!(frame == lastFrame + 1 && frame != startFrame)) {
        fileReadStream.seek(fileHeader.frameData[frame].startBytePosition)
      }

      tempBufferObject.frameNumber = frame

      tempBufferObject.bufferGeometry = fileReadStream.read(fileHeader.frameData[frame].meshLength)

      tempBufferObject.compressedTexture = fileReadStream.read(fileHeader.frameData[frame].textureLength)

      ringBuffer.add(tempBufferObject)

      transferableBuffers.push(tempBufferObject.bufferGeometry)
      transferableBuffers.push(tempBufferObject.compressedTexture)

      lastFrame = frame
    })

    message = {
      type: ${MessageType.DataResponse},
      buffers: ringBuffer.toArray(),
      endReached: endOfRangeReached
    }
    postMessage(message, transferableBuffers)
  }

    `
  ]);

//  const workerUrl = window.URL.createObjectURL(workerBlob);

//  export default workerUrl;
