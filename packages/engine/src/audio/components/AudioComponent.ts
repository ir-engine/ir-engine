import { Audio } from 'three'
import { createMappedComponent } from '../../ecs/functions/EntityFunctions'

export type AudioComponentType = {
  value: Audio<GainNode>
}

export const AudioComponent = createMappedComponent<AudioComponentType>()
