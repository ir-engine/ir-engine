import { ComponentSchema, PropertyType, SelectSchema } from '../../common/functions/deserializers'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'
import { SkyTypeEnum } from '../../scene/constants/SkyTypeEnum'
import { AudioType, AudioTypeType } from '../constants/AudioConstants'

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

export const AudioSchema: ComponentSchema<AudioComponentType> = {
  audioSource: {
    type: PropertyType.STRING,
    defaultValue: ''
  },
  volume: {
    type: PropertyType.NUMBER,
    defaultValue: SkyTypeEnum.color,
    min: 0,
    max: 1
  },
  audioType: {
    type: PropertyType.SELECT,
    defaultValue: AudioType.Positional
  } as SelectSchema<AudioTypeType>,
  distanceModel: {
    type: PropertyType.SELECT,
    defaultValue: 'linear'
  } as SelectSchema<DistanceModelType>,
  rolloffFactor: {
    type: PropertyType.NUMBER,
    defaultValue: 1
  },
  refDistance: {
    type: PropertyType.NUMBER,
    defaultValue: 20
  },
  maxDistance: {
    type: PropertyType.NUMBER,
    defaultValue: 1000
  },
  coneInnerAngle: {
    type: PropertyType.NUMBER,
    defaultValue: 120
  },
  coneOuterAngle: {
    type: PropertyType.NUMBER,
    defaultValue: 180
  },
  coneOuterGain: {
    type: PropertyType.NUMBER,
    defaultValue: 0
  }
}

export const AudioComponent = createMappedComponent<AudioComponentType>('AudioComponent')
