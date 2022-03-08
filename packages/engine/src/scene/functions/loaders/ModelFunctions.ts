import { AnimationClip, Mesh, Object3D } from 'three'

import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'

import { getGLTFLoader } from '../../../assets/classes/AssetLoader'
import { initializeKTX2Loader } from '../../../assets/functions/createGLTFLoader'
import { AnimationComponent } from '../../../avatar/components/AnimationComponent'
import { LoopAnimationComponent } from '../../../avatar/components/LoopAnimationComponent'
import {
  ComponentDeserializeFunction,
  ComponentSerializeFunction,
  ComponentUpdateFunction
} from '../../../common/constants/PrefabFunctionType'
import { Engine } from '../../../ecs/classes/Engine'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent } from '../../../ecs/functions/ComponentFunctions'
import UpdateableObject3D from '../../classes/UpdateableObject3D'
import { EntityNodeComponent } from '../../components/EntityNodeComponent'
import { ModelComponent, ModelComponentType } from '../../components/ModelComponent'
import { Object3DComponent } from '../../components/Object3DComponent'
import { addError, removeError } from '../ErrorFunctions'
import { loadGLTFModel, overrideTexture } from '../loadGLTFModel'
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

export const AnimatedObjectCallbacks = [
  { label: 'None', value: 'none' },
  { label: 'Play', value: 'play' },
  { label: 'Pause', value: 'pause' },
  { label: 'Stop', value: 'stop' }
]

type AnimatedObject3D = UpdateableObject3D & {
  play()
  pause()
  stop()
  callbacks()
}

export const deserializeModel: ComponentDeserializeFunction = (
  entity: Entity,
  component: ComponentJson<ModelComponentType>
) => {
  const props = parseModelProperties(component.props)
  addComponent(entity, Object3DComponent, { value: new Object3D() }) // Temperarily hold a value
  addComponent(entity, ModelComponent, props)

  if (Engine.isEditor) getComponent(entity, EntityNodeComponent)?.components.push(SCENE_COMPONENT_MODEL)

  const loader = getGLTFLoader()
  if (!loader.ktx2Loader) {
    initializeKTX2Loader(getGLTFLoader())
  }

  registerSceneLoadPromise(updateModel(entity, props) as any as Promise<void>)
}

export const updateModel: ComponentUpdateFunction = async (
  entity: Entity,
  properties: ModelComponentType
): Promise<void> => {
  const component = getComponent(entity, ModelComponent)
  const obj3d = getComponent(entity, Object3DComponent).value as AnimatedObject3D

  if (properties.src) {
    try {
      const model = await loadGLTFModel(entity)

      // TODO: move all loopable component stuff to LoopableAnimationFunctions, contingent on #5384

      //add callback
      const scene = model?.scene as any
      scene.play = () => {
        //TODO: LoopAnimationComponent called later than ModelFunctions, so should recall
        const loopAnimationComponent = getComponent(entity, LoopAnimationComponent)
        const animationComponent = getComponent(entity, AnimationComponent)
        if (
          loopAnimationComponent.activeClipIndex >= 0 &&
          animationComponent.animations[loopAnimationComponent.activeClipIndex]
        ) {
          loopAnimationComponent.action = animationComponent.mixer.clipAction(
            AnimationClip.findByName(
              animationComponent.animations,
              animationComponent.animations[loopAnimationComponent.activeClipIndex].name
            )
          )
          loopAnimationComponent.action.paused = false
          loopAnimationComponent.action.play()
        }
      }
      scene.pause = () => {
        //TODO: LoopAnimationComponent called later than ModelFunctions, so should recall
        const loopAnimationComponent = getComponent(entity, LoopAnimationComponent)
        if (loopAnimationComponent.action) loopAnimationComponent.action.paused = true
      }
      scene.stop = () => {
        //TODO: LoopAnimationComponent called later than ModelFunctions, so should recall
        const loopAnimationComponent = getComponent(entity, LoopAnimationComponent)
        if (loopAnimationComponent.action) loopAnimationComponent.action.stop()
      }
      scene.callbacks = () => {
        return AnimatedObjectCallbacks
      }
      removeError(entity, 'srcError')
    } catch (err) {
      addError(entity, 'srcError', err.message)
      Promise.resolve(err)
    }
  }

  if (properties.envMapOverride) {
    try {
      // ToDo: Add right method to load envMap
      removeError(entity, 'envMapError')
    } catch (err) {
      addError(entity, 'envMapError', err.message)
      Promise.resolve(err)
    }
  }

  if (component.parsed && typeof properties.textureOverride !== 'undefined') {
    overrideTexture(entity, obj3d)
  }
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

const parseModelProperties = (props): ModelComponentType => {
  return {
    src: props.src ?? SCENE_COMPONENT_MODEL_DEFAULT_VALUE.src,
    envMapOverride: props.envMapOverride ?? SCENE_COMPONENT_MODEL_DEFAULT_VALUE.envMapOverride,
    textureOverride: props.textureOverride ?? SCENE_COMPONENT_MODEL_DEFAULT_VALUE.textureOverride,
    matrixAutoUpdate: props.matrixAutoUpdate ?? SCENE_COMPONENT_MODEL_DEFAULT_VALUE.matrixAutoUpdate,
    isUsingGPUInstancing: props.isUsingGPUInstancing ?? SCENE_COMPONENT_MODEL_DEFAULT_VALUE.isUsingGPUInstancing,
    isDynamicObject: props.isDynamicObject ?? SCENE_COMPONENT_MODEL_DEFAULT_VALUE.isDynamicObject
  }
}
