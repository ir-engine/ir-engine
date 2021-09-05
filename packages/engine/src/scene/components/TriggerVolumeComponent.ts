import { createMappedComponent } from '../../ecs/functions/EntityFunctions'

export type TriggerVolumeComponentType = {
  args: any
  target: any
  active: boolean
}

export const TriggerVolumeComponent = createMappedComponent<TriggerVolumeComponentType>()
