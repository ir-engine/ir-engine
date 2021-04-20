import { CortoDecoder } from "./corto";
let _meshFilePath;
let fetchLoop;
let lastRequestedKeyframe = 0;
let _lastFrameId;
let _fileHeader;
function startFetching({
  targetFramesToRequest,
  meshFilePath,
  numberOfKeyframes,
  fileHeader
}) {
  _meshFilePath = meshFilePath;
  _lastFrameId = numberOfKeyframes - 1;
  _fileHeader = fileHeader;
  globalThis.postMessage({ type: "initialized" });


  fetchLoop = async () => {
    if (lastRequestedKeyframe >= _lastFrameId) {
      globalThis.postMessage({ type: "complete" });
      return;
    }

    let startFrame

    let numberOfFramesRequested = 1;

    startFrame = lastRequestedKeyframe
    while (numberOfFramesRequested < targetFramesToRequest && lastRequestedKeyframe < _lastFrameId) {
      numberOfFramesRequested++;
      lastRequestedKeyframe++;
    }

    const startFrameData = _fileHeader.frameData[startFrame];
    const requestStartBytePosition = startFrameData.startBytePosition;

    let endFrame = lastRequestedKeyframe;
    const endFrameData = _fileHeader.frameData[endFrame];

    numberOfFramesRequested++;
    lastRequestedKeyframe++;

    const requestEndBytePosition = endFrameData.startBytePosition + endFrameData.meshLength;

    const response = await fetch(_meshFilePath, {
        headers: {
            'range': `bytes=${requestStartBytePosition}-${requestEndBytePosition}`,
        }
      }).catch(err=> {console.error("WORKERERROR: ", err)});

    let messages = []
    const buffer = await response.arrayBuffer().catch(err => {console.error("Weird error", err)});
    for (let i = startFrame; i <= endFrame; i++) {

      const currentFrameData = _fileHeader.frameData[i];
      // Slice keyframe out by byte position
      const fileReadStartPosition = currentFrameData.startBytePosition - startFrameData.startBytePosition;
      const fileReadEndPosition = fileReadStartPosition + currentFrameData.meshLength;

      // console.log("fileReadStartPosition", fileReadStartPosition);
      // console.log("fileReadEndPosition", fileReadEndPosition);
      const sliced = buffer.slice(fileReadStartPosition, fileReadEndPosition);

      let decoder = new CortoDecoder(sliced);

      let bufferGeometry = decoder.decode();

      // decode corto data and create a temp buffer geometry
      const bufferObject = {
        frameNumber: currentFrameData.frameNumber,
        keyframeNumber: currentFrameData.keyframeNumber,
        bufferGeometry
      };
      // console.log("i", i, bufferObject);
      messages.push(bufferObject);
    }
    // console.log("Posting payload", messages);
    globalThis.postMessage({ type: 'framedata', payload: messages });
    fetchLoop();
  }
  fetchLoop();

}

globalThis.onmessage = function (e) {
  // console.log('Received input: ', e.data); // message received from main thread
  if (e.data.type === 'initialize')
    startFetching(e.data.payload);
};
