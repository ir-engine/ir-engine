import { PositionalAudio } from 'three'
import { createMappedComponent } from '../../ecs/functions/EntityFunctions'

type PositionalAudioComponentType = {
  value: PositionalAudio
}

export const PositionalAudioComponent = createMappedComponent<PositionalAudioComponentType>()