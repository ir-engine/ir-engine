import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'
import { AudioTypeType } from '../constants/AudioConstants'

export type AudioComponentType = {
  audioSource: string
  volume: number
  audioType: AudioTypeType
  distanceModel: DistanceModelType
  rolloffFactor: number
  refDistance: number
  maxDistance: number
  coneInnerAngle: number
  coneOuterAngle: number
  coneOuterGain: number
}

export const AudioComponent = createMappedComponent<AudioComponentType>('AudioComponent')
