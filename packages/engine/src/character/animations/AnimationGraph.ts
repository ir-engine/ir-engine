import { Entity } from '../../ecs/classes/Entity'
import { getMutableComponent } from '../../ecs/functions/EntityFunctions'
import { Network } from '../../networking/classes/Network'
import { Commands } from '../../networking/enums/Commands'
import { convertObjToBufferSupportedString } from '../../networking/functions/jsonSerialize'
import { AnimationComponent } from '../components/AnimationComponent'
import { CharacterComponent } from '../components/CharacterComponent'
import AnimationRenderer from './AnimationRenderer'
import { AnimationState } from './AnimationState'
import { calculateMovement } from './MovingAnimations'
import { AnimationType, WeightsParameterType, CharacterStates } from './Util'

/** Base Class which hold the animation graph for entity. Animation graph will resides in Animation Component. */
export class AnimationGraph {
  /** All the possible states of this graph */
  states: { [key: string]: AnimationState } = {}

  /** Default state which will be rendered when there is not animation is running.
   * If the sum of weights of all running animations are less then 1 then the weight of this animation will be, 1 - (sum of weights of all running animations) */
  defaultState: AnimationState

  /** Precision value */
  EPSILON = 0.005

  /** Indicates whether the transition from one state to another is paused or not */
  isTransitionPaused: boolean

  /**
   * Pauses the transition for given miliseconds
   * @param miliseconds For which transition is pased
   */
  pauseTransitionFor = (miliseconds: number): void => {
    this.isTransitionPaused = true
    setTimeout(() => {
      this.isTransitionPaused = false
    }, miliseconds)
  }

  /**
   * Validates the transition. If the current state has no next states then transition is valid
   * @param currentState current state of the animiation
   * @param newStateName New state to which transition is going to take place
   * @returns Whether the transition is valid or not
   */
  validateTransition = (currentState: AnimationState, newStateName: AnimationState): boolean => {
    if (currentState.nextStates.length === 0) return true

    for (let i = 0; i < currentState.nextStates.length; i++) {
      if (newStateName.constructor.name === currentState.nextStates[i].name) return true
    }

    return false
  }

  /**
   * Transit the state from one state to another
   * @param animationComponent Animation component which holds animation details
   * @param newStateName New state to which transition will happen
   * @param params Parameters to calculate weigths
   */
  transitionState = (
    animationComponent: AnimationComponent,
    newStateName: string,
    params: WeightsParameterType
  ): void => {
    // If transition is paused the return
    if (this.isTransitionPaused) return

    // If new state is the same as old one skip transition
    if (!params.forceTransition && newStateName === animationComponent.currentState.name) {
      return
    }

    // Validate the transition
    const nextState = this.states[newStateName]
    if (!this.validateTransition(animationComponent.currentState, nextState)) {
      return
    }

    // Immediately unmount previous state
    if (animationComponent.prevState) {
      // If it is same as new state then just reset it
      if (animationComponent.prevState.name === newStateName) {
        AnimationRenderer.resetPreviousState(animationComponent, true)
      } else {
        AnimationRenderer.unmountPreviousState(animationComponent, 0, true)
      }
    }

    // Never unmount default state
    if (animationComponent.currentState.name !== this.defaultState.name) {
      // Set current state as previous state
      animationComponent.prevState = animationComponent.currentState
      AnimationRenderer.resetPreviousState(animationComponent)
    }

    // Set new state
    animationComponent.currentState = this.states[newStateName]
    animationComponent.currentState.weightParams = params

    // Mount new state
    AnimationRenderer.mountCurrentState(animationComponent)

    // Add event to auto transit to new state when the animatin of current state finishes
    if (animationComponent.currentState.autoTransitionTo) {
      const transitionEvent = () => {
        this.isTransitionPaused = false
        this.transitionState(animationComponent, animationComponent.currentState.autoTransitionTo, params)
        animationComponent.mixer.removeEventListener('finished', transitionEvent)
      }
      animationComponent.mixer.addEventListener('finished', transitionEvent)
    }

    // Pause transition if current state requires
    if (animationComponent.currentState.pauseTransitionDuration) {
      this.pauseTransitionFor(animationComponent.currentState.pauseTransitionDuration)
    }

    // update the network to sync animation
    this.updateNetwork(animationComponent, newStateName, params)
  }

  /**
   * An animation state check for state transition for the velocity based animations.
   * This method will not run the animation it will just handle the transition and weight change.
   * Animations will be handled by Three js library's animation manager.
   * @param actor Character compoenent which holds character details
   * @param animationComponent Animation component which holds animation details
   * @param delta Time since last frame
   */
  render = (actor: CharacterComponent, animationComponent: AnimationComponent, delta: number): void => {
    let params: WeightsParameterType = {}

    // Calculate movement fo the actor for this frame
    const movement = calculateMovement(actor, animationComponent, delta, this.EPSILON)

    // Check whether the velocity of the player is changed or not since last frame
    const isChanged =
      !animationComponent.prevVelocity.equals(movement.velocity) ||
      animationComponent.prevDistanceFromGround !== movement.distanceFromGround

    // If velocity is not changed then no updated and transition will happen
    if (!isChanged) return

    params.movement = movement

    animationComponent.currentState.weightParams = params

    if (actor.isJumping) {
      if (animationComponent.currentState.name !== CharacterStates.JUMP) {
        animationComponent.animationGraph.transitionState(animationComponent, CharacterStates.JUMP, params)
      }
    } else {
      let newStateName = ''
      if (Math.abs(movement.velocity.x) + Math.abs(movement.velocity.z) > this.EPSILON / 2) {
        newStateName = actor.isWalking ? CharacterStates.WALK : CharacterStates.RUN
      } else {
        newStateName = CharacterStates.IDLE
      }

      // If new state is different than current state then transit
      if (animationComponent.currentState.name !== newStateName) {
        animationComponent.animationGraph.transitionState(animationComponent, newStateName, params)
      }
    }

    // update weights based on velocity of the character
    animationComponent.currentState.updateWeights()

    // Set velocity as prev velocity
    animationComponent.prevVelocity.copy(movement.velocity)
    animationComponent.prevDistanceFromGround = movement.distanceFromGround
  }

  /**
   * Update animations on network and sync action across all the connected clients
   * @param animationComponent Animation component
   * @param newStateName New state of the animation. If only the weights are recalculated then new state will be same as current state.
   * @param params Parameters to be passed onver network
   */
  updateNetwork = (
    animationComponent: AnimationComponent,
    newStateName: string,
    params: WeightsParameterType
  ): void => {
    // Send change animation commnad over network for the local client entity
    if (
      Network.instance.localClientEntity?.id === animationComponent.entity.id &&
      animationComponent.currentState.type === AnimationType.STATIC
    ) {
      Network.instance.clientInputState.commands.push({
        type: Commands.CHANGE_ANIMATION_STATE,
        args: convertObjToBufferSupportedString({
          state: newStateName,
          params
        })
      })
    }
  }

  /**
   * Update animation state manually
   * @param entity Entity of which animation state will be updated
   * @param newStateName New state of the animation. If only the weights are recalculated then new state will be same as current state.
   * @param params Parameters to be passed onver network
   */
  static forceUpdateAnimationState = (entity: Entity, newStateName: string, params: WeightsParameterType) => {
    const animationComponent = getMutableComponent(entity, AnimationComponent)

    const animationState = animationComponent.animationGraph.states[newStateName]

    // If new state is same as current state then just update params and sync network
    if (animationComponent.currentState.name === animationState.name) {
      params.resetAnimation = true
      animationComponent.currentState.weightParams = params
      animationComponent.animationGraph.updateNetwork(animationComponent, animationState.name, params)
    } else {
      animationComponent.animationGraph.transitionState(animationComponent, animationState.name, params)
    }

    // Update weights of the state
    animationComponent.currentState.updateWeights()
  }
}
