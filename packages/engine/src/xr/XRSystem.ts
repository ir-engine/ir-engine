import { useEffect } from 'react'

import { defineActionQueue, getMutableState } from '@etherealengine/hyperflux'

import { defineSystem } from '../ecs/functions/SystemFunctions'
import { XR8System } from './8thwall/XR8'
import { VPSSystem } from './VPSSystem'
import { XRCameraSystem } from './XRCameraSystem'
import { XRCameraViewSystem } from './XRCameraViewSystem'
import { XRDetectedPlanesSystem } from './XRDetectedPlanesSystem'
import { XRHapticsSystem } from './XRHapticsSystem'
import { XRInputSourceSystem } from './XRInputSourceSystem'
import { XRLightProbeSystem } from './XRLightProbeSystem'
import { XRPersistentAnchorSystem } from './XRPersistentAnchorSystem'
import { XRScenePlacementShaderSystem } from './XRScenePlacementShaderSystem'
import { endXRSession, requestXRSession, xrSessionChanged } from './XRSessionFunctions'
import { XRAction, XRState } from './XRState'

/**
 * System for XR session and input handling
 */

const xrState = getMutableState(XRState)

const updateSessionSupportForMode = (mode: XRSessionMode) => {
  navigator.xr?.isSessionSupported(mode).then((supported) => xrState.supportedSessionModes[mode].set(supported))
}

const updateSessionSupport = () => {
  updateSessionSupportForMode('inline')
  updateSessionSupportForMode('immersive-ar')
  updateSessionSupportForMode('immersive-vr')
}

const xrRequestSessionQueue = defineActionQueue(XRAction.requestSession.matches)
const xrEndSessionQueue = defineActionQueue(XRAction.endSession.matches)
const xrSessionChangedQueue = defineActionQueue(XRAction.sessionChanged.matches)

const execute = () => {
  const xrRequestSessionAction = xrRequestSessionQueue().pop()
  const xrEndSessionAction = xrEndSessionQueue().pop()
  if (xrRequestSessionAction) requestXRSession(xrRequestSessionAction)
  if (xrEndSessionAction) endXRSession()
  for (const action of xrSessionChangedQueue()) xrSessionChanged(action)
}

const reactor = () => {
  useEffect(() => {
    navigator.xr?.addEventListener('devicechange', updateSessionSupport)
    updateSessionSupport()

    return () => {
      navigator.xr?.removeEventListener('devicechange', updateSessionSupport)
    }
  }, [])
  return null
}

export const XRSystem = defineSystem({
  uuid: 'ee.engine.XRSystem',
  execute,
  reactor,
  subSystems: [
    XR8System,
    VPSSystem,
    XRCameraSystem,
    XRCameraViewSystem,
    XRDetectedPlanesSystem,
    XRHapticsSystem,
    XRInputSourceSystem,
    XRLightProbeSystem,
    XRPersistentAnchorSystem,
    XRScenePlacementShaderSystem
  ]
})
