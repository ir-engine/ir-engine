import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'
import { AudioTypeType } from '../constants/AudioConstants'

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
