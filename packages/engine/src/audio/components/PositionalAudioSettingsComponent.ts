import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type PositionalAudioSettingsComponentType = {
  refDistance: number
  rolloffFactor: number
  maxDistance: number
  distanceModel: DistanceModelType
  coneInnerAngle: number
  coneOuterAngle: number
  coneOuterGain: number
}

export const PositionalAudioSettingsComponent = createMappedComponent<PositionalAudioSettingsComponentType>(
  'PositionalAudioSettingsComponent'
)

export const SCENE_COMPONENT_AUDIO_SETTINGS = 'audio-settings'
export const SCENE_COMPONENT_AUDIO_SETTINGS_DEFAULT_VALUES = {
  refDistance: 20,
  rolloffFactor: 1,
  maxDistance: 10000,
  distanceModel: 'linear' as DistanceModelType,
  coneInnerAngle: 360,
  coneOuterAngle: 0,
  coneOuterGain: 0
} as PositionalAudioSettingsComponentType
