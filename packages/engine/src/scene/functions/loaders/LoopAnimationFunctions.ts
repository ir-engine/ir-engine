import { AnimationClip, AnimationMixer, Group, Vector3 } from 'three'

import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'

import { AnimationManager } from '../../../avatar/AnimationManager'
import { BoneStructure } from '../../../avatar/AvatarBoneMatching'
import { AnimationComponent } from '../../../avatar/components/AnimationComponent'
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
import { EntityNodeComponent } from '../../components/EntityNodeComponent'
import { Object3DComponent } from '../../components/Object3DComponent'

export const SCENE_COMPONENT_LOOP_ANIMATION = 'loop-animation'
export const SCENE_COMPONENT_LOOP_ANIMATION_DEFAULT_VALUE = {
  activeClipIndex: -1,
  hasAvatarAnimations: false
}

export const AnimatedObjectCallbacks = [
  { label: 'None', value: 'none' },
  { label: 'Play', value: 'play' },
  { label: 'Pause', value: 'pause' },
  { label: 'Stop', value: 'stop' }
]

export const deserializeLoopAnimation: ComponentDeserializeFunction = (
  entity: Entity,
  component: ComponentJson<LoopAnimationComponentType>
) => {
  if (!isClient) return
  const object3d = getComponent(entity, Object3DComponent)?.value

  const props = parseLoopAnimationProperties(component.props)
  addComponent(entity, LoopAnimationComponent, props)
  addComponent(entity, AnimationComponent, {
    animations: [],
    mixer: new AnimationMixer(object3d),
    animationSpeed: 1
  })

  getComponent(entity, EntityNodeComponent)?.components.push(SCENE_COMPONENT_LOOP_ANIMATION)

  updateLoopAnimation(entity)
}

let lastModel: Group = null!

export const updateLoopAnimation: ComponentUpdateFunction = (entity: Entity): void => {
  const object3d = getComponent(entity, Object3DComponent)?.value
  if (!object3d) {
    console.warn('Tried to load animation without an Object3D Component attached! Are you sure the model has loaded?')
    return
  }

  const component = getComponent(entity, LoopAnimationComponent)
  const animationComponent = getComponent(entity, AnimationComponent)

  if (component.hasAvatarAnimations) {
    if (lastModel !== object3d) {
      lastModel = object3d as Group
      if (!hasComponent(entity, AvatarAnimationComponent)) {
        addComponent(entity, AvatarAnimationComponent, {
          animationGraph: {
            states: {},
            transitionRules: {},
            currentState: null!
          },
          rig: {} as BoneStructure,
          rootYRatio: 1
        })
        addComponent(entity, VelocityComponent, { linear: new Vector3(), angular: new Vector3() })
      }
      const setupLoopableAvatarModel = setupAvatarModel(entity)
      setupLoopableAvatarModel(object3d)
    }
  } else {
    if (hasComponent(entity, AvatarAnimationComponent)) {
      removeComponent(entity, VelocityComponent)
      removeComponent(entity, AvatarAnimationComponent)
    }
    animationComponent.mixer = new AnimationMixer(object3d)
  }

  animationComponent.animations = component.hasAvatarAnimations
    ? AnimationManager.instance._animations
    : object3d.animations

  if (!Engine.instance.isEditor) {
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

  const scene = getComponent(entity, Object3DComponent).value as any

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
