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
    if (lastRequestedKeyframe >= numberOfKeyframes -1) {
      clearInterval(fetchLoop);
      return (globalThis as any).postMessage({ type: "complete" });
    }

    console.log("******* FETCHING")

    let numberOfFramesToRequest = 0;

    let requestStartBytePosition, requestEndBytePosition
    let frames = [];
    let keyframePositions = [];
    let hasDataToSend = false;
    while(numberOfFramesToRequest < targetFramesToRequest && lastRequestedKeyframe < numberOfKeyframes - 1){
    // This is our new keyframe
    const newKeyframe = lastRequestedKeyframe;
    // Now increment one more
    lastRequestedKeyframe++;

    let keyframe = fileHeader.frameData[newKeyframe];

    if (keyframe === undefined) return console.log("Keyframe", newKeyframe, " is undefined");
    hasDataToSend = true;
    keyframePositions.push(frames.length);
    
    frames.push(keyframe);

    console.log("Requesting keyframe", newKeyframe);
    console.log("Keyframe header is", keyframe);

    if(!requestStartBytePosition) requestStartBytePosition = keyframe.startBytePosition;


    // Get count of frames associated with keyframe
    const iframes = fileHeader.frameData.filter(frame => frame.keyframeNumber === newKeyframe && frame.keyframeNumber !== frame.frameNumber).sort((a, b) => (a.frameNumber < b.frameNumber));
    
  if(iframes.length > 0 ) console.log("**** IFRAMES LENGTH IS", iframes.length);

    iframes.forEach((frame) => {
      frames.push(frame);
    })
    
    numberOfFramesToRequest += 1 + iframes.length;

    requestEndBytePosition = iframes.length > 0 ?
    iframes[iframes.length - 1].startBytePosition + iframes[iframes.length - 1].meshLength - requestStartBytePosition
    : keyframe.startBytePosition + keyframe.meshLength - requestStartBytePosition;
  }
  if(!hasDataToSend) return;
  console.log("Got", frames.length, " frames")

  console.log("********* REQEUESTING RANGE", requestStartBytePosition, requestEndBytePosition);
  rangeFetcher.getRange(meshFilePath, requestStartBytePosition, requestEndBytePosition).then(response => {
    let startBytePosition = 0;
    let messages = [];
      keyframePositions.forEach((position) => {
        let keyframe = fileHeader.frameData[keyframePositions[position]];

      // TODO: Handle iframes

      // Slice keyframe out by byte position
      const keyframeStartPosition = startBytePosition;
      const keyframeEndPosition = startBytePosition + keyframe.meshLength;
      startBytePosition = keyframeEndPosition;

      //@ts-ignore
      let decoder = new CortoDecoder(response.buffer.buffer, keyframeStartPosition, keyframeEndPosition);
      let keyframeMeshData = decoder.decode();

      ////////////////////
      // Slice data from returned response and decode
      ////////////////////

      // decode corto data and create a temp buffer geometry
      const bufferObject = {
        frameNumber: keyframe.frameNumber,
        keyframeNumber: keyframe.keyframeNumber,
        bufferGeometry: keyframeMeshData
      };

      const message = {
        keyframeBufferObject: bufferObject,
        //   iframeBufferObjects: []
      };

      messages.push(message);

      // // For each iframe...
      // for (const frameNo in iframes) {
      //   const iframe = iframes[frameNo];
      //   console.log("iframe is", iframes[frameNo]);
      //   const frameStartPosition = iframe.startBytePosition - requestStartBytePosition;
      //   const frameEndPosition = iframe.meshLength + frameStartPosition;
      //   console.log("frame start position: ", frameStartPosition, "frame end position:", frameEndPosition);
      //   // Slice iframe out, decode into list of position vectors

      //   //@ts-ignore
      //   let decoder = new CortoDecoder(response, frameStartPosition, frameEndPosition);
      //   let meshData = decoder.decode();
      //   let geometry = new BufferGeometry();
      //   geometry.setIndex(
      //     new Uint32BufferAttribute(keyframeMeshData.index, 1)
      //   );
      //   geometry.setAttribute(
      //     'position',
      //     new Float32BufferAttribute(meshData.position, 3)
      //   );
      //   geometry.setAttribute(
      //     'uv',
      //     new Float32BufferAttribute(keyframeMeshData.uv, 2)
      //   );

      //   console.log("Iframe meshData is", meshData);
      //   console.log("Decoded iframe", frameNo, "meshData is", meshData);
      //   // Check if iframe position is in ring buffer -- if so, update it, otherwise set it
      //   // decode corto data and create a temp buffer geometry
      //   const bufferObject: IFrameBuffer = {
      //     frameNumber: iframe.frameNumber,
      //     keyframeNumber: iframe.keyframeNumber,
      //     vertexBuffer: geometry
      //   };

      //   message.iframeBufferObjects.push(bufferObject);
      // }

      (globalThis as any).postMessage({ type: 'framedata', payload: messages });
    })

    });
  }, 100);

}

(globalThis as any).onmessage = function (e) {
  console.log('Received input: ', e.data); // message received from main thread
  if (e.data.type === 'initialize')
    startFetching(e.data.payload);
};
