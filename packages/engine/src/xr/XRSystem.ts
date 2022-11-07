import { createActionQueue, getState, removeActionQueue } from '@xrengine/hyperflux'

import XR8 from './8thwall/XR8'
import { World } from './../ecs/classes/World'
import XRAnchorSystem from './XRAnchorSystem'
import XRCameraSystem from './XRCameraSystem'
import XRControllerSystem from './XRControllerSystem'
import XRDepthOcclusion from './XRDepthOcclusion'
import XRHapticsSystem from './XRHapticsSystem'
import XRLightProbeSystem from './XRLightProbeSystem'
import XRScenePlacementShader from './XRScenePlacementShader'
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
      () => Promise.resolve({ default: XR8 }),
      () => Promise.resolve({ default: XRAnchorSystem }),
      () => Promise.resolve({ default: XRCameraSystem }),
      () => Promise.resolve({ default: XRControllerSystem }),
      () => Promise.resolve({ default: XRHapticsSystem }),
      () => Promise.resolve({ default: XRLightProbeSystem }),
      // () => Promise.resolve({ default: XRDepthOcclusion }),
      () => Promise.resolve({ default: XRScenePlacementShader })
    ]
  }
}
