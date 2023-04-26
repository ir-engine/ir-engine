import { defineState } from '@etherealengine/hyperflux'

export const MediaSettingsState = defineState({
  name: 'MediaSettingsState',
  initial: {
    immersiveMedia: false,
    refDistance: 20,
    rolloffFactor: 1,
    maxDistance: 10000,
    distanceModel: 'linear' as DistanceModelType,
    coneInnerAngle: 360,
    coneOuterAngle: 0,
    coneOuterGain: 0
  }
})
