import { ComponentName } from '../../common/constants/ComponentNames'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type PositionalAudioSettingsComponentType = {
  avatarDistanceModel: string
  avatarMaxDistance: number
  avatarRefDistance: number
  avatarRolloffFactor: number
  mediaConeInnerAngle: number
  mediaConeOuterAngle: number
  mediaConeOuterGain: number
  mediaDistanceModel: string
  mediaMaxDistance: number
  mediaRefDistance: number
  mediaRolloffFactor: number
  mediaVolume: number
  usePositionalAudio: boolean
}

export const PositionalAudioSettingsComponent = createMappedComponent<PositionalAudioSettingsComponentType>(
  ComponentName.AUDIO_SETTINGS
)
