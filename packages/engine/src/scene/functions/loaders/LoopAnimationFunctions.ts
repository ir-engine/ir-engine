import { AnimationClip, AnimationMixer, Vector3 } from 'three'

import { AnimationManager } from '../../../avatar/AnimationManager'
import { BoneStructure } from '../../../avatar/AvatarBoneMatching'
import { AnimationComponent, AnimationComponentType } from '../../../avatar/components/AnimationComponent'
import { AvatarAnimationComponent } from '../../../avatar/components/AvatarAnimationComponent'
import { LoopAnimationComponent, LoopAnimationComponentType } from '../../../avatar/components/LoopAnimationComponent'
import { setupAvatarModel } from '../../../avatar/functions/avatarFunctions'
import { ComponentSerializeFunction, ComponentUpdateFunction } from '../../../common/constants/PrefabFunctionType'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent, hasComponent, removeComponent } from '../../../ecs/functions/ComponentFunctions'
import { CallbackComponent, setCallback, StandardCallbacks } from '../../components/CallbackComponent'
import { ModelComponent } from '../../components/ModelComponent'

export const updateLoopAnimation: ComponentUpdateFunction = (entity: Entity): void => {
  /**
   * Callback functions
   */

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
  setCallback(entity, StandardCallbacks.PLAY, play)
  setCallback(entity, StandardCallbacks.PAUSE, pause)
  setCallback(entity, StandardCallbacks.STOP, stop)

  /**
   * A model is required for LoopAnimationComponent to work.
   * If we do not detect one, throw a warning.
   */
  const scene = getComponent(entity, ModelComponent).scene.value!
  if (!scene) {
    console.warn('Tried to load animation without an Object3D Component attached! Are you sure the model has loaded?')
    return
  }

  if (!hasComponent(entity, AnimationComponent)) {
    addComponent(entity, AnimationComponent, {
      mixer: new AnimationMixer(scene),
      animationSpeed: 1,
      animations: []
    })
  }

  const loopComponent = getComponent(entity, LoopAnimationComponent)
  const animationComponent = getComponent(entity, AnimationComponent)

  const changedToAvatarAnimation =
    loopComponent.hasAvatarAnimations && animationComponent.animations !== AnimationManager.instance._animations
  const changedToObjectAnimation =
    !loopComponent.hasAvatarAnimations && animationComponent.animations !== scene.animations

  if (changedToAvatarAnimation) {
    if (!hasComponent(entity, AvatarAnimationComponent)) {
      addComponent(entity, AvatarAnimationComponent, {
        animationGraph: {
          states: {},
          transitionRules: {},
          currentState: null!,
          stateChanged: null!
        },
        rootYRatio: 1,
        locomotion: new Vector3()
      })
      const setupLoopableAvatarModel = setupAvatarModel(entity)
      setupLoopableAvatarModel(scene)
    }
  }

  if (changedToObjectAnimation) {
    if (hasComponent(entity, AvatarAnimationComponent)) {
      removeComponent(entity, AvatarAnimationComponent)
    }
    animationComponent.mixer = new AnimationMixer(scene)
    animationComponent.animations = scene.animations
  }

  if (!loopComponent.action?.paused) playAnimationClip(animationComponent, loopComponent)
}

export const serializeLoopAnimation: ComponentSerializeFunction = (entity) => {
  const component = getComponent(entity, LoopAnimationComponent)
  return {
    activeClipIndex: component.activeClipIndex,
    hasAvatarAnimations: component.hasAvatarAnimations
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
