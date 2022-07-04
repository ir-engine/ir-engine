import { Texture, TextureLoader, Wrapping } from 'three'

import { AssetLoader } from '../../../assets/classes/AssetLoader'
import { AssetClass } from '../../../assets/enum/AssetClass'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent, removeComponent } from '../../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../../ecs/functions/EntityFunctions'
import loadVideoTexture from '../../../renderer/materials/LoadVideoTexture'
import { DefaultArguments } from '../../../renderer/materials/MaterialLibrary'
import { formatMaterialArgs } from '../../../renderer/materials/Utilities'
import { MaterialOverrideComponent, MaterialOverrideComponentType } from '../../components/MaterialOverrideComponent'
import { ModelComponent } from '../../components/ModelComponent'

/**
 * Initializes material override in ecs system
 * @param target Entity holding the target model component
 * @param override Override data to be applied to target model
 * @returns Async function that executes loading textures and returns completely initialized override
 */
export function initializeOverride(target: Entity, override: MaterialOverrideComponentType) {
  const nuOR: MaterialOverrideComponentType = { ...override }
  const entity = createEntity()
  nuOR.entity = entity
  nuOR.targetEntity = target
  return async () => {
    if (nuOR.args) {
      const defaultArgs = DefaultArguments[nuOR.materialID]
      nuOR.args = formatMaterialArgs({ ...nuOR.args }, defaultArgs)
      await Promise.all(
        Object.entries(nuOR.args).map(async ([k, v], idx) => {
          if (defaultArgs[k].type === 'texture' && typeof v === 'string') {
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
    model.materialOverrides.map(async (override) => await initializeOverride(target, override)())
  )
  return model.materialOverrides
}
