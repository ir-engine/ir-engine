import { AnimationAction, LoopOnce, LoopRepeat } from 'three'

import { AnimationState, fadeOutAnimationStateActions } from './AnimationState'

export type SingleAnimationState = AnimationState & {
  type: 'SingleAnimationState'
  action: AnimationAction
  loop: boolean
  clamp: boolean
}

export function getSingleAnimationStateActions(state: SingleAnimationState): AnimationAction[] {
  return [state.action]
}

export function enterSingleAnimationState(state: SingleAnimationState, prevState: AnimationState) {
  fadeOutAnimationStateActions(prevState)
  const { action } = state
  action.reset()
  if (state.loop) {
    action.setLoop(LoopRepeat, Infinity).fadeIn(0.1).play()
  } else {
    action.setLoop(LoopOnce, 1).fadeIn(0.1).play()
    action.clampWhenFinished = state.clamp
  }
}
