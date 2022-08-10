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
