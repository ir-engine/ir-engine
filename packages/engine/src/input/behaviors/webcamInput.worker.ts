import * as Comlink from 'comlink'
import './faceEnvWorkerPatch.js' // polyfill for face-api in webworker
import { nets, detectSingleFace, TinyFaceDetectorOptions } from "face-api.js";

const faceApiOptions = new TinyFaceDetectorOptions();
Comlink.expose({
  initialise: async () => {
    await nets.tinyFaceDetector.loadFromUri('/facetracking');
    await nets.faceExpressionNet.loadFromUri('/facetracking');
  },
  detect: async ({ pixels, width, height }) => {
    const canvas = new OffscreenCanvas(width, height)
    const imageData = canvas.getContext('2d').getImageData(0, 0, width, height);
    imageData.data.set(new Uint8ClampedArray(pixels))
    canvas.getContext('2d').putImageData(imageData, 0, 0)
    //@ts-ignore
    const detection = await detectSingleFace(canvas, faceApiOptions).withFaceExpressions()
    return detection
  }
})