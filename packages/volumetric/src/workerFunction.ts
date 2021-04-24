import { CortoDecoder } from "./corto";
let _meshFilePath;
let _fileHeader;

type requestPayload = {
  frameStart: number,
  frameEnd: number
}

const messageQueue: requestPayload[] = [];

function addMessageToQueue(payload: requestPayload) {
  messageQueue.push(payload);
  console.log("Message added to queue", payload);
}

function startHandlerLoop({
  meshFilePath,
  numberOfFrames,
  fileHeader
}) {
  _meshFilePath = meshFilePath;
  _fileHeader = fileHeader;
  (globalThis as any).postMessage({ type: "initialized" });

  setInterval(async () => {
    if (messageQueue.length < 1)
      return;

      let {
        frameStart,
        frameEnd
      } = messageQueue.shift();

      const requestedOverLoop = frameEnd < frameStart;
      if (requestedOverLoop) {
        // We have a loop!
        // Split the request into two
        addMessageToQueue({
          frameStart: 0,
          frameEnd
        })
      }

      const startFrameData = _fileHeader.frameData[frameStart];
      const endFrameData = _fileHeader.frameData[!requestedOverLoop ? frameEnd : numberOfFrames - 1];
      const requestStartBytePosition = startFrameData.startBytePosition;
      const requestEndBytePosition = endFrameData.startBytePosition + endFrameData.meshLength;

      const outgoingMessages = []

      const response = await fetch(_meshFilePath, {
        headers: {
          'range': `bytes=${requestStartBytePosition}-${requestEndBytePosition}`,
        }
      }).catch(err => { console.error("WORKERERROR: ", err) });

      const buffer = await (response as Response).arrayBuffer().catch(err => { console.error("Weird error", err) });
      for (let i = frameStart; i <= frameEnd; i++) {
        const currentFrameData = _fileHeader.frameData[i];

        const fileReadStartPosition = currentFrameData.startBytePosition - startFrameData.startBytePosition;
        const fileReadEndPosition = fileReadStartPosition + currentFrameData.meshLength;

        // Decode the geometry using Corto codec
        const slice = (buffer as ArrayBuffer).slice(fileReadStartPosition, fileReadEndPosition);
        const decoder = new CortoDecoder(slice);
        const bufferGeometry = decoder.decode();

        // Add to the messageQueue
        outgoingMessages.push({
          frameNumber: currentFrameData.frameNumber,
          keyframeNumber: currentFrameData.keyframeNumber,
          bufferGeometry
        });
      }
      // console.log("Posting payload", messages);
      (globalThis as any).postMessage({ type: 'framedata', payload: outgoingMessages });    
  }, 100);
}

(globalThis as any).onmessage = function (e) {
  if (e.data.type === 'initialize')
    startHandlerLoop(e.data.payload);
  if (e.data.type === 'request')
    addMessageToQueue(e.data.payload);
};
