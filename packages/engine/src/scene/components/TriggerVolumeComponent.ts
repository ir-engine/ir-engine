import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type TriggerVolumeComponentType = {
  onEnter: string
  onExit: string
  target: any
  active: boolean
}

export const TriggerVolumeComponent = createMappedComponent<TriggerVolumeComponentType>('TriggerVolumeComponent')
