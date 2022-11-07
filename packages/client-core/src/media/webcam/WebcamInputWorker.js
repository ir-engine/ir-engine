import './faceEnvWorkerPatch.js' // polyfill for face-api in webworker - MUST BE FIRST
import * as Comlink from 'comlink'
import { detectSingleFace, nets, TinyFaceDetectorOptions } from '@vladmandic/face-api'

let canvas
let imageData
const faceApiOptions = new TinyFaceDetectorOptions()

Comlink.expose({
  initialise: async () => {
    const origin = globalThis.process.env.BASE_URL === '/client/' ? location.origin : globalThis.process.env.BASE_URL
    await nets.tinyFaceDetector.loadFromUri(origin + '/facetracking')
    await nets.faceExpressionNet.loadFromUri(origin + '/facetracking')
  },
  create: (width, height) => {
    canvas = new OffscreenCanvas(width, height)
    imageData = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height)
  },
  detect: async (pixels) => {
    if (canvas) {
      imageData.data.set(new Uint8ClampedArray(pixels))
      canvas.getContext('2d').putImageData(imageData, 0, 0)
      return await detectSingleFace(canvas, faceApiOptions).withFaceExpressions()
    }
    return
  }
})
