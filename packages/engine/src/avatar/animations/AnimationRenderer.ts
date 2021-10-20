import { AnimationClip, MathUtils } from 'three'
import { Entity } from '../../ecs/classes/Entity'
import { getComponent } from '../../ecs/functions/ComponentFunctions'
import { AnimationManager } from '../AnimationManager'
import { AnimationComponent } from '../components/AnimationComponent'
import { AvatarAnimationComponent } from '../components/AvatarAnimationComponent'
import { Animation } from './Util'

/** Class to handle rendering of an animation and smoothout the transition of the animation from one state to another */
export class AnimationRenderer {
  /** Renders current state animations, unmounts previous state animations and also renders idle weight with default animation
   * @param {Entity} entity
   * @param {number} delta Time since last frame
   */
  static render = (entity: Entity, delta: number) => {
    const currentStateWeights = this.updateCurrentState(entity, delta)
    const prevStateWeights = this.unmountPreviousState(entity, delta)
    this.renderIdleWeight(entity, currentStateWeights, prevStateWeights)
  }

  /**
   * Mounts current state by setting and configuring action for animation
   * @param {Entity} entity
   */
  static mountCurrentState = (entity: Entity) => {
    const avatarAnimationComponent = getComponent(entity, AvatarAnimationComponent)
    const animationComponent = getComponent(entity, AnimationComponent)
    // Reset update time
    avatarAnimationComponent.currentState.timeElapsedSinceUpdate = 0

    avatarAnimationComponent.currentState.animations.forEach((animation) => {
      // Take the clip from the loaded animations
      if (!animation.clip) {
        animation.clip = AnimationClip.findByName(AnimationManager.instance._animations, animation.name)

        if (!animation.clip) return
      }

      // get action from the animation mixer
      animation.action = animationComponent.mixer.clipAction(animation.clip)

      // Apply state specific decorations to the action
      if (animation.decorateAction) animation.decorateAction(animation.action)
    })
  }

  /**
   * Updates animation of current state and apply interpolation if required to make smooth transition for animations
   * @param avatarAnimationComponent Animation component which holds animation details
   * @param delta Time since last frame
   * @returns Total weights of currently mounted state's animations
   */
  static updateCurrentState = (entity: Entity, delta: number): number => {
    const avatarAnimationComponent = getComponent(entity, AvatarAnimationComponent)
    let currentStateWeight = 0
    const currState = avatarAnimationComponent.currentState

    // Advances the elapsed time
    currState.timeElapsedSinceUpdate += delta

    currState.animations.forEach((animation: Animation): void => {
      if (!animation.clip) return

      // IF interpolation is reuqired and animation weight is not final weight then interpolate
      if (currState.weightParams?.interpolate && animation.weight !== animation.transitionEndWeight) {
        animation.weight = this.interpolateWeight(
          currState.timeElapsedSinceUpdate,
          currState.transitionDuration,
          animation.transitionStartWeight,
          animation.transitionEndWeight
        )
      }

      currentStateWeight += animation.weight
      animation.action.setEffectiveWeight(animation.weight)
      animation.action.setEffectiveTimeScale(animation.timeScale || 1)

      // TODO: Somthing around here is having a strange impact on the looping
      // We should figure out how/why this is affecting the walk animations, and why it's different from run anims

      if (animation.weight > 0) {
        animation.action.play()
        if (currState.syncActions) {
          for (let i = 0; i < currState.animations.length; i++) {
            if (currState.animations[i].action) {
              if (currState.animations[i].weight > 0) {
                animation.action.syncWith(currState.animations[i].action)
                break
              }
            }
          }
        }
      }

      // Reset animation in intra state transition
      if (currState.weightParams?.resetAnimation && animation.weight <= 0) {
        animation.action.reset()
      }
    })

    return currentStateWeight
  }

  /**
   * Unmounts previoust state if any
   * @param avatarAnimationComponent Animation component which holds animation details
   * @param delta Time since last frame
   * @param stopImmediately Whether to stop immediately without smooth transition
   * @returns Total weight of previous state's animations
   */
  static unmountPreviousState = (entity: Entity, delta: number, stopImmediately?: boolean): number => {
    const avatarAnimationComponent = getComponent(entity, AvatarAnimationComponent)
    let prevStateWeight = 0

    if (!avatarAnimationComponent.prevState) {
      return prevStateWeight
    }

    // Advances the elapsed time
    avatarAnimationComponent.prevState.timeElapsedSinceUpdate += delta

    avatarAnimationComponent.prevState.animations.forEach((animation) => {
      // Get the interpolated weight and apply to the action
      animation.weight = stopImmediately
        ? 0
        : this.interpolateWeight(
            avatarAnimationComponent.prevState.timeElapsedSinceUpdate,
            avatarAnimationComponent.prevState.transitionDuration,
            animation.transitionStartWeight,
            animation.transitionEndWeight
          )

      animation.action.setEffectiveWeight(animation.weight)
      prevStateWeight += animation.weight

      if (animation.weight <= 0) {
        // Reset the animation of the action

        animation.action.reset()

        // Stop the action
        if (animation.action.isRunning()) {
          animation.action.stop()
        }
      }
    })

    if (avatarAnimationComponent.prevState.name !== avatarAnimationComponent.animationGraph.defaultState.name) {
      // If there is no weight in the prevState animations then remove it.
      if (prevStateWeight <= 0) {
        this.resetPreviousState(entity, true)
      }
    }

    return prevStateWeight
  }

  /**
   * Renders idle weight with default animation to prevent T pose being rendered
   * @param avatarAnimationComponent Animation component which holds animation details
   * @param currentStateWeight Weight of the current state
   * @param prevStateWeight Weight of the previous state
   */
  static renderIdleWeight = (entity: Entity, currentStateWeight: number, prevStateWeight: number) => {
    const avatarAnimationComponent = getComponent(entity, AvatarAnimationComponent)
    const defaultState = avatarAnimationComponent.animationGraph.defaultState
    defaultState.animations[0].weight = Math.max(1 - (prevStateWeight + currentStateWeight), 0)

    // If curren state is default state then assign all the weight to it to prevent partial T pose
    if (avatarAnimationComponent.currentState.name === defaultState.name && defaultState.animations[0].weight < 1) {
      defaultState.animations[0].weight = 1
    }

    if (defaultState.animations[0].action) {
      defaultState.animations[0].action.setEffectiveWeight(defaultState.animations[0].weight)
    }
  }

  /**
   * Interpolates weight between start and end weight for elapsed time
   * @param elapsedTime Time elapsed since transition started
   * @param duration Animaiton transition duration
   * @param startWeight Start weight from which interpolated weigh will be calculated
   * @param endweight end weight towards which interpolated weigh will be calculated
   * @returns Interpolated weight
   */
  static interpolateWeight = (
    elapsedTime: number,
    duration: number,
    startWeight: number,
    endweight: number
  ): number => {
    return MathUtils.clamp(MathUtils.mapLinear(elapsedTime, 0, duration, startWeight, endweight), 0, 1)
  }

  /**
   * Resets the previouse state
   * @param {Entity} entity
   * @param {boolean} emptyPrevState Wheterh to make previous state null after reset
   */
  static resetPreviousState = (entity: Entity, emptyPrevState?: boolean): void => {
    const avatarAnimationComponent = getComponent(entity, AvatarAnimationComponent)
    avatarAnimationComponent.prevState.timeElapsedSinceUpdate = 0
    avatarAnimationComponent.prevState.animations.forEach((a) => {
      a.transitionStartWeight = a.weight
      a.transitionEndWeight = 0
    })

    if (emptyPrevState) {
      avatarAnimationComponent.prevState = null!
    }
  }
}
