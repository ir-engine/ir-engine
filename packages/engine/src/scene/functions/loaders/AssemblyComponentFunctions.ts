import { Object3D } from 'three'

import { AssetLoader } from '@xrengine/engine/src/assets/classes/AssetLoader'
import { AssetType } from '@xrengine/engine/src/assets/enum/AssetType'
import {
  ComponentDeserializeFunction,
  ComponentSerializeFunction
} from '@xrengine/engine/src/common/constants/PrefabFunctionType'
import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import {
  addComponent,
  getComponent,
  getComponentState,
  hasComponent,
  removeComponent,
  setComponent,
  useComponent
} from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import {
  EntityTreeNode,
  iterateEntityNode,
  removeEntityNodeFromParent
} from '@xrengine/engine/src/ecs/functions/EntityTree'
import {
  AssemblyComponent,
  AssemblyComponentType,
  LoadState
} from '@xrengine/engine/src/scene/components/AssemblyComponent'

import { Engine } from '../../../ecs/classes/Engine'
import { removeEntity } from '../../../ecs/functions/EntityFunctions'

export const unloadAsset = (entity: Entity) => {
  if (!hasComponent(entity, AssemblyComponent)) {
    console.warn('no Asset component')
  } else {
    const assetComp = getComponent(entity, AssemblyComponent)
    if (assetComp.loaded !== LoadState.LOADED) {
      console.warn('asset', assetComp, 'is not in loaded state')
    }
    assetComp.roots.map((node) => {
      if (node) {
        const children = new Array()
        iterateEntityNode(node, (child, idx) => {
          children.push(child)
        })
        children.forEach((child) => {
          removeEntityNodeFromParent(child)
          removeEntity(child.entity)
        })
      }
    })
    if (hasComponent(entity, AssemblyComponent)) {
      const asset = getComponentState(entity, AssemblyComponent)
      asset.loaded.set(LoadState.UNLOADED)
      asset.roots.set([])
    }
  }
}

export const loadAsset = async (entity: Entity, loader = AssetLoader) => {
  const asset = getComponent(entity, AssemblyComponent)
  const assetState = getComponentState(entity, AssemblyComponent)
  //check if asset is already loading or loaded
  if (asset.loaded !== LoadState.UNLOADED) {
    console.warn('Asset', asset, 'is not unloaded')
    return
  }
  if (loader.getAssetType(asset.src) !== AssetType.XRE) {
    throw Error('only .xre.gltf files currently supported')
  }
  try {
    assetState.loaded.set(LoadState.LOADING)
    const result = (await loader.loadAsync(asset.src, {
      assetRoot: Engine.instance.currentWorld.entityTree.entityNodeMap.get(entity)!
    })) as EntityTreeNode[]
    assetState.roots.set(result)
    assetState.loaded.set(LoadState.LOADED)
  } catch (e) {
    assetState.loaded.set(LoadState.UNLOADED)
    throw e
  }
}

export const deserializeAsset: ComponentDeserializeFunction = async (entity: Entity, data: AssemblyComponentType) => {
  setComponent(entity, AssemblyComponent, data)
}
