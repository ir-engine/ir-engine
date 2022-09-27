import { Object3D, Scene, Texture } from 'three'

import { AssetLoader } from '../../../assets/classes/AssetLoader'
import { DependencyTree } from '../../../assets/classes/DependencyTree'
import { GLTF } from '../../../assets/loaders/gltf/GLTFLoader'
import {
  ComponentDeserializeFunction,
  ComponentSerializeFunction,
  ComponentUpdateFunction
} from '../../../common/constants/PrefabFunctionType'
import { isClient } from '../../../common/functions/isClient'
import { Engine } from '../../../ecs/classes/Engine'
import { Entity } from '../../../ecs/classes/Entity'
import {
  addComponent,
  getComponent,
  hasComponent,
  removeComponent,
  serializeComponent,
  setComponent
} from '../../../ecs/functions/ComponentFunctions'
import { setBoundingBoxComponent } from '../../../interaction/components/BoundingBoxComponents'
import { addObjectToGroup } from '../../components/GroupComponent'
import { MaterialOverrideComponentType } from '../../components/MaterialOverrideComponent'
import { ModelComponent, ModelComponentType } from '../../components/ModelComponent'
import { SceneAssetPendingTagComponent } from '../../components/SceneAssetPendingTagComponent'
import { ObjectLayers } from '../../constants/ObjectLayers'
import { generateMeshBVH } from '../bvhWorkerPool'
import { addError, removeError } from '../ErrorFunctions'
import { parseGLTFModel } from '../loadGLTFModel'
import { enableObjectLayer } from '../setObjectLayers'
import { initializeOverride } from './MaterialOverrideFunctions'

export const deserializeModel: ComponentDeserializeFunction = (entity: Entity, data: ModelComponentType) => {
  setComponent(entity, ModelComponent, data)
  /**
   * Add SceneAssetPendingTagComponent to tell scene loading system we should wait for this asset to load
   */
  setComponent(entity, SceneAssetPendingTagComponent, true)
}

export const serializeModel: ComponentSerializeFunction = (entity) => {
  return serializeComponent(entity, ModelComponent)
}
