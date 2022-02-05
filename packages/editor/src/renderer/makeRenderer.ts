import { WebGLRenderer, PCFSoftShadowMap, LinearToneMapping, sRGBEncoding } from 'three'
import WebGL from '@xrengine/engine/src/renderer/THREE.WebGL'

export default function makeRenderer(width, height, props = {}) {
  let { canvas } = props as any
  if (!canvas) {
    canvas = document.createElement('canvas')
  }

  let supportWebGL2 = WebGL.isWebGL2Available()

  if (!supportWebGL2 && !WebGL.isWebGLAvailable()) {
    WebGL.dispatchWebGLDisconnectedEvent()
  }

  const context = supportWebGL2 ? canvas.getContext('webgl2') : canvas.getContext('webgl')
  const options = {
    ...props,
    canvas,
    context,
    antialias: true,
    preserveDrawingBuffer: true,
    logarithmicDepthBuffer: true
  }
  // const { safariWebBrowser } = window as any
  const renderer = new WebGLRenderer(options)
  renderer.physicallyCorrectLights = true
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = PCFSoftShadowMap
  renderer.outputEncoding = sRGBEncoding
  renderer.toneMapping = LinearToneMapping
  renderer.toneMappingExposure = 2
  renderer.setSize(width, height, false)

  return renderer
}
