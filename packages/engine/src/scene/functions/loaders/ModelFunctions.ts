import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'

import { AssetLoader } from '../../../assets/classes/AssetLoader'
import { GLTF } from '../../../assets/loaders/gltf/GLTFLoader'
import {
  ComponentDeserializeFunction,
  ComponentSerializeFunction,
  ComponentUpdateFunction
} from '../../../common/constants/PrefabFunctionType'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent, hasComponent, removeComponent } from '../../../ecs/functions/ComponentFunctions'
import { EntityNodeComponent } from '../../components/EntityNodeComponent'
import { ModelComponent, ModelComponentType } from '../../components/ModelComponent'
import { Object3DComponent } from '../../components/Object3DComponent'
import cloneObject3D from '../cloneObject3D'
import { addError, removeError } from '../ErrorFunctions'
import { overrideTexture, parseGLTFModel } from '../loadGLTFModel'

export const SCENE_COMPONENT_MODEL = 'gltf-model'
export const SCENE_COMPONENT_MODEL_DEFAULT_VALUE = {
  src: '',
  textureOverride: '',
  matrixAutoUpdate: true,
  isUsingGPUInstancing: false,
  isDynamicObject: false
}

export const deserializeModel: ComponentDeserializeFunction = (
  entity: Entity,
  component: ComponentJson<ModelComponentType>
) => {
  const props = parseModelProperties(component.props)
  addComponent(entity, ModelComponent, props)

  getComponent(entity, EntityNodeComponent)?.components.push(SCENE_COMPONENT_MODEL)
  updateModel(entity, props)
}

export const updateModel: ComponentUpdateFunction = (entity: Entity, properties: ModelComponentType) => {
  const component = getComponent(entity, ModelComponent)
  if (properties.src) {
    try {
      hasComponent(entity, Object3DComponent) && removeComponent(entity, Object3DComponent)
      const gltf = AssetLoader.getFromCache(properties.src) as GLTF
      const scene = cloneObject3D(gltf.scene)
      addComponent(entity, Object3DComponent, { value: scene })
      parseGLTFModel(entity, component, scene)
      removeError(entity, 'srcError')
    } catch (err) {
      addError(entity, 'srcError', err.message)
    }
  }

  if (typeof properties.textureOverride !== 'undefined') {
    overrideTexture(entity)
  }
}

export const serializeModel: ComponentSerializeFunction = (entity) => {
  const component = getComponent(entity, ModelComponent)
  if (!component) return
  return {
    name: SCENE_COMPONENT_MODEL,
    props: {
      src: component.src,
      textureOverride: component.textureOverride,
      matrixAutoUpdate: component.matrixAutoUpdate,
      isUsingGPUInstancing: component.isUsingGPUInstancing,
      isDynamicObject: component.isDynamicObject
    }
  }
}

const parseModelProperties = (props): ModelComponentType => {
  return {
    src: props.src ?? SCENE_COMPONENT_MODEL_DEFAULT_VALUE.src,
    textureOverride: props.textureOverride ?? SCENE_COMPONENT_MODEL_DEFAULT_VALUE.textureOverride,
    matrixAutoUpdate: props.matrixAutoUpdate ?? SCENE_COMPONENT_MODEL_DEFAULT_VALUE.matrixAutoUpdate,
    isUsingGPUInstancing: props.isUsingGPUInstancing ?? SCENE_COMPONENT_MODEL_DEFAULT_VALUE.isUsingGPUInstancing,
    isDynamicObject: props.isDynamicObject ?? SCENE_COMPONENT_MODEL_DEFAULT_VALUE.isDynamicObject
  }
}
