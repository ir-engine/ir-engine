/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { MathUtils } from 'three'

import { ECSState } from '@ir-engine/ecs/src/ECSState'
import { useExecute } from '@ir-engine/ecs/src/SystemFunctions'
import { AnimationSystemGroup } from '@ir-engine/ecs/src/SystemGroups'
import { getState, NO_PROXY, useHookstate } from '@ir-engine/hyperflux'

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

export const useAnimationTransition = (
  transitionPeriodSeconds: number,
  initialState: TransitionType = 'OUT',
  onTransition: (alpha: number) => void
) => {
  const state = useHookstate(() => createTransitionState(transitionPeriodSeconds, initialState))

  useExecute(
    () => {
      const deltaSeconds = getState(ECSState).deltaSeconds
      state.get(NO_PROXY).update(deltaSeconds, onTransition)
    },
    { with: AnimationSystemGroup }
  )

  return (newState: TransitionType) => {
    state.get(NO_PROXY).setState(newState)
  }
}
