import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'
import { AudioType, AudioTypeType } from '../constants/AudioConstants'

export type AudioComponentType = {
  volume: number
  audioType: AudioTypeType
  isMusic: boolean
  distanceModel: DistanceModelType
  rolloffFactor: number
  refDistance: number
  maxDistance: number
  coneInnerAngle: number
  coneOuterAngle: number
  coneOuterGain: number
}

export const AudioComponent = createMappedComponent<AudioComponentType>('AudioComponent')

export const SCENE_COMPONENT_AUDIO = 'audio'
export const SCENE_COMPONENT_AUDIO_DEFAULT_VALUES = {
  volume: 1,
  audioType: AudioType.Stereo as AudioTypeType,
  isMusic: false,
  distanceModel: 'linear' as DistanceModelType,
  rolloffFactor: 1,
  refDistance: 20,
  maxDistance: 1000,
  coneInnerAngle: 360,
  coneOuterAngle: 0,
  coneOuterGain: 0
} as AudioComponentType
