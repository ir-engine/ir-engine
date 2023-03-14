import { AssetLoader } from '@etherealengine/engine/src/assets/classes/AssetLoader'
import { AssetType } from '@etherealengine/engine/src/assets/enum/AssetType'
import { ComponentDeserializeFunction } from '@etherealengine/engine/src/common/constants/PrefabFunctionType'
import { Entity } from '@etherealengine/engine/src/ecs/classes/Entity'
import {
  ComponentType,
  getComponent,
  getMutableComponent,
  hasComponent,
  setComponent
} from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { iterateEntityNode } from '@etherealengine/engine/src/ecs/functions/EntityTree'
import { LoadState, PrefabComponent } from '@etherealengine/engine/src/scene/components/PrefabComponent'

import { removeEntity } from '../../../ecs/functions/EntityFunctions'

export const unloadPrefab = (entity: Entity) => {
  if (!hasComponent(entity, PrefabComponent)) {
    console.warn('no Prefab component')
  } else {
    const prefabComponent = getComponent(entity, PrefabComponent)
    if (prefabComponent.loaded !== LoadState.LOADED) {
      console.warn('prefab', prefabComponent, 'is not in loaded state')
    }
    prefabComponent.roots.map((node) => {
      if (node) {
        const children = new Array()
        iterateEntityNode(node, (child, idx) => {
          children.push(child)
        })
        children.forEach((child) => {
          removeEntity(child)
        })
      }
    })
    if (hasComponent(entity, PrefabComponent)) {
      const prefab = getMutableComponent(entity, PrefabComponent)
      prefab.loaded.set(LoadState.UNLOADED)
      prefab.roots.set([])
    }
  }
}

export const loadPrefab = async (entity: Entity, loader = AssetLoader) => {
  const prefab = getComponent(entity, PrefabComponent)
  const prefabState = getMutableComponent(entity, PrefabComponent)
  //check if asset is already loading or loaded
  if (prefab.loaded !== LoadState.UNLOADED) {
    console.warn('Asset', prefab, 'is not unloaded')
    return
  }
  if (loader.getAssetType(prefab.src) !== AssetType.XRE) {
    throw Error('only .xre.gltf files currently supported')
  }
  try {
    prefabState.loaded.set(LoadState.LOADING)
    const result = (await loader.loadAsync(prefab.src, {
      assetRoot: entity
    })) as Entity[]
    prefabState.roots.set(result)
    prefabState.loaded.set(LoadState.LOADED)
  } catch (e) {
    prefabState.loaded.set(LoadState.UNLOADED)
    throw e
  }
}

export const deserializePrefab: ComponentDeserializeFunction = async (
  entity: Entity,
  data: ComponentType<typeof PrefabComponent>
) => {
  setComponent(entity, PrefabComponent, data)
  if (data.loaded === LoadState.LOADED) {
    getMutableComponent(entity, PrefabComponent).loaded.set(LoadState.UNLOADED)
    await loadPrefab(entity)
  }
}
