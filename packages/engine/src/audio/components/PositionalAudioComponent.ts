import { PositionalAudio } from 'three'

import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type PositionalAudioComponentType = {
  value: PositionalAudio
}

export const PositionalAudioComponent = createMappedComponent<PositionalAudioComponentType>('PositionalAudioComponent')
