import { createActionQueue, getState, removeActionQueue } from '@xrengine/hyperflux'

import { World } from './../ecs/classes/World'
import { endXRSession, requestXRSession, xrSessionChanged } from './XRSessionFunctions'
import { XRAction, XRState } from './XRState'

/**
 * System for XR session and input handling
 */
export default async function XRSystem(world: World) {
  const xrState = getState(XRState)

  const updateSessionSupportForMode = (mode: XRSessionMode) => {
    navigator.xr?.isSessionSupported(mode).then((supported) => xrState.supportedSessionModes[mode].set(supported))
  }

  const updateSessionSupport = () => {
    updateSessionSupportForMode('inline')
    updateSessionSupportForMode('immersive-ar')
    updateSessionSupportForMode('immersive-vr')
  }

  navigator.xr?.addEventListener('devicechange', updateSessionSupport)
  updateSessionSupport()

  const xrRequestSessionQueue = createActionQueue(XRAction.requestSession.matches)
  const xrEndSessionQueue = createActionQueue(XRAction.endSession.matches)
  const xrSessionChangedQueue = createActionQueue(XRAction.sessionChanged.matches)

  const execute = () => {
    const xrRequestSessionAction = xrRequestSessionQueue().pop()
    const xrEndSessionAction = xrEndSessionQueue().pop()
    if (xrRequestSessionAction) requestXRSession(xrRequestSessionAction)
    if (xrEndSessionAction) endXRSession()
    for (const action of xrSessionChangedQueue()) xrSessionChanged(action)
  }

  const cleanup = async () => {
    navigator.xr?.removeEventListener('devicechange', updateSessionSupport)
    removeActionQueue(xrRequestSessionQueue)
    removeActionQueue(xrEndSessionQueue)
    removeActionQueue(xrSessionChangedQueue)
  }

  return {
    execute,
    cleanup,
    subsystems: [
      () => import('./8thwall/XR8'),
      () => import('./XRAnchorSystem'),
      () => import('./XRCameraSystem'),
      () => import('./XRControllerSystem'),
      () => import('./XRLightProbeSystem'),
      // () => import('./XRDepthOcclusion'),
      () => import('./XRScenePlacementShader')
    ]
  }
}
