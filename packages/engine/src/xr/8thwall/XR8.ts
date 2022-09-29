import { getState } from '@xrengine/hyperflux'

import { Engine } from '../../ecs/classes/Engine'
import { EngineState } from '../../ecs/classes/EngineState'
import { World } from '../../ecs/classes/World'
import { EngineRenderer } from '../../renderer/WebGLRendererSystem'
import { XREPipeline } from './WebXR8thwallProxy'
import { XR8CameraModule } from './XR8CameraModule'
import { XR8Type } from './XR8Types'

const apikey = process.env['VITE_8TH_WALL']

type XR8Assets = {
  xr8Script: HTMLScriptElement
  xrExtrasScript: HTMLScriptElement
}
/**
 * Initializes the scripts that loads 8thwall
 * @returns
 */
const initialize8thwall = async (): Promise<XR8Assets> => {
  const [xr8Script, xrExtrasScript] = await Promise.all([
    new Promise<HTMLScriptElement>((resolve, reject) => {
      const _8thwallScript = document.createElement('script')
      _8thwallScript.async = true
      _8thwallScript.addEventListener('load', () => resolve(_8thwallScript))
      _8thwallScript.addEventListener('error', () => reject())
      document.head.appendChild(_8thwallScript)
      _8thwallScript.src = `https://apps.8thwall.com/xrweb?appKey=${apikey}`
    }),
    new Promise<HTMLScriptElement>((resolve, reject) => {
      const _xrExtrasScript = document.createElement('script')
      _xrExtrasScript.async = true
      _xrExtrasScript.addEventListener('load', () => resolve(_xrExtrasScript))
      _xrExtrasScript.addEventListener('error', () => reject())
      document.head.appendChild(_xrExtrasScript)
      _xrExtrasScript.src = `https://cdn.8thwall.com/web/xrextras/xrextras.js`
    })
  ])

  /** the global XR8 object will not exist immediately, so wait for it */
  await new Promise<void>((resolve, reject) => {
    const interval = setInterval(() => {
      if (globalThis.XR8) {
        clearTimeout(timeout)
        clearInterval(interval)
        resolve()
      }
    }, 100)
    const timeout = setTimeout(() => {
      clearInterval(interval)
      reject()
    }, 30000) // 30 seconds
  })

  XR8 = globalThis.XR8
  XRExtras = globalThis.XRExtras

  return {
    xr8Script,
    xrExtrasScript
  }
}

export let XR8: XR8Type
export let XRExtras

const initialize8thwallDevice = () => {
  XR8.addCameraPipelineModules([
    XR8.GlTextureRenderer.pipelineModule(), // Draws the camera feed.
    // XR8.XrController.pipelineModule(),           // Enables SLAM tracking.
    // window.LandingPage.pipelineModule(),         // Detects unsupported browsers and gives hints.
    // XRExtras.Loading.pipelineModule(),           // Manages the loading screen on startup.
    XRExtras.RuntimeError.pipelineModule() // Shows an error image on runtime error.
  ])

  const cameraCanvas = document.createElement('canvas')
  cameraCanvas.id = 'camera-canvas'
  cameraCanvas.style.position = 'fixed'
  cameraCanvas.style.zIndex = '-10000' // put behind canvas (and everything else)
  cameraCanvas.style.height = '100%'
  cameraCanvas.style.width = '100%'
  cameraCanvas.style.pointerEvents = 'none'
  cameraCanvas.style.userSelect = 'none'

  XR8.addCameraPipelineModule(XR8CameraModule(cameraCanvas))
  XR8.addCameraPipelineModule(XREPipeline())

  XR8.run({ canvas: cameraCanvas })

  const engineContainer = document.getElementById('engine-container')!
  engineContainer.appendChild(cameraCanvas)

  Engine.instance.currentWorld.scene.background = null

  return cameraCanvas
}

export default async function XR8System(world: World) {
  const _8thwallScript = await initialize8thwall()
  const cameraCanvas = initialize8thwallDevice()

  const execute = () => {
    /** temporary */
    Engine.instance.currentWorld.scene.background = null
  }

  const cleanup = async () => {
    _8thwallScript.xr8Script.remove()
    _8thwallScript.xrExtrasScript.remove()
    cameraCanvas.remove()
  }

  return {
    execute,
    cleanup
  }
}
