import { AnimationClip, MathUtils } from 'three'
import { AnimationManager } from '../AnimationManager'
import { AnimationComponent } from '../components/AnimationComponent'
import { Animation } from './Util'

/** Class to handle rendering of an animation and smoothout the transition of the animation from one state to another */
export class AnimationRenderer {
  /** Renders current state animations, unmounts previous state animations and also renders idle weight with default animation
   * @param animationComponent Animation component which holds animation details
   * @param delta Time since last frame
   */
  static render = (animationComponent: AnimationComponent, delta: number) => {
    const currentStateWeights = this.updateCurrentState(animationComponent, delta)
    const prevStateWeights = this.unmountPreviousState(animationComponent, delta)
    this.renderIdleWeight(animationComponent, currentStateWeights, prevStateWeights)
  }

  /**
   * Mounts current state by setting and configuring action for animation
   * @param animationComponent Animation component which holds animation details
   */
  static mountCurrentState = (animationComponent: AnimationComponent) => {
    // Reset update time
    animationComponent.currentState.timeElapsedSinceUpdate = 0

    animationComponent.currentState.animations.forEach((animation) => {
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
   * @param animationComponent Animation component which holds animation details
   * @param delta Time since last frame
   * @returns Total weights of currently mounted state's animations
   */
  static updateCurrentState = (animationComponent: AnimationComponent, delta: number): number => {
    let currentStateWeight = 0
    const currState = animationComponent.currentState

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

      if (!animation.action.isRunning() && animation.weight > 0) {
        animation.action.play()
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
   * @param animationComponent Animation component which holds animation details
   * @param delta Time since last frame
   * @param stopImmediately Whether to stop immediately without smooth transition
   * @returns Total weight of previous state's animations
   */
  static unmountPreviousState = (
    animationComponent: AnimationComponent,
    delta: number,
    stopImmediately?: boolean
  ): number => {
    let prevStateWeight = 0

    if (!animationComponent.prevState) {
      return prevStateWeight
    }

    // Advances the elapsed time
    animationComponent.prevState.timeElapsedSinceUpdate += delta

    animationComponent.prevState.animations.forEach((animation) => {
      // Get the interpolated weight and apply to the action
      animation.weight = stopImmediately
        ? 0
        : this.interpolateWeight(
            animationComponent.prevState.timeElapsedSinceUpdate,
            animationComponent.prevState.transitionDuration,
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

    if (animationComponent.prevState.name !== animationComponent.animationGraph.defaultState.name) {
      // If there is no weight in the prevState animations then remove it.
      if (prevStateWeight <= 0) {
        this.resetPreviousState(animationComponent, true)
      }
    }

    return prevStateWeight
  }

  /**
   * Renders idle weight with default animation to prevent T pose being rendered
   * @param animationComponent Animation component which holds animation details
   * @param currentStateWeight Weight of the current state
   * @param prevStateWeight Weight of the previous state
   */
  static renderIdleWeight = (
    animationComponent: AnimationComponent,
    currentStateWeight: number,
    prevStateWeight: number
  ) => {
    const defaultState = animationComponent.animationGraph.defaultState
    defaultState.animations[0].weight = Math.max(1 - (prevStateWeight + currentStateWeight), 0)

    // If curren state is default state then assign all the weight to it to prevent partial T pose
    if (animationComponent.currentState.name === defaultState.name && defaultState.animations[0].weight < 1) {
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
   * @param animationComponent Animation component which is holding previous state
   * @param emptyPrevState Wheterh to make previous state null after reset
   */
  static resetPreviousState = (animationComponent: AnimationComponent, emptyPrevState?: boolean): void => {
    animationComponent.prevState.timeElapsedSinceUpdate = 0
    animationComponent.prevState.animations.forEach((a) => {
      a.transitionStartWeight = a.weight
      a.transitionEndWeight = 0
    })

    if (emptyPrevState) {
      animationComponent.prevState = null
    }
  }
}
