importScripts("https://unpkg.com/comlink/dist/umd/comlink.js")
importScripts("/face-api.js")
importScripts("/faceEnvWorkerPatch.js") // polyfill for face-api in webworker
let canvas
let imageData
const faceApiOptions = new faceapi.TinyFaceDetectorOptions()


const WebcamInputWorker = {
  initialise: async () => {
	  console.log('initialise0')
	faceapi.env.monkeyPatch({ canvas: OffscreenCanvas })
    await faceapi.nets.tinyFaceDetector.loadFromUri('/facetracking')
    await faceapi.nets.faceExpressionNet.loadFromUri('/facetracking')
    console.log('initialise1')
  },
  create: (width, height) => {
    canvas = new OffscreenCanvas(width, height)
    imageData = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height)
	
  },
  detect: async (pixels) => {
    console.log('detect0')
    if (canvas) {
      console.log('detect1')
      imageData.data.set(new Uint8ClampedArray(pixels))
	  console.log('detect2')
      canvas.getContext('2d').putImageData(imageData, 0, 0)
	  console.log('detect3')
      return await faceapi.detectSingleFace(canvas, faceApiOptions).withFaceExpressions()
    }
    return
  }
}

Comlink.expose(WebcamInputWorker)