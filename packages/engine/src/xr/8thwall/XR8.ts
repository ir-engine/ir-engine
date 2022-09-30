import { dispatchAction, getState } from '@xrengine/hyperflux'

import { FollowCameraComponent } from '../../camera/components/FollowCameraComponent'
import { EventDispatcher } from '../../common/classes/EventDispatcher'
import { World } from '../../ecs/classes/World'
import { addComponent, getComponent, removeComponent } from '../../ecs/functions/ComponentFunctions'
import { EngineRenderer } from '../../renderer/WebGLRendererSystem'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { XRAction } from '../XRAction'
import { XRHitTestComponent } from '../XRComponents'
import { endXRSession, requestXRSession, setupARSession } from '../XRSessionFunctions'
import { XRState } from '../XRState'
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

const initialize8thwallDevice = (world: World) => {
  XR8.addCameraPipelineModules([
    XR8.GlTextureRenderer.pipelineModule(), // Draws the camera feed.
    XR8.Threejs.pipelineModule(),
    XR8.XrController.pipelineModule({
      // enableLighting: true
      // enableWorldPoints: true,
      // imageTargets: true,
      // enableVps: true
    }),
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
  XR8.addCameraPipelineModule(XREPipeline(world))

  const engineContainer = document.getElementById('engine-container')!
  engineContainer.appendChild(cameraCanvas)

  return cameraCanvas
}

class XRSessionProxy extends EventDispatcher {
  constructor() {
    super()
  }
  async requestReferenceSpace() {
    return null
  }
}

export default async function XR8System(world: World) {
  const _8thwallScript = await initialize8thwall()
  const xrState = getState(XRState)
  xrState.supportedSessionModes['immersive-ar'].set(true)

  const cameraCanvas = initialize8thwallDevice(world)

  let prevFollowCamera
  requestXRSession.implementation = async (action) => {
    prevFollowCamera = getComponent(world.cameraEntity, FollowCameraComponent)
    removeComponent(world.cameraEntity, FollowCameraComponent)
    XR8.run({ canvas: cameraCanvas })
    dispatchAction(XRAction.sessionChanged({ active: true }))

    EngineRenderer.instance.xrSession = new XRSessionProxy() as any as XRSession
    xrState.sessionActive.set(true)

    setupARSession(world)
    xrState.sessionMode.set('immersive-ar')
  }

  endXRSession.implementation = async () => {
    addComponent(world.cameraEntity, FollowCameraComponent, prevFollowCamera)
    dispatchAction(XRAction.sessionChanged({ active: false }))
  }

  let lastSeenBackground = world.scene.background

  const execute = () => {
    const sessionActive = xrState.sessionActive.value
    const xr8scene = XR8.Threejs.xrScene()
    if (sessionActive && xr8scene) {
      if (world.scene.background) lastSeenBackground = world.scene.background
      world.scene.background = null
      const { camera } = xr8scene
      world.camera.position.copy(camera.position)
      world.camera.quaternion.copy(camera.quaternion)
      world.dirtyTransforms.add(world.cameraEntity)
    } else {
      if (!world.scene.background && lastSeenBackground) world.scene.background = lastSeenBackground
      lastSeenBackground = null
      return
    }

    const hitTestResults = XR8.XrController.hitTest(0.5, 0.5, ['FEATURE_POINT'])
    const viewerHitTestEntity = xrState.viewerHitTestEntity.value
    const hitTestComponent = getComponent(viewerHitTestEntity, XRHitTestComponent)

    if (hitTestResults.length) {
      const { position, rotation } = hitTestResults[0]
      const transform = getComponent(viewerHitTestEntity, TransformComponent)
      transform.position.copy(position)
      transform.rotation.copy(rotation)
      transform.matrix.compose(transform.position, transform.rotation, transform.scale)
      transform.matrixInverse.copy(transform.matrix).invert()
      hitTestComponent.hasHit.set(true)
    } else {
      hitTestComponent.hasHit.set(false)
    }
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
