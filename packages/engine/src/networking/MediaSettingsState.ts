import { defineState } from '@etherealengine/hyperflux'

export const DefaultMediaState = {
  immersiveMedia: false,
  refDistance: 20,
  rolloffFactor: 1,
  maxDistance: 10000,
  distanceModel: 'linear' as DistanceModelType,
  coneInnerAngle: 360,
  coneOuterAngle: 0,
  coneOuterGain: 0
}

export const MediaSettingsState = defineState({
  name: 'MediaSettingsState',
  initial: DefaultMediaState
})
