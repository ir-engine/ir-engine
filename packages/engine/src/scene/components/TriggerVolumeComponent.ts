import { createMappedComponent } from '../../ecs/ComponentFunctions'

export type TriggerVolumeComponentType = {
  args: any
  target: any
  active: boolean
}

export const TriggerVolumeComponent = createMappedComponent<TriggerVolumeComponentType>('TriggerVolumeComponent')
