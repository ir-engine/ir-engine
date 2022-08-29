import { MathUtils } from 'three'

type TransitionType = 'IN' | 'OUT'

export const createTransitionState = (transitionPeriodSeconds: number, initialState: TransitionType = 'OUT') => {
  let currentState = initialState
  let alpha = initialState === 'IN' ? 1 : 0
  let _lastAlpha = -1

  const setState = (state: TransitionType) => {
    currentState = state
  }

  const update = (delta: number, callback: (alpha: number) => void) => {
    if (alpha < 1 && currentState === 'IN') alpha += delta / transitionPeriodSeconds
    if (alpha > 0 && currentState === 'OUT') alpha -= delta / transitionPeriodSeconds

    if (alpha !== _lastAlpha) {
      alpha = MathUtils.clamp(alpha, 0, 1)
      callback(alpha)
      _lastAlpha = alpha
    }
  }

  return {
    get state() {
      return currentState
    },
    get alpha() {
      return alpha
    },
    setState,
    update
  }
}
