import { createMappedComponent } from '../../ecs/functions/EntityFunctions'

export type TriggerVolumeComponentType = {
  args: any
  target: any
  onTriggerEnter: any
  onTriggerExit: any
  active: boolean
}

export const TriggerVolumeComponent = createMappedComponent<TriggerVolumeComponentType>()
