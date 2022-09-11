import { AssetLoader } from '../../../assets/classes/AssetLoader'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent, removeComponent } from '../../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../../ecs/functions/EntityFunctions'
import { formatMaterialArgs, materialIdToDefaultArgs } from '../../../renderer/materials/functions/Utilities'
import { MaterialLibrary } from '../../../renderer/materials/MaterialLibrary'
import { MaterialOverrideComponent, MaterialOverrideComponentType } from '../../components/MaterialOverrideComponent'
import { ModelComponent } from '../../components/ModelComponent'
import { SceneObjectComponent } from '../../components/SceneObjectComponent'

/**
 * Initializes material override in ecs system
 * @param target Entity holding the target model component
 * @param override Override data to be applied to target model
 * @returns Async function that executes loading textures and returns completely initialized override
 */
export function initializeOverride(target: Entity, override: MaterialOverrideComponentType) {
  const nuOR: MaterialOverrideComponentType = { ...override }
  if (!MaterialLibrary.materials.has(override.materialID)) {
    console.warn('unrecognized material ID ' + nuOR.materialID + ' on entity ' + target)
    return undefined
  }
  const entity = createEntity()
  addComponent(entity, SceneObjectComponent, true)
  nuOR.entity = entity
  nuOR.targetEntity = target
  return async () => {
    if (nuOR.args) {
      const defaultArgs = materialIdToDefaultArgs(nuOR.materialID)
      nuOR.args = formatMaterialArgs({ ...nuOR.args }, defaultArgs)
      await Promise.all(
        Object.entries(nuOR.args).map(async ([k, v]) => {
          if (defaultArgs[k]?.type === 'texture' && typeof v === 'string') {
            const nuTxr = await AssetLoader.loadAsync(v)
            nuOR.args[k] = nuTxr
          }
        })
      )
    }
    return addComponent(entity, MaterialOverrideComponent, nuOR)
  }
}

/**
 * Reapplies all material overrides on the target entity
 * @param target
 * @returns
 */
export async function refreshMaterials(target: Entity) {
  const model = getComponent(target, ModelComponent)
  await Promise.all(
    model.materialOverrides
      .filter((override) => override.entity != -1)
      .map((override) => {
        removeComponent(override.entity!, MaterialOverrideComponent)
      })
  )
  await new Promise((resolve) => {
    setTimeout(resolve, 100)
  })
  model.materialOverrides = await Promise.all(
    model.materialOverrides.map(async (override) => await initializeOverride(target, override)?.())
  ).then((overrides) => overrides.filter((override) => override !== undefined) as MaterialOverrideComponentType[])
  return model.materialOverrides
}
