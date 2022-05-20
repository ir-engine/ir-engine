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
  if (state.loop) {
    state.action.reset().setLoop(LoopRepeat, Infinity).fadeIn(0.1).play()
  } else {
    state.action.reset().setLoop(LoopOnce, 1).fadeIn(0.1).play()
    state.action.clampWhenFinished = state.clamp
  }
}
