importScripts(location.origin + '/corto/corto.js', location.origin + '/corto/rangeFetcher.js');

function startFetching({
  meshFilePath,
  numberOfKeyframes,
  fileHeader,
  targetFramesToRequest
}) {
  //@ts-ignore
  let rangeFetcher = new HttpRangeFetcher({});
  (globalThis as any).postMessage({ type: "initialized" });

  let fetchLoop;
  let lastRequestedKeyframe = 0;

  fetchLoop = setInterval(() => {
    if (lastRequestedKeyframe >= numberOfKeyframes - 1) {
      clearInterval(fetchLoop);
      return (globalThis as any).postMessage({ type: "complete" });
    }

    let numberOfFramesToRequest = 0;
    let requestStartBytePosition, requestEndBytePosition
    let frames = [];
    let keyframePositions = [];
    let keyframe = null;

    // This is our new keyframe
    keyframe = fileHeader.frameData[lastRequestedKeyframe];

    keyframePositions.push(lastRequestedKeyframe);

    frames.push(keyframe);

    requestStartBytePosition = keyframe.startBytePosition;
    requestEndBytePosition = keyframe.startBytePosition + keyframe.meshLength;

    // Now increment one more
    lastRequestedKeyframe++;
    numberOfFramesToRequest++;

    let messages = [];

    rangeFetcher.getRange(meshFilePath, requestStartBytePosition, requestEndBytePosition).then(response => {

        let startBytePosition = 0;

        keyframePositions.forEach((position) => {

          console.log("HANDLING FRAME: ", position)

          let keyframe = fileHeader.frameData[position];

          // Slice keyframe out by byte position
          const keyframeStartPosition = startBytePosition;
          const keyframeEndPosition = startBytePosition + keyframe.meshLength;

          console.log("Keyframe start position is:", keyframeStartPosition);
          console.log("Keyframe end position is: ", keyframeEndPosition);
          //@ts-ignore
          let decoder = new CortoDecoder(response.buffer.buffer, keyframeStartPosition, keyframeEndPosition);
          let keyframeMeshData = decoder.decode();
          startBytePosition = keyframeEndPosition + 1;

          // decode corto data and create a temp buffer geometry
          const bufferObject = {
            frameNumber: keyframe.frameNumber,
            keyframeNumber: keyframe.keyframeNumber,
            bufferGeometry: keyframeMeshData
          };

          const message = {
            keyframeBufferObject: bufferObject,
          };

          messages.push(message);

        console.log("Posting data:", messages);
        (globalThis as any).postMessage({ type: 'framedata', payload: messages });
      })
    }).catch(error => {
      console.log("ERROR: ", error);
    });
  }, 20);

}

(globalThis as any).onmessage = function (e) {
  console.log('Received input: ', e.data); // message received from main thread
  if (e.data.type === 'initialize')
    startFetching(e.data.payload);
};