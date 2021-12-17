import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'
import {
  ComponentDeserializeFunction,
  ComponentSerializeFunction,
  ComponentUpdateFunction
} from '../../../common/constants/ComponentNames'
import { Engine } from '../../../ecs/classes/Engine'
import { Entity } from '../../../ecs/classes/Entity'
import { getComponent } from '../../../ecs/functions/ComponentFunctions'
import { EntityNodeComponent } from '../../components/EntityNodeComponent'
import { ModelComponent } from '../../components/ModelComponent'
import { loadGLTFModel } from '../loadGLTFModel'
import { registerSceneLoadPromise } from '../SceneLoading'

export const SCENE_COMPONENT_MODEL = 'gltf-model'

export const deserializeModel: ComponentDeserializeFunction = (entity: Entity, component: ComponentJson) => {
  registerSceneLoadPromise(loadGLTFModel(entity, component))
  if (Engine.isEditor) getComponent(entity, EntityNodeComponent)?.components.push(SCENE_COMPONENT_MODEL)
}

export const updateModel: ComponentUpdateFunction = (entity: Entity) => {
  // const component = getComponent(entity, ModelComponent)
  // loadGLTFModel(entity, { name: SCENE_COMPONENT_MODEL, props: component })
}

export const serializeModel: ComponentSerializeFunction = (entity) => {
  const component = getComponent(entity, ModelComponent)
  if (!component) return
  return {
    name: SCENE_COMPONENT_MODEL,
    props: {
      src: component.src,
      envMapOverride: component.envMapOverride !== '' ? component.envMapOverride : undefined,
      textureOverride: component.textureOverride,
      matrixAutoUpdate: component.matrixAutoUpdate,
      isUsingGPUInstancing: component.isUsingGPUInstancing,
      isDynamicObject: component.isDynamicObject
    }
  }
}
