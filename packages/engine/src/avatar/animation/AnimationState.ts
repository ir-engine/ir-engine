/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { AnimationAction } from 'three'

import { enterLocomotionState, getLocomotionStateActions, updateLocomotionState } from './locomotionState'
import { enterSingleAnimationState, getSingleAnimationStateActions } from './singleAnimationState'

export type AnimationState = {
  type: string
  name: string
}

const getMutableStateHandlers = () => {
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

export function fadeOutAnimationStateActions(state?: AnimationState, duration = 0.1) {
  if (!state) return
  const actions = getAnimationStateActions(state)
  actions.forEach((action) => action.fadeOut(duration))
}

export function enterAnimationState(state: AnimationState, prevState?: AnimationState) {
  if (!state) return
  const handler = getMutableStateHandlers()[state.type]
  handler?.enter(state, prevState)
}

export function getAnimationStateActions(state: AnimationState): AnimationAction[] {
  if (!state) return []
  const handler = getMutableStateHandlers()[state.type]
  return handler?.getActions(state)
}

export function updateAnimationState(state: AnimationState, delta: number) {
  if (!state) return
  const handler = getMutableStateHandlers()[state.type]
  handler?.update(state, delta)
}
