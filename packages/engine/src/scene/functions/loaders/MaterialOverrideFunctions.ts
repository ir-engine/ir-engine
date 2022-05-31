import { Entity } from '../../../ecs/classes/Entity'
import { addComponent } from '../../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../../ecs/functions/EntityFunctions'
import { MaterialOverrideComponent, MaterialOverrideComponentType } from '../../components/MaterialOverrideComponent'

export function initializeOverride(target: Entity, override: MaterialOverrideComponentType) {
  const entity = createEntity()
  override.entity = entity
  override.targetEntity = target
  return addComponent(entity, MaterialOverrideComponent, override)
}
