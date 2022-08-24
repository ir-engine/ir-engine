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
    avatarControlMode: 'auto' as 'auto' | 'attached' | 'detached'
  })
})

export const getControlMode = () => {
  const controlMode = getState(XRState).avatarControlMode.value
  const sessionMode = getState(XRState).sessionMode.value
  if (controlMode === 'auto') {
    return sessionMode === 'immersive-vr' || sessionMode === 'inline' ? 'attached' : 'detatched'
  }
  return controlMode
}
