import { useEffect } from 'react'

import { createActionQueue, getMutableState, removeActionQueue } from '@etherealengine/hyperflux'

import { defineSystem } from '../ecs/functions/SystemFunctions'
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

const reactor = () => {
  useEffect(() => {
    navigator.xr?.addEventListener('devicechange', updateSessionSupport)
    updateSessionSupport()

    return () => {
      navigator.xr?.removeEventListener('devicechange', updateSessionSupport)
      removeActionQueue(xrRequestSessionQueue)
      removeActionQueue(xrEndSessionQueue)
      removeActionQueue(xrSessionChangedQueue)
    }
  }, [])
  return null
}

export const XRSystem = defineSystem({
  uuid: 'ee.engine.XRSystem',
  execute,
  reactor
})
