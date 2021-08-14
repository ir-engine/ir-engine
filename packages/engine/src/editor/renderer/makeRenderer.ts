import { WebGL1Renderer, WebGLRenderer, PCFSoftShadowMap, LinearToneMapping, sRGBEncoding } from 'three'
export default function makeRenderer(width, height, props = {}) {
  let { canvas } = props as any
  if (!canvas) {
    canvas = document.createElement('canvas')
  }
  let context
  try {
    context = canvas.getContext('webgl2', { antialias: true })
  } catch (error) {
    context = canvas.getContext('webgl', { antialias: true })
  }
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
