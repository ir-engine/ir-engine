import * as Comlink from 'comlink'
// TODO: Separate me into client!
// import { detectSingleFace } from '@xrengine/client-ml/src/face/globalApi/detectFaces';
// import { nets } from '@xrengine/client-ml/src/face/globalApi/nets';
// import { TinyFaceDetectorOptions } from '@xrengine/client-ml/src/face/tinyFaceDetector/TinyFaceDetectorOptions';
import './faceEnvWorkerPatch.js' // polyfill for face-api in webworker
let canvas
let imageData
// const faceApiOptions = new TinyFaceDetectorOptions();
Comlink.expose({
  initialise: async () => {
    // await nets.tinyFaceDetector.loadFromUri('/facetracking');
    // await nets.faceExpressionNet.loadFromUri('/facetracking');
  },
  create: (width, height) => {
    canvas = new OffscreenCanvas(width, height)
    imageData = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height)
  },
  detect: async (pixels) => {
    if (canvas) {
      imageData.data.set(new Uint8ClampedArray(pixels))
      canvas.getContext('2d').putImageData(imageData, 0, 0)
      // return await detectSingleFace(canvas, faceApiOptions).withFaceExpressions();
    }
    return
  }
})
