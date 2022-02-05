import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type PositionalAudioSettingsComponentType = {
  avatarDistanceModel: DistanceModelType
  avatarMaxDistance: number
  avatarRefDistance: number
  avatarRolloffFactor: number
  mediaConeInnerAngle: number
  mediaConeOuterAngle: number
  mediaConeOuterGain: number
  mediaDistanceModel: DistanceModelType
  mediaMaxDistance: number
  mediaRefDistance: number
  mediaRolloffFactor: number
  mediaVolume: number
  usePositionalAudio: boolean
}

export const PositionalAudioSettingsComponent = createMappedComponent<PositionalAudioSettingsComponentType>(
  'PositionalAudioSettingsComponent'
)
