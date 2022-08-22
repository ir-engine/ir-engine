import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type TriggerVolumeComponentType = {
  /**
   * The function to call on the CallbackComponent of the targetEntity when the trigger volume is entered.
   */
  onEnter: string
  /**
   * The function to call on the CallbackComponent of the targetEntity when the trigger volume is exited.
   */
  onExit: string
  /**
   * uuid (string)
   *
   * empty string represents self
   *
   * TODO: how do we handle non-scene entities?
   */
  target: string
  active: boolean
}

export const TriggerVolumeComponent = createMappedComponent<TriggerVolumeComponentType>('TriggerVolumeComponent')

export const SCENE_COMPONENT_TRIGGER_VOLUME = 'trigger-volume'
export const SCENE_COMPONENT_TRIGGER_VOLUME_DEFAULT_VALUES = {}
