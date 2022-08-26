import { defineState, getState } from '@xrengine/hyperflux'

export const XRState = defineState({
  name: 'XRState',
  initial: () => ({
    sessionActive: false,
    scenePlacementMode: false,
    supportedSessionModes: {
      inline: false,
      'immersive-ar': false,
      'immersive-vr': false
    },
    sessionMode: 'none' as 'inline' | 'immersive-ar' | 'immersive-vr' | 'none',
    /**
     * The `avatarControlMode` property can be 'auto', 'attached', or 'detached'.
     * When `avatarControlMode` is 'attached' the avatar's head is attached to the XR display.
     * When `avatarControlMode` is 'detached' the avatar can move freely via movement controls (e.g., joystick).
     * When `avatarControlMode` is 'auto', the avatar will switch between these modes automtically based on the current XR session mode and other heursitics.
     */
    avatarControlMode: 'auto' as 'auto' | 'attached' | 'detached',
    originReferenceSpace: null! as XRReferenceSpace | null
  })
})

export const getControlMode = () => {
  const { avatarControlMode, sessionMode, sessionActive } = getState(XRState).value
  if (!sessionActive) return 'none'
  if (avatarControlMode === 'auto') {
    return sessionMode === 'immersive-vr' || sessionMode === 'inline' ? 'attached' : 'detached'
  }
  return avatarControlMode
}
