import { PositionalAudio } from 'three'
import { createMappedComponent } from '../../ecs/functions/EntityFunctions'

export type PositionalAudioComponentType = {
  value: PositionalAudio
}

export const PositionalAudioComponent = createMappedComponent<PositionalAudioComponentType>()
