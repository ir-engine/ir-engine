import { Behavior } from '../../../../common/interfaces/Behavior'
import { Entity } from '../../../../ecs/classes/Entity'
import { getComponent } from '../../../../ecs/functions/EntityFunctions'
import { Object3DComponent } from '../../../../scene/components/Object3DComponent'

/**
 * @author HydraFire <github.com/HydraFire>
 */

export const setHideModel: Behavior = (
  entity: Entity,
  args?: any,
  delta?: number,
  entityTarget?: Entity,
  time?: number,
  checks?: any
): void => {
  // if we loaded this collider with a model, make it invisible
  getComponent(entity, Object3DComponent)?.value?.traverse((obj) => (obj.visible = false))
}
