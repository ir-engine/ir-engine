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
  hasComponent,
  removeComponent,
  setComponent
} from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { EntityTreeNode } from '@xrengine/engine/src/ecs/functions/EntityTree'
import {
  AssemblyComponent,
  AssemblyComponentType,
  AssemblyLoadedComponent,
  LoadState,
  SCENE_COMPONENT_ASSEMBLY_DEFAULT_VALUES
} from '@xrengine/engine/src/scene/components/AssemblyComponent'

import { Engine } from '../../../ecs/classes/Engine'

export const unloadAsset = (entity: Entity) => {
  if (!hasComponent(entity, AssemblyComponent)) {
    console.warn('no Asset component')
  } else {
    const assetComp = getComponent(entity, AssemblyComponent)
    if (assetComp.loaded !== LoadState.LOADED) {
      console.warn('asset', assetComp, 'is not in loaded state')
    }
    if (!hasComponent(entity, AssemblyLoadedComponent)) {
      console.warn('no AssetLoaded component')
    } else {
      removeComponent(entity, AssemblyLoadedComponent)
    }
  }
}

export const loadAsset = async (entity: Entity, loader = AssetLoader) => {
  const asset = getComponent(entity, AssemblyComponent)
  //check if asset is already loading or loaded
  if (asset.loaded !== LoadState.UNLOADED) {
    console.warn('Asset', asset, 'is not unloaded')
    return
  }
  if (loader.getAssetType(asset.src) !== AssetType.XRE) {
    throw Error('only .xre.gltf files currently supported')
  }
  try {
    asset.loaded = LoadState.LOADING
    const result = (await loader.loadAsync(asset.src, {
      assetRoot: Engine.instance.currentWorld.entityTree.entityNodeMap.get(entity)!
    })) as EntityTreeNode[]
    addComponent(entity, AssemblyLoadedComponent, { roots: result })
  } catch (e) {
    asset.loaded = LoadState.UNLOADED
    throw e
  }
}

export const deserializeAsset: ComponentDeserializeFunction = async (entity: Entity, data: AssemblyComponentType) => {
  const props = parseAssetProperties(data)
  setComponent(entity, AssemblyComponent, props)
}

export const serializeAsset: ComponentSerializeFunction = (entity) => {
  const comp = getComponent(entity, AssemblyComponent) as AssemblyComponentType
  const metadata = comp.metadata ? { metadata: comp.metadata } : {}
  return {
    path: comp.src,
    ...metadata,
    loaded: comp.loaded
  }
}

const parseAssetProperties = (props): AssemblyComponentType => {
  const metadata = props.metadata ? { metadata: props.metadata } : {}
  return {
    name: props.name ? props.name : SCENE_COMPONENT_ASSEMBLY_DEFAULT_VALUES.name,
    src: props.path ? props.path : SCENE_COMPONENT_ASSEMBLY_DEFAULT_VALUES.path,
    ...metadata,
    loaded: typeof props.loaded === 'boolean' ? (props.loaded ? LoadState.LOADED : LoadState.UNLOADED) : props.loaded
  }
}
