import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type TriggerVolumeComponentType = {
  onEnter: string
  onExit: string
  /**
   * uuid (string)
   *
   * empty string represents self
   */
  target: string
  active: boolean
}

export const TriggerVolumeComponent = createMappedComponent<TriggerVolumeComponentType>('TriggerVolumeComponent')
