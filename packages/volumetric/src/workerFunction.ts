let _meshFilePath;
let fetchLoop;
let lastRequestedKeyframe = 0;
let _numberOfKeyframes;
let _fileHeader;
import { CortoDecoder } from "./corto";
import { HttpRangeFetcher } from "http-range-fetcher";

function startFetching({
  meshFilePath,
  numberOfKeyframes,
  fileHeader
}) {
  let rangeFetcher = new HttpRangeFetcher({chunkSize: 32768, maxFetchSize: 32768 * 64});
  console.log("Range fetcher");
  console.log(rangeFetcher);
  _meshFilePath = meshFilePath;
  _numberOfKeyframes = numberOfKeyframes;
  _fileHeader = fileHeader;
  (globalThis as any).postMessage({ type: "initialized" });



  fetchLoop = setInterval(() => {
    if (lastRequestedKeyframe >= _numberOfKeyframes) {
      clearInterval(fetchLoop);
      (globalThis as any).postMessage({ type: "complete" });
    }

    let startFrame = lastRequestedKeyframe;
    let numberOfFramesRequested = 0;
    let _targetFramesToRequest = 1;

    while(numberOfFramesRequested < _targetFramesToRequest && lastRequestedKeyframe < numberOfKeyframes - 1){
      numberOfFramesRequested++;
      lastRequestedKeyframe++;
    }

    let endFrame = lastRequestedKeyframe;

    const startFrameData = _fileHeader.frameData[startFrame];
    const endFrameData = _fileHeader.frameData[endFrame];

    const requestStartBytePosition = startFrameData.startBytePosition;

    const requestEndBytePosition = endFrameData.startBytePosition + endFrameData.meshLength;

    rangeFetcher.getRange(_meshFilePath, requestStartBytePosition, requestEndBytePosition).then(response => {

      const messages = []
      for(let i = startFrame; i < endFrame; i++){

        const currentFrameData = _fileHeader.frameData[i];
      // Slice keyframe out by byte position
      const fileReadStartPosition = currentFrameData.startBytePosition - startFrameData.startBytePosition;
      const fileReadEndPosition = currentFrameData.startBytePosition + currentFrameData.meshLength - startFrameData.startBytePosition;

      let decoder = new CortoDecoder(response.buffer.buffer, fileReadStartPosition, fileReadEndPosition);
      let bufferGeometry = decoder.decode();

      // decode corto data and create a temp buffer geometry
      const bufferObject = {
        frameNumber: currentFrameData.frameNumber,
        keyframeNumber: currentFrameData.keyframeNumber,
        bufferGeometry
      };

      const message = {
        keyframeBufferObject: bufferObject,
        //   iframeBufferObjects: []
      };
      messages.push(message);
    }

      (globalThis as any).postMessage({ type: 'framedata', payload: messages });
    }).catch(error => {console.error(error)})
  }, 10);

}

(globalThis as any).onmessage = function (e) {
  console.log('Received input: ', e.data); // message received from main thread
  if (e.data.type === 'initialize')
    startFetching(e.data.payload);
};
