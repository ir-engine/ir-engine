import { Object3D } from 'three'

import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'
import { AssetLoader } from '@xrengine/engine/src/assets/classes/AssetLoader'
import { AssetType } from '@xrengine/engine/src/assets/enum/AssetType'
import {
  ComponentDeserializeFunction,
  ComponentSerializeFunction,
  ComponentUpdateFunction
} from '@xrengine/engine/src/common/constants/PrefabFunctionType'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { EntityTreeNode } from '@xrengine/engine/src/ecs/classes/EntityTree'
import {
  addComponent,
  getComponent,
  hasComponent,
  removeComponent
} from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { removeEntity } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import {
  addEntityNodeInTree,
  removeEntityNodeFromParent,
  traverseEntityNode
} from '@xrengine/engine/src/ecs/functions/EntityTreeFunctions'
import { useWorld } from '@xrengine/engine/src/ecs/functions/SystemHooks'
import {
  AssetComponent,
  AssetComponentType,
  AssetLoadedComponent
} from '@xrengine/engine/src/scene/components/AssetComponent'
import { EntityNodeComponent } from '@xrengine/engine/src/scene/components/EntityNodeComponent'
import { Object3DComponent } from '@xrengine/engine/src/scene/components/Object3DComponent'

export const SCENE_COMPONENT_ASSET = 'asset'
export const SCENE_COMPONENT_ASSET_DEFAULT_VALUES = {
  path: '',
  loaded: false
}

export const unloadAsset = (entity: Entity) => {
  //hasComponent(entity, AssetLoadedComponent) && removeComponent(entity, AssetLoadedComponent)
  const nodeMap = useWorld().entityTree.entityNodeMap
  const node = nodeMap.get(entity)!
  const ass = getComponent(entity, AssetComponent)

  traverseEntityNode(node, (child) => {
    if (child.entity === entity) return
    removeEntityNodeFromParent(child)
    removeEntity(child.entity, true)
  })

  ass.loaded = false
}

export const loadAsset = async (entity: Entity) => {
  //!hasComponent(entity, AssetLoadedComponent) && addComponent(entity, AssetLoadedComponent, {})
  const ass = getComponent(entity, AssetComponent)
  const nodeMap = useWorld().entityTree.entityNodeMap
  const aNode = nodeMap.get(entity)!
  if (AssetLoader.getAssetType(ass.path) !== AssetType.XRE) {
    throw Error('only .xre.gltf files currently supported')
  }
  const result = await AssetLoader.loadAsync(ass.path)
  console.log('loaded asset to node', result, 'from', ass.path)
  addComponent(entity, AssetLoadedComponent, { root: aNode })
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
