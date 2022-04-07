import { Engine } from 'src/ecs/classes/Engine'
import { EntityNodeComponent } from 'src/scene/components/EntityNodeComponent'
import { Object3D } from 'three'

import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'
import { AssetLoader } from '@xrengine/engine/src/assets/classes/AssetLoader'
import {
  ComponentDeserializeFunction,
  ComponentSerializeFunction,
  ComponentUpdateFunction
} from '@xrengine/engine/src/common/constants/PrefabFunctionType'
import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { addComponent, getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { AssetComponent, AssetComponentType } from '@xrengine/engine/src/scene/components/AssetComponent'
import { Object3DComponent } from '@xrengine/engine/src/scene/components/Object3DComponent'

export const SCENE_COMPONENT_ASSET = 'asset'
export const SCENE_COMPONENT_ASSET_DEFAULT_VALUES = {
  path: ''
}

export const deserializeAsset: ComponentDeserializeFunction = async (
  entity: Entity,
  json: ComponentJson<AssetComponentType>
) => {
  let obj3d = getComponent(entity, Object3DComponent)?.value
  if (!obj3d) {
    obj3d = new Object3D()
    addComponent(entity, Object3DComponent, { value: new Object3D() })
  }
  const props = parseAssetProperties(json.props)
  addComponent(entity, AssetComponent, props)

  if (Engine.isEditor) getComponent(entity, EntityNodeComponent)?.components.push(SCENE_COMPONENT_ASSET)

  updateAsset(entity, props)
}

export const updateAsset: ComponentUpdateFunction = (entity: Entity, props: AssetComponentType) => {
  const comp = getComponent(entity, AssetComponent) as AssetComponentType
  if (!comp) return

  if (props.path) {
    const asset = AssetLoader.getFromCache(props.path)
    console.log('loaded asset', asset)
  }
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
    path: props.path ? props.path : SCENE_COMPONENT_ASSET_DEFAULT_VALUES.path,
    ...metadata,
    loaded: props.loaded
  }
}
