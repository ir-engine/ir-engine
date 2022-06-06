import { AssetLoader } from '../../../assets/classes/AssetLoader'
import { AssetClass } from '../../../assets/enum/AssetClass'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent, removeComponent } from '../../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../../ecs/functions/EntityFunctions'
import { MaterialOverrideComponent, MaterialOverrideComponentType } from '../../components/MaterialOverrideComponent'
import { ModelComponent } from '../../components/ModelComponent'

export async function initializeOverride(target: Entity, override: MaterialOverrideComponentType) {
  const nuOR: MaterialOverrideComponentType = { ...override }
  if (nuOR.args) {
    await Promise.all(
      Object.entries(nuOR.args).map(async ([k, v], idx) => {
        if (typeof v === 'string' && AssetLoader.getAssetClass(v) === AssetClass.Image) {
          nuOR.args[k] = await AssetLoader.loadAsync(v)
        }
      })
    )
  }
  const entity = createEntity()
  nuOR.entity = entity
  nuOR.targetEntity = target
  return addComponent(entity, MaterialOverrideComponent, nuOR)
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
  model.materialOverrides = await Promise.all(
    model.materialOverrides.map(async (override) => await initializeOverride(target, override))
  )
}
