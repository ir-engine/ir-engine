import { defineState } from '@xrengine/hyperflux'

export const XRState = defineState({
  name: 'XRState',
  initial: () => ({
    sessionActive: false,
    scenePlacementMode: false,
    supportedSessionModes: {
      inline: false,
      'immersive-ar': false,
      'immersive-vr': false
    }
  })
})
