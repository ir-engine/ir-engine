import { Object3D } from 'three'

import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'
import { AssetLoader } from '@xrengine/engine/src/assets/classes/AssetLoader'
import { AssetType } from '@xrengine/engine/src/assets/enum/AssetType'
import {
  ComponentDeserializeFunction,
  ComponentSerializeFunction
} from '@xrengine/engine/src/common/constants/PrefabFunctionType'
import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { EntityTreeNode } from '@xrengine/engine/src/ecs/classes/EntityTree'
import {
  addComponent,
  getComponent,
  hasComponent,
  removeComponent
} from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import {
  AssetComponent,
  AssetComponentType,
  AssetLoadedComponent,
  LoadState
} from '@xrengine/engine/src/scene/components/AssetComponent'
import { EntityNodeComponent } from '@xrengine/engine/src/scene/components/EntityNodeComponent'
import { Object3DComponent, Object3DWithEntity } from '@xrengine/engine/src/scene/components/Object3DComponent'

import { sceneToGLTF } from '../GLTFConversion'

export const SCENE_COMPONENT_ASSET = 'asset'
export const SCENE_COMPONENT_ASSET_DEFAULT_VALUES = {
  name: '',
  path: '',
  loaded: LoadState.UNLOADED
}

export const unloadAsset = (entity: Entity) => {
  if (!hasComponent(entity, AssetComponent)) {
    console.warn('no Asset component')
  } else {
    const assetComp = getComponent(entity, AssetComponent)
    if (assetComp.loaded !== LoadState.LOADED) {
      console.warn('asset', assetComp, 'is not in loaded state')
    }
    if (!hasComponent(entity, AssetLoadedComponent)) {
      console.warn('no AssetLoaded component')
    } else {
      removeComponent(entity, AssetLoadedComponent)
    }
  }
}

export const loadAsset = async (entity: Entity, loader = AssetLoader) => {
  const asset = getComponent(entity, AssetComponent)
  //check if asset is already loading or loaded
  if (asset.loaded !== LoadState.UNLOADED) {
    console.warn('Asset', asset, 'is not unloaded')
    return
  }
  if (loader.getAssetType(asset.path) !== AssetType.XRE) {
    throw Error('only .xre.gltf files currently supported')
  }
  try {
    asset.loaded = LoadState.LOADING
    const result = (await loader.loadAsync(asset.path)) as EntityTreeNode[]
    addComponent(entity, AssetLoadedComponent, { roots: result })
  } catch (e) {
    asset.loaded = LoadState.UNLOADED
    throw e
  }
}

export const deserializeAsset: ComponentDeserializeFunction = async (
  entity: Entity,
  json: ComponentJson<AssetComponentType>
) => {
  let obj3d = getComponent(entity, Object3DComponent)?.value
  if (!obj3d) {
    obj3d = new Object3D()
    addComponent(entity, Object3DComponent, { value: obj3d })
  }
  const props = parseAssetProperties(json.props)
  addComponent(entity, AssetComponent, props)
  getComponent(entity, EntityNodeComponent)?.components.push(SCENE_COMPONENT_ASSET)
}

export const serializeAsset: ComponentSerializeFunction = (entity) => {
  const comp = getComponent(entity, AssetComponent) as AssetComponentType
  if (!comp) return
  const metadata = comp.metadata ? { metadata: comp.metadata } : {}
  return {
    name: SCENE_COMPONENT_ASSET,
    props: {
      path: comp.path,
      ...metadata,
      loaded: comp.loaded
    }
  }
}

const parseAssetProperties = (props): AssetComponentType => {
  const metadata = props.metadata ? { metadata: props.metadata } : {}
  return {
    name: props.name ? props.name : SCENE_COMPONENT_ASSET_DEFAULT_VALUES.name,
    path: props.path ? props.path : SCENE_COMPONENT_ASSET_DEFAULT_VALUES.path,
    ...metadata,
    loaded: typeof props.loaded === 'boolean' ? (props.loaded ? LoadState.LOADED : LoadState.UNLOADED) : props.loaded
  }
}
