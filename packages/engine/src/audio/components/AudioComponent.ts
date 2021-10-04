import { Audio } from 'three'
import { createMappedComponent } from '../../ecs/ComponentFunctions'

export type AudioComponentType = {
  value: Audio<GainNode>
}

export const AudioComponent = createMappedComponent<AudioComponentType>('AudioComponent')
