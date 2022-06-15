import { Mesh, Texture } from 'three'

import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'

import { AssetLoader } from '../../../assets/classes/AssetLoader'
import { GLTF } from '../../../assets/loaders/gltf/GLTFLoader'
import {
  ComponentDeserializeFunction,
  ComponentSerializeFunction,
  ComponentUpdateFunction
} from '../../../common/constants/PrefabFunctionType'
import { isClient } from '../../../common/functions/isClient'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent, hasComponent, removeComponent } from '../../../ecs/functions/ComponentFunctions'
import { EntityNodeComponent } from '../../components/EntityNodeComponent'
import { MaterialOverrideComponentType } from '../../components/MaterialOverrideComponent'
import { ModelComponent, ModelComponentType } from '../../components/ModelComponent'
import { Object3DComponent } from '../../components/Object3DComponent'
import { SimpleMaterialTagComponent } from '../../components/SimpleMaterialTagComponent'
import cloneObject3D from '../cloneObject3D'
import { addError, removeError } from '../ErrorFunctions'
import { overrideTexture, parseGLTFModel } from '../loadGLTFModel'
import { initializeOverride } from './MaterialOverrideFunctions'

export const SCENE_COMPONENT_MODEL = 'gltf-model'
export const SCENE_COMPONENT_MODEL_DEFAULT_VALUE = {
  src: '',
  textureOverride: '',
  materialOverrides: [] as MaterialOverrideComponentType[],
  matrixAutoUpdate: true,
  useBasicMaterial: false,
  isUsingGPUInstancing: false,
  isDynamicObject: false
}

export const deserializeModel: ComponentDeserializeFunction = (
  entity: Entity,
  component: ComponentJson<ModelComponentType>
) => {
  const props = parseModelProperties(component.props)
  const model = addComponent(entity, ModelComponent, props)

  getComponent(entity, EntityNodeComponent)?.components.push(SCENE_COMPONENT_MODEL)
  //add material override components
  if (isClient && model.materialOverrides.length > 0) {
    Promise.all(model.materialOverrides.map((override, i) => initializeOverride(entity, override)())).then(
      (overrides) => (model.materialOverrides = overrides)
    )
  }
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

  if (typeof properties.useBasicMaterial === 'boolean') {
    const hasTag = hasComponent(entity, SimpleMaterialTagComponent)
    if (properties.useBasicMaterial) {
      if (!hasTag) addComponent(entity, SimpleMaterialTagComponent, true)
    } else {
      if (hasTag) removeComponent(entity, SimpleMaterialTagComponent)
    }
  }
}

export const serializeModel: ComponentSerializeFunction = (entity) => {
  const component = getComponent(entity, ModelComponent)
  if (!component) return
  const overrides = component.materialOverrides.map((_override) => {
    const override = { ..._override }
    if (override.args) {
      Object.entries(override.args)
        .filter(([k, v]) => (v as Texture)?.isTexture)
        .forEach(([k, v]) => {
          override.args[k] = (v as Texture).source.data?.src ?? ''
        })
    }
    delete override.entity
    delete override.targetEntity
    delete override.uuid
    return override
  })
  return {
    name: SCENE_COMPONENT_MODEL,
    props: {
      src: component.src,
      textureOverride: component.textureOverride,
      materialOverrides: overrides,
      matrixAutoUpdate: component.matrixAutoUpdate,
      useBasicMaterial: component.useBasicMaterial,
      isUsingGPUInstancing: component.isUsingGPUInstancing,
      isDynamicObject: component.isDynamicObject
    }
  }
}

const parseModelProperties = (props): ModelComponentType => {
  return {
    src: props.src ?? SCENE_COMPONENT_MODEL_DEFAULT_VALUE.src,
    textureOverride: props.textureOverride ?? SCENE_COMPONENT_MODEL_DEFAULT_VALUE.textureOverride,
    materialOverrides: props.materialOverrides ?? SCENE_COMPONENT_MODEL_DEFAULT_VALUE.materialOverrides,
    matrixAutoUpdate: props.matrixAutoUpdate ?? SCENE_COMPONENT_MODEL_DEFAULT_VALUE.matrixAutoUpdate,
    useBasicMaterial: props.useBasicMaterial ?? SCENE_COMPONENT_MODEL_DEFAULT_VALUE.useBasicMaterial,
    isUsingGPUInstancing: props.isUsingGPUInstancing ?? SCENE_COMPONENT_MODEL_DEFAULT_VALUE.isUsingGPUInstancing,
    isDynamicObject: props.isDynamicObject ?? SCENE_COMPONENT_MODEL_DEFAULT_VALUE.isDynamicObject
  }
}
