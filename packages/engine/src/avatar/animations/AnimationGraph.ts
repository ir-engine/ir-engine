import { Vector2 } from 'three'
import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import { getComponent } from '../../ecs/functions/ComponentFunctions'
import { dispatchFrom } from '../../networking/functions/dispatchFrom'
import { isEntityLocalClient } from '../../networking/functions/isEntityLocalClient'
import { NetworkWorldAction } from '../../networking/functions/NetworkWorldAction'
import { VelocityComponent } from '../../physics/components/VelocityComponent'
import { AvatarSettings } from '../AvatarControllerSystem'
import { AnimationComponent } from '../components/AnimationComponent'
import { AvatarAnimationComponent } from '../components/AvatarAnimationComponent'
import { AvatarComponent } from '../components/AvatarComponent'
import { AnimationRenderer } from './AnimationRenderer'
import { AnimationState } from './AnimationState'
import { AnimationType, WeightsParameterType, AvatarStates, MovementType } from './Util'

const vector2 = new Vector2()

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
  validateTransition = (currentState: AnimationState, newState: AnimationState): boolean => {
    if (!newState) return false

    if (currentState.nextStates.length === 0) return true

    for (let i = 0; i < currentState.nextStates.length; i++) {
      if (newState.constructor.name === currentState.nextStates[i].name) return true
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
    const avatarAnimationComponent = getComponent(entity, AvatarAnimationComponent)
    // If transition is paused the return
    if (this.isTransitionPaused) return

    // If new state is the same as old one skip transition
    if (!params.forceTransition && newStateName === avatarAnimationComponent.currentState.name) {
      return
    }

    // Validate the transition
    const nextState = this.states[newStateName]
    if (!this.validateTransition(avatarAnimationComponent.currentState, nextState)) {
      return
    }

    // Immediately unmount previous state
    if (avatarAnimationComponent.prevState) {
      // If it is same as new state then just reset it
      if (avatarAnimationComponent.prevState.name === newStateName) {
        AnimationRenderer.resetPreviousState(entity, true)
      } else {
        AnimationRenderer.unmountPreviousState(entity, 0, true)
      }
    }

    // Never unmount default state
    if (avatarAnimationComponent.currentState.name !== this.defaultState.name) {
      // Set current state as previous state
      avatarAnimationComponent.prevState = avatarAnimationComponent.currentState
      AnimationRenderer.resetPreviousState(entity)
    }

    // Set new state
    avatarAnimationComponent.currentState = this.states[newStateName]
    avatarAnimationComponent.currentState.weightParams = params

    // Mount new state
    AnimationRenderer.mountCurrentState(entity)

    // Add event to auto transit to new state when the animatin of current state finishes
    if (avatarAnimationComponent.currentState.autoTransitionTo) {
      const transitionEvent = () => {
        this.isTransitionPaused = false
        // if this callback happens after the avatar disconnects or the avatar is in a transition state, this will break stuff
        if (avatarAnimationComponent.currentState) {
          this.transitionState(entity, avatarAnimationComponent.currentState.autoTransitionTo, params)
        }
        animationComponent.mixer.removeEventListener('finished', transitionEvent)
      }
      animationComponent.mixer.addEventListener('finished', transitionEvent)
    }

    // Pause transition if current state requires
    if (avatarAnimationComponent.currentState.pauseTransitionDuration) {
      this.pauseTransitionFor(avatarAnimationComponent.currentState.pauseTransitionDuration)
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
    const avatarAnimationComponent = getComponent(entity, AvatarAnimationComponent)
    const avatar = getComponent(entity, AvatarComponent)
    let params: WeightsParameterType = {} as any

    // Calculate movement fo the avatar for this frame
    const velocity = getComponent(entity, VelocityComponent)
    const movement: MovementType = {
      velocity: velocity.velocity,
      distanceFromGround: !avatar.isGrounded ? velocity.velocity.y : 0
    }

    params.movement = movement

    if (avatarAnimationComponent.currentState.type === AnimationType.VELOCITY_BASED) {
      avatarAnimationComponent.currentState.weightParams = params
    }

    if (!avatar.isGrounded) {
      if (avatarAnimationComponent.currentState.name !== AvatarStates.JUMP) {
        avatarAnimationComponent.animationGraph.transitionState(entity, AvatarStates.JUMP, {
          ...params,
          forceTransition: true
        })
      }
      // else, idle fall
    } else {
      let newStateName = ''
      vector2.set(movement.velocity.x, movement.velocity.z).multiplyScalar(1 / delta)
      const speedSqr = vector2.lengthSq()
      if (speedSqr > this.EPSILON) {
        newStateName =
          speedSqr < AvatarSettings.instance.walkSpeed * AvatarSettings.instance.walkSpeed
            ? AvatarStates.WALK
            : AvatarStates.RUN
      } else {
        newStateName = AvatarStates.IDLE
      }

      // If new state is different than current state then transit
      if (avatarAnimationComponent.currentState.name !== newStateName) {
        avatarAnimationComponent.animationGraph.transitionState(entity, newStateName, params)
      }
    }

    if (avatarAnimationComponent.currentState.type === AnimationType.VELOCITY_BASED) {
      // update weights based on velocity of the character
      avatarAnimationComponent.currentState.updateWeights?.()
    }

    // Set velocity as prev velocity
    avatarAnimationComponent.prevVelocity.copy(movement.velocity)
  }

  /**
   * Update animations on network and sync action across all the connected clients
   * @param {Entity} entity
   * @param {string} newStateName New state of the animation. If only the weights are recalculated then new state will be same as current state.
   * @param {WeightsParameterType} params Parameters to be passed onver network
   */
  updateNetwork = (entity: Entity, newStateName: string, params: WeightsParameterType): void => {
    const avatarAnimationComponent = getComponent(entity, AvatarAnimationComponent)
    // Send change animation commnad over network for the local client entity
    if (isEntityLocalClient(entity) && avatarAnimationComponent.currentState.type === AnimationType.STATIC) {
      dispatchFrom(Engine.userId, () => NetworkWorldAction.avatarAnimation({ newStateName, params }))
    }
  }

  /**
   * Update animation state manually
   * @param {Entity} entity Entity of which animation state will be updated
   * @param {string}newStateName New state of the animation. If only the weights are recalculated then new state will be same as current state.
   * @param {WeightsParameterType} params Parameters to be passed onver network
   */
  static forceUpdateAnimationState = (entity: Entity, newStateName: string, params: WeightsParameterType) => {
    const avatarAnimationComponent = getComponent(entity, AvatarAnimationComponent)

    const animationState = avatarAnimationComponent.animationGraph.states[newStateName]

    // If new state is same as current state then just update params and sync network
    if (avatarAnimationComponent.currentState.name === animationState.name) {
      params.resetAnimation = true
      avatarAnimationComponent.currentState.weightParams = params
      avatarAnimationComponent.animationGraph.updateNetwork(entity, animationState.name, params)
    } else {
      avatarAnimationComponent.animationGraph.transitionState(entity, animationState.name, params)
    }

    // Update weights of the state
    avatarAnimationComponent.currentState.updateWeights?.()
  }
}
