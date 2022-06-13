import { AnimationAction } from 'three'

import { enterLocomotionState, getLocomotionStateActions, updateLocomotionState } from './locomotionState'
import { enterSingleAnimationState, getSingleAnimationStateActions } from './singleAnimationState'

export type AnimationState = {
  type: string
  name: string
}

const getStateHandlers = () => {
  return {
    LocomotionState: {
      enter: enterLocomotionState,
      update: updateLocomotionState,
      getActions: getLocomotionStateActions
    },
    SingleAnimationState: {
      enter: enterSingleAnimationState,
      update: () => {},
      getActions: getSingleAnimationStateActions
    }
  }
}

export function fadeOutAnimationStateActions(state?: AnimationState, duration: number = 0.1) {
  if (!state) return
  const actions = getAnimationStateActions(state)
  actions.forEach((action) => action.fadeOut(duration))
}

export function enterAnimationState(state: AnimationState, prevState?: AnimationState) {
  if (!state) return
  const handler = getStateHandlers()[state.type]
  handler?.enter(state, prevState)
}

export function getAnimationStateActions(state: AnimationState): AnimationAction[] {
  if (!state) return []
  const handler = getStateHandlers()[state.type]
  return handler?.getActions(state)
}

export function updateAnimationState(state: AnimationState, delta: number) {
  if (!state) return
  const handler = getStateHandlers()[state.type]
  handler?.update(state, delta)
}
