import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'
import { Object3D } from 'three'
import { GLTF } from '../../../assets/loaders/gltf/GLTFLoader'
import {
  ComponentDeserializeFunction,
  ComponentSerializeFunction,
  ComponentUpdateFunction
} from '../../../common/constants/PrefabFunctionType'
import { Engine } from '../../../ecs/classes/Engine'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent } from '../../../ecs/functions/ComponentFunctions'
import { EntityNodeComponent } from '../../components/EntityNodeComponent'
import { ModelComponent, ModelComponentType } from '../../components/ModelComponent'
import { Object3DComponent } from '../../components/Object3DComponent'
import { loadGLTFModel, parseGLTFModel } from '../loadGLTFModel'
import { registerSceneLoadPromise } from '../SceneLoading'

export const SCENE_COMPONENT_MODEL = 'gltf-model'
export const SCENE_COMPONENT_MODEL_DEFAULT_VALUE = {
  src: '',
  envMapOverride: undefined,
  textureOverride: '',
  matrixAutoUpdate: true,
  isUsingGPUInstancing: false,
  isDynamicObject: false
}

export const deserializeModel: ComponentDeserializeFunction = (
  entity: Entity,
  component: ComponentJson<ModelComponentType>
) => {
  addComponent(entity, Object3DComponent, { value: new Object3D() }) // Temperarily hold a value
  addComponent(entity, ModelComponent, { ...component.props })

  if (Engine.isEditor) getComponent(entity, EntityNodeComponent)?.components.push(SCENE_COMPONENT_MODEL)

  registerSceneLoadPromise(updateModel(entity) as any as Promise<void>)
}

export const updateModel: ComponentUpdateFunction = async (entity: Entity): Promise<void> => {
  const component = getComponent(entity, ModelComponent)

  // TODO: refactor this
  let gltf
  if (component.curScr !== component.src) {
    gltf = await loadGLTFModel(entity).catch<Error>((error) => {
      return error
    })
    if (gltf instanceof Error) return
  }

  let obj3d = (gltf as GLTF).scene

  component.curScr = component.src

  if (!obj3d) obj3d = getComponent(entity, Object3DComponent).value

  parseGLTFModel(entity, component, obj3d)
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
