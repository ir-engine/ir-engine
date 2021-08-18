import { createMappedComponent } from '../../ecs/functions/EntityFunctions'

export type TriggerVolumeComponentType = {
  ref: any
  target: any
  onTriggerEnter: any
  onTriggerExit: any
  active: boolean
}

export const TriggerVolumeComponent = createMappedComponent<TriggerVolumeComponentType>()
