import { AnimationClip, AnimationMixer, Group, Vector3 } from 'three'

import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'

import { AnimationManager } from '../../../avatar/AnimationManager'
import { BoneStructure } from '../../../avatar/AvatarBoneMatching'
import { AnimationComponent, AnimationComponentType } from '../../../avatar/components/AnimationComponent'
import { AvatarAnimationComponent } from '../../../avatar/components/AvatarAnimationComponent'
import { LoopAnimationComponent, LoopAnimationComponentType } from '../../../avatar/components/LoopAnimationComponent'
import { setupAvatarModel } from '../../../avatar/functions/avatarFunctions'
import {
  ComponentDeserializeFunction,
  ComponentSerializeFunction,
  ComponentUpdateFunction
} from '../../../common/constants/PrefabFunctionType'
import { isClient } from '../../../common/functions/isClient'
import { Engine } from '../../../ecs/classes/Engine'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent, hasComponent, removeComponent } from '../../../ecs/functions/ComponentFunctions'
import { VelocityComponent } from '../../../physics/components/VelocityComponent'
import { CallbackComponent } from '../../components/CallbackComponent'
import { EntityNodeComponent } from '../../components/EntityNodeComponent'
import { Object3DComponent } from '../../components/Object3DComponent'

export const SCENE_COMPONENT_LOOP_ANIMATION = 'loop-animation'
export const SCENE_COMPONENT_LOOP_ANIMATION_DEFAULT_VALUE = {
  activeClipIndex: -1,
  hasAvatarAnimations: false
}

export const deserializeLoopAnimation: ComponentDeserializeFunction = (
  entity: Entity,
  component: ComponentJson<LoopAnimationComponentType>
) => {
  if (!isClient) return

  const props = parseLoopAnimationProperties(component.props)
  addComponent(entity, LoopAnimationComponent, props)

  getComponent(entity, EntityNodeComponent)?.components.push(SCENE_COMPONENT_LOOP_ANIMATION)
}

export const updateLoopAnimation: ComponentUpdateFunction = (entity: Entity): void => {
  /**
   * A model is required for LoopAnimationComponent to work.
   * If we do not detect one, throw a warning.
   */
  const object3d = getComponent(entity, Object3DComponent)?.value
  if (!object3d) {
    console.warn('Tried to load animation without an Object3D Component attached! Are you sure the model has loaded?')
    return
  }

  if (!hasComponent(entity, AnimationComponent)) {
    addComponent(entity, AnimationComponent, {
      mixer: new AnimationMixer(object3d),
      animationSpeed: 1,
      animations: []
    })
  }

  const loopComponent = getComponent(entity, LoopAnimationComponent)
  const animationComponent = getComponent(entity, AnimationComponent)

  const changedToAvatarAnimation =
    loopComponent.hasAvatarAnimations && animationComponent.animations !== AnimationManager.instance._animations
  const changedToObjectAnimation =
    !loopComponent.hasAvatarAnimations && animationComponent.animations !== object3d.animations

  if (changedToAvatarAnimation) {
    if (!hasComponent(entity, AvatarAnimationComponent)) {
      addComponent(entity, AvatarAnimationComponent, {
        animationGraph: {
          states: {},
          transitionRules: {},
          currentState: null!,
          stateChanged: null!
        },
        rig: {} as BoneStructure,
        bindRig: {} as BoneStructure,
        rootYRatio: 1,
        locomotion: new Vector3()
      })
      const setupLoopableAvatarModel = setupAvatarModel(entity)
      setupLoopableAvatarModel(object3d)
    }
  }

  if (changedToObjectAnimation) {
    if (hasComponent(entity, AvatarAnimationComponent)) {
      removeComponent(entity, AvatarAnimationComponent)
    }
    animationComponent.mixer = new AnimationMixer(object3d)
    animationComponent.animations = object3d.animations
  }

  /**
   * Callback functions
   */

  if (!hasComponent(entity, CallbackComponent)) {
    const play = () => {
      playAnimationClip(getComponent(entity, AnimationComponent), getComponent(entity, LoopAnimationComponent))
    }
    const pause = () => {
      const loopAnimationComponent = getComponent(entity, LoopAnimationComponent)
      if (loopAnimationComponent.action) loopAnimationComponent.action.paused = true
    }
    const stop = () => {
      const loopAnimationComponent = getComponent(entity, LoopAnimationComponent)
      if (loopAnimationComponent.action) loopAnimationComponent.action.stop()
    }
    addComponent(entity, CallbackComponent, {
      play,
      pause,
      stop
    })
  }

  if (!loopComponent.action?.paused) playAnimationClip(animationComponent, loopComponent)
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

export const parseLoopAnimationProperties = (props): LoopAnimationComponentType => {
  return {
    activeClipIndex: props.activeClipIndex ?? SCENE_COMPONENT_LOOP_ANIMATION_DEFAULT_VALUE.activeClipIndex,
    hasAvatarAnimations: props.hasAvatarAnimations ?? SCENE_COMPONENT_LOOP_ANIMATION_DEFAULT_VALUE.hasAvatarAnimations
  }
}

export const playAnimationClip = (
  animationComponent: AnimationComponentType,
  loopAnimationComponent: LoopAnimationComponentType
) => {
  if (loopAnimationComponent.action) loopAnimationComponent.action.stop()
  if (
    loopAnimationComponent.activeClipIndex >= 0 &&
    animationComponent.animations[loopAnimationComponent.activeClipIndex]
  ) {
    animationComponent.mixer.stopAllAction()
    loopAnimationComponent.action = animationComponent.mixer
      .clipAction(
        AnimationClip.findByName(
          animationComponent.animations,
          animationComponent.animations[loopAnimationComponent.activeClipIndex].name
        )
      )
      .play()
  }
}
