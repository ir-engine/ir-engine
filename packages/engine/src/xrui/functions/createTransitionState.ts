import { MathUtils } from 'three'
import { World } from '../../ecs/classes/World'

type TransitionType = 'IN' | 'OUT' | 'NONE'

export const createTransitionState = (transitionPeriodSeconds: number) => {
  let currentState = 'NONE' as TransitionType
  let alpha = 0 // alpha is a number between 0 and 1

  const setState = (state: TransitionType) => {
    currentState = state
    alpha = 0
  }

  const update = (world: World, callback: (alpha: number) => void) => {
    if (currentState !== 'NONE') {
      alpha += world.delta / transitionPeriodSeconds
      alpha = MathUtils.clamp(alpha, 0, 1)
      callback(currentState === 'IN' ? alpha : 1 - alpha)
      if (alpha > 1) setState('NONE')
    }
  }

  return {
    setState,
    update
  }
}
