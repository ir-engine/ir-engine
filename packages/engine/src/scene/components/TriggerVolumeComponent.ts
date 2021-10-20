import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type TriggerVolumeComponentType = {
  args: any
  target: any
  active: boolean
}

export const TriggerVolumeComponent = createMappedComponent<TriggerVolumeComponentType>('TriggerVolumeComponent')
