import { Object3D } from 'three'

import { store } from '@xrengine/client-core/src/store'
import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'
import { executeCommand } from '@xrengine/editor/src/classes/History'
import EditorCommands from '@xrengine/editor/src/constants/EditorCommands'
import { uploadProjectFile } from '@xrengine/editor/src/functions/assetFunctions'
import { accessEditorState, EditorAction } from '@xrengine/editor/src/services/EditorServices'
import { SelectionAction } from '@xrengine/editor/src/services/SelectionServices'
import { AssetLoader } from '@xrengine/engine/src/assets/classes/AssetLoader'
import { AssetType } from '@xrengine/engine/src/assets/enum/AssetType'
import {
  ComponentDeserializeFunction,
  ComponentSerializeFunction
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
import { createEntity } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import { createEntityNode } from '@xrengine/engine/src/ecs/functions/EntityTreeFunctions'
import { useWorld } from '@xrengine/engine/src/ecs/functions/SystemHooks'
import {
  AssetComponent,
  AssetComponentType,
  AssetLoadedComponent,
  LoadState
} from '@xrengine/engine/src/scene/components/AssetComponent'
import { EntityNodeComponent } from '@xrengine/engine/src/scene/components/EntityNodeComponent'
import { NameComponent } from '@xrengine/engine/src/scene/components/NameComponent'
import { Object3DComponent, Object3DWithEntity } from '@xrengine/engine/src/scene/components/Object3DComponent'

import { sceneToGLTF } from '../GLTFConversion'
import { ScenePrefabs } from '../registerPrefabs'

export const SCENE_COMPONENT_ASSET = 'asset'
export const SCENE_COMPONENT_ASSET_DEFAULT_VALUES = {
  name: '',
  path: '',
  loaded: LoadState.UNLOADED
}

export const unloadAsset = (entity: Entity) => {
  hasComponent(entity, AssetLoadedComponent) && removeComponent(entity, AssetLoadedComponent)
}

export const loadAsset = async (entity: Entity) => {
  const ass = getComponent(entity, AssetComponent)
  //check if asset is already loading or loaded
  if (ass.loaded !== LoadState.UNLOADED) {
    console.warn('Asset', ass, 'is not unloaded')
    return
  }
  if (AssetLoader.getAssetType(ass.path) !== AssetType.XRE) {
    throw Error('only .xre.gltf files currently supported')
  }
  ass.loaded = LoadState.LOADING
  const result = (await AssetLoader.loadAsync(ass.path)) as EntityTreeNode[]
  addComponent(entity, AssetLoadedComponent, { roots: result })
}

export const exportAsset = async (node: EntityTreeNode) => {
  const ass = getComponent(node.entity, AssetComponent)
  const projectName = accessEditorState().projectName.value!
  const assetName = ass.name
  if (!(node.children && node.children.length > 0)) {
    console.warn('Exporting empty asset')
  }

  const obj3ds = node.children!.map((root) => getComponent(root, Object3DComponent).value!)

  const exportable = sceneToGLTF(obj3ds as Object3DWithEntity[])
  const uploadable = new File([JSON.stringify(exportable)], `${assetName}.xre.gltf`)
  return await uploadProjectFile(projectName, [uploadable], true)
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
    name: props.name ? props.name : SCENE_COMPONENT_ASSET_DEFAULT_VALUES.name,
    path: props.path ? props.path : SCENE_COMPONENT_ASSET_DEFAULT_VALUES.path,
    ...metadata,
    loaded: typeof props.loaded === 'boolean' ? (props.loaded ? LoadState.LOADED : LoadState.UNLOADED) : props.loaded
  }
}
