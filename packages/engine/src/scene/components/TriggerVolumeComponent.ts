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

export const SCENE_COMPONENT_TRIGGER_VOLUME = 'trigger-volume'
export const SCENE_COMPONENT_TRIGGER_VOLUME_DEFAULT_VALUES = {}
