import { Entity } from '../../ecs/classes/Entity'
import { getComponent, getMutableComponent } from '../../ecs/functions/EntityFunctions'
import { Network } from '../../networking/classes/Network'
import { Commands } from '../../networking/enums/Commands'
import { convertObjToBufferSupportedString } from '../../networking/functions/jsonSerialize'
import { VelocityComponent } from '../../physics/components/VelocityComponent'
import { AnimationComponent } from '../components/AnimationComponent'
import { CharacterAnimationStateComponent } from '../components/CharacterAnimationStateComponent'
import { CharacterComponent } from '../components/CharacterComponent'
import { AnimationRenderer } from './AnimationRenderer'
import { AnimationState } from './AnimationState'
import { AnimationType, WeightsParameterType, CharacterStates, MovementType } from './Util'

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
   * @param {Entity} entity
   * @param {string} newStateName New state to which transition will happen
   * @param {WeightsParameterType} params Parameters to calculate weigths
   */
  transitionState = (entity: Entity, newStateName: string, params: WeightsParameterType): void => {
    const animationComponent = getComponent(entity, AnimationComponent)
    const characterAnimationStateComponent = getComponent(entity, CharacterAnimationStateComponent)
    // If transition is paused the return
    if (this.isTransitionPaused) return

    // If new state is the same as old one skip transition
    if (!params.forceTransition && newStateName === characterAnimationStateComponent.currentState.name) {
      return
    }

    // Validate the transition
    const nextState = this.states[newStateName]
    if (!this.validateTransition(characterAnimationStateComponent.currentState, nextState)) {
      return
    }

    // Immediately unmount previous state
    if (characterAnimationStateComponent.prevState) {
      // If it is same as new state then just reset it
      if (characterAnimationStateComponent.prevState.name === newStateName) {
        AnimationRenderer.resetPreviousState(entity, true)
      } else {
        AnimationRenderer.unmountPreviousState(entity, 0, true)
      }
    }

    // Never unmount default state
    if (characterAnimationStateComponent.currentState.name !== this.defaultState.name) {
      // Set current state as previous state
      characterAnimationStateComponent.prevState = characterAnimationStateComponent.currentState
      AnimationRenderer.resetPreviousState(entity)
    }

    // Set new state
    characterAnimationStateComponent.currentState = this.states[newStateName]
    characterAnimationStateComponent.currentState.weightParams = params

    // Mount new state
    AnimationRenderer.mountCurrentState(entity)

    // Add event to auto transit to new state when the animatin of current state finishes
    if (characterAnimationStateComponent.currentState.autoTransitionTo) {
      const transitionEvent = () => {
        this.isTransitionPaused = false
        this.transitionState(entity, characterAnimationStateComponent.currentState.autoTransitionTo, params)
        animationComponent.mixer.removeEventListener('finished', transitionEvent)
      }
      animationComponent.mixer.addEventListener('finished', transitionEvent)
    }

    // Pause transition if current state requires
    if (characterAnimationStateComponent.currentState.pauseTransitionDuration) {
      this.pauseTransitionFor(characterAnimationStateComponent.currentState.pauseTransitionDuration)
    }

    // update the network to sync animation
    this.updateNetwork(entity, newStateName, params)
  }

  /**
   * An animation state check for state transition for the velocity based animations.
   * This method will not run the animation it will just handle the transition and weight change.
   * Animations will be handled by Three js library's animation manager.
   * @param {Entity} entity
   * @param {number} delta Time since last frame
   */
  render = (entity: Entity, delta: number): void => {
    const characterAnimationStateComponent = getComponent(entity, CharacterAnimationStateComponent)
    const actor = getComponent(entity, CharacterComponent)
    let params: WeightsParameterType = {}

    // Calculate movement fo the actor for this frame
    const velocity = getComponent(entity, VelocityComponent)
    const movement: MovementType = {
      velocity: velocity.velocity,
      distanceFromGround: !actor.isGrounded ? velocity.velocity.y : 0
    }

    params.movement = movement

    if (characterAnimationStateComponent.currentState.type === AnimationType.VELOCITY_BASED) {
      characterAnimationStateComponent.currentState.weightParams = params
    }

    if (!actor.isGrounded) {
      if (characterAnimationStateComponent.currentState.name !== CharacterStates.JUMP) {
        characterAnimationStateComponent.animationGraph.transitionState(entity, CharacterStates.JUMP, {
          forceTransition: true,
          ...params
        })
      }
      // else, idle fall
    } else {
      let newStateName = ''
      if (Math.abs(movement.velocity.x) + Math.abs(movement.velocity.z) > this.EPSILON / 2) {
        newStateName = actor.isWalking ? CharacterStates.WALK : CharacterStates.RUN
      } else {
        newStateName = CharacterStates.IDLE
      }

      // If new state is different than current state then transit
      if (characterAnimationStateComponent.currentState.name !== newStateName) {
        characterAnimationStateComponent.animationGraph.transitionState(entity, newStateName, params)
      }
    }

    if (characterAnimationStateComponent.currentState.type === AnimationType.VELOCITY_BASED) {
      // update weights based on velocity of the character
      characterAnimationStateComponent.currentState.updateWeights()
    }

    // Set velocity as prev velocity
    characterAnimationStateComponent.prevVelocity.copy(movement.velocity)
  }

  /**
   * Update animations on network and sync action across all the connected clients
   * @param {Entity} entity
   * @param {string} newStateName New state of the animation. If only the weights are recalculated then new state will be same as current state.
   * @param {WeightsParameterType} params Parameters to be passed onver network
   */
  updateNetwork = (entity: Entity, newStateName: string, params: WeightsParameterType): void => {
    const characterAnimationStateComponent = getComponent(entity, CharacterAnimationStateComponent)
    // Send change animation commnad over network for the local client entity
    if (
      Network.instance.localClientEntity?.id === characterAnimationStateComponent.entity.id &&
      characterAnimationStateComponent.currentState.type === AnimationType.STATIC
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
   * @param {Entity} entity Entity of which animation state will be updated
   * @param {string}newStateName New state of the animation. If only the weights are recalculated then new state will be same as current state.
   * @param {WeightsParameterType} params Parameters to be passed onver network
   */
  static forceUpdateAnimationState = (entity: Entity, newStateName: string, params: WeightsParameterType) => {
    const characterAnimationStateComponent = getMutableComponent(entity, CharacterAnimationStateComponent)

    const animationState = characterAnimationStateComponent.animationGraph.states[newStateName]

    // If new state is same as current state then just update params and sync network
    if (characterAnimationStateComponent.currentState.name === animationState.name) {
      params.resetAnimation = true
      characterAnimationStateComponent.currentState.weightParams = params
      characterAnimationStateComponent.animationGraph.updateNetwork(entity, animationState.name, params)
    } else {
      characterAnimationStateComponent.animationGraph.transitionState(entity, animationState.name, params)
    }

    // Update weights of the state
    characterAnimationStateComponent.currentState.updateWeights()
  }
}
