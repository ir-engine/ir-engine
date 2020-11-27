import ReadStream from "fs-read-stream-over-http"
import RingBuffer from "./RingBuffer"
import { MessageType } from "./Enums"

let fileHeader
let filePath
let fileReadStream
let isInitialized = false
const bufferSize = 100
const ringBuffer = new RingBuffer(bufferSize)
let tempBufferObject

let startFrame = 0
let endFrame = 0
let loop = true
let message

self.addEventListener("message", ({ data }) => {
  switch (data.type) {
    case MessageType.InitializationRequest:
    initialize(data)
      break
  case MessageType.DataRequest:
      fetch(data)
    break
  case MessageType.SetLoopRequest:
      loop = data.value
    break
  case MessageType.SetStartFrameRequest:
      startFrame = data.values.startFrame
    break
  case MessageType.SetEndFrameRequest:
      endFrame = data.values.endFrame
    break
  default:
      console.error(data.action + " was not understood by the worker")
  }
})

function initialize(data) {
  if (isInitialized) return console.error("Worker has already been initialized for file " + data.filePath)

  isInitialized = true
  fileHeader = data.fileHeader
  filePath = data.filePath
  endFrame = data.endFrame
  startFrame = data.startFrame
  loop = data.loop
  // Create readstream starting from after the file header and long
  fileReadStream = new ReadStream(filePath, { start: data.readStreamOffset })

  postMessage({ type: MessageType.InitializationResponse }, "*")
}

function fetch(data) {
  // Clear Ring Buffer
  this.ringBuffer.Clear()
  // Make a list of buffers to transfer
  const transferableBuffers = []
  let lastFrame = -1
  let endOfRangeReached = false

  // Iterate over values in ascending order...
  data.framesToFetch.sort().forEach(frame => {
    //  If this frame > end frame...
    // ... warn the dev, since this might be unexpected
    console.warn("Frame fetched outside of loop range")
    if (frame > endFrame) {
      // If loop is off, flag end reached
      if (!loop) {
        endOfRangeReached = true
        return
      }
      // If loop is on, make sure the frame request fits within start and end frame range
      frame %= endFrame
      // If the start frame is not zero, add to the current frame number
      if (frame < startFrame) frame += startFrame
    }

    // If we're not reading from the position of the last frame, seek to start frame
    if (!(frame == lastFrame + 1 && frame != startFrame)) {
      // Get frame start byte pose
      fileReadStream.seek(fileHeader.frameData[frame].startBytePosition)
    }

    // tell the stream reader to read out the next bytes..
    // Set temp buffer object frame number
    tempBufferObject.frameNumber = frame

    // Then mesh
    tempBufferObject.bufferGeometry = fileReadStream.read(fileHeader.frameData[frame].meshLength)

    // Then texture
    tempBufferObject.compressedTexture = fileReadStream.read(fileHeader.frameData[frame].textureLength)

    // Add it to the ring buffer
    ringBuffer.add(tempBufferObject)

    // Add buffers to transferableBuffers
    transferableBuffers.push(tempBufferObject.bufferGeometry)
    transferableBuffers.push(tempBufferObject.compressedTexture)

    // Set the last frame
    lastFrame = frame
  })

  // Post message
  // Set whether end was reached
  message = {
    type: MessageType.DataResponse,
    buffers: ringBuffer.toArray(),
    endReached: endOfRangeReached
  }
  postMessage(message, "*", transferableBuffers)
}
