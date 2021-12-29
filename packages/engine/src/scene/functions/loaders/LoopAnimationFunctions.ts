import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'
import { AnimationClip, AnimationMixer } from 'three'
import { AnimationManager } from '../../../avatar/AnimationManager'
import { AnimationComponent } from '../../../avatar/components/AnimationComponent'
import { LoopAnimationComponent } from '../../../avatar/components/LoopAnimationComponent'
import {
  ComponentDeserializeFunction,
  ComponentSerializeFunction,
  ComponentUpdateFunction
} from '../../../common/constants/PrefabFunctionType'
import { isClient } from '../../../common/functions/isClient'
import { Engine } from '../../../ecs/classes/Engine'
import { EngineEvents } from '../../../ecs/classes/EngineEvents'
import { accessEngineState } from '../../../ecs/classes/EngineService'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent } from '../../../ecs/functions/ComponentFunctions'
import { receiveActionOnce } from '../../../networking/functions/matchActionOnce'
import { EntityNodeComponent } from '../../components/EntityNodeComponent'
import { Object3DComponent } from '../../components/Object3DComponent'

export const SCENE_COMPONENT_LOOP_ANIMATION = 'loop-animation'
export const SCENE_COMPONENT_LOOP_ANIMATION_DEFAULT_VALUE = {
  activeClipIndex: -1,
  hasAvatarAnimations: false
}

export const deserializeLoopAnimation: ComponentDeserializeFunction = (entity: Entity, component: ComponentJson) => {
  if (!isClient) return

  addComponent(entity, LoopAnimationComponent, { ...component.props })
  addComponent(entity, AnimationComponent, {
    animations: [],
    mixer: null!,
    animationSpeed: 1
  })

  if (Engine.isEditor) getComponent(entity, EntityNodeComponent)?.components.push(SCENE_COMPONENT_LOOP_ANIMATION)

  if (accessEngineState().sceneLoaded) {
    updateLoopAnimation(entity)
  } else {
    receiveActionOnce(EngineEvents.EVENTS.SCENE_LOADED, async () => {
      updateLoopAnimation(entity)
    })
  }
}

export const updateLoopAnimation: ComponentUpdateFunction = (entity: Entity): void => {
  const object3d = getComponent(entity, Object3DComponent)?.value
  if (!object3d) {
    console.warn('Tried to load animation without an Object3D Component attached! Are you sure the model has loaded?')
  }

  const component = getComponent(entity, LoopAnimationComponent)
  const animationComponent = getComponent(entity, AnimationComponent)

  if (!animationComponent.mixer) {
    animationComponent.mixer = new AnimationMixer(object3d)
  }

  animationComponent.animations = component.hasAvatarAnimations
    ? AnimationManager.instance._animations
    : object3d.animations

  if (component.action) component.action.stop()
  if (component.activeClipIndex >= 0) {
    component.action = animationComponent.mixer
      .clipAction(
        AnimationClip.findByName(
          animationComponent.animations,
          animationComponent.animations[component.activeClipIndex].name
        )
      )
      .play()
  }
}

export const serializeLoopAnimation: ComponentSerializeFunction = (entity) => {
  const component = getComponent(entity, LoopAnimationComponent)
  if (!component) return
  return {
    name: SCENE_COMPONENT_LOOP_ANIMATION,
    props: {
      activeClipIndex: component.activeClipIndex,
      hasAvatarAnimations: component.hasAvatarAnimations
    }
  }
}
