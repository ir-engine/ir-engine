import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent, removeComponent } from '../../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../../ecs/functions/EntityFunctions'
import { MaterialOverrideComponent, MaterialOverrideComponentType } from '../../components/MaterialOverrideComponent'
import { ModelComponent } from '../../components/ModelComponent'

export function initializeOverride(target: Entity, override: MaterialOverrideComponentType) {
  const entity = createEntity()
  override.entity = entity
  override.targetEntity = target
  return addComponent(entity, MaterialOverrideComponent, override)
}

export async function refreshMaterials(target: Entity) {
  const model = getComponent(target, ModelComponent)
  await Promise.all(
    model.materialOverrides
      .filter((override) => override.entity != -1)
      .map((override) => {
        removeComponent(override.entity, MaterialOverrideComponent)
      })
  )
  await new Promise((resolve) => {
    setTimeout(resolve, 15)
  })
  await Promise.all(
    (model.materialOverrides = model.materialOverrides.map((override) => initializeOverride(target, override)))
  )
}
