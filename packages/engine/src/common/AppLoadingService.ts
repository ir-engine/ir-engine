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

import { matches, Validator } from '@etherealengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, getMutableState } from '@etherealengine/hyperflux'

export const AppLoadingStates = {
  START_STATE: 'START_STATE' as const,
  SCENE_LOADING: 'SCENE_LOADING' as const,
  SUCCESS: 'SUCCESS' as const,
  FAIL: 'FAIL' as const
}

type AppLoadingStatesType = (typeof AppLoadingStates)[keyof typeof AppLoadingStates]

export const AppLoadingState = defineState({
  name: 'AppLoadingState',
  initial: () => ({
    loaded: false,
    state: AppLoadingStates.START_STATE as AppLoadingStatesType,
    loadPercent: 0
  })
})

export const AppLoadingServiceReceptor = (action) => {
  const s = getMutableState(AppLoadingState)
  matches(action)
    .when(AppLoadingAction.setLoadPercent.matches, (action) => {
      return s.merge({ loadPercent: action.loadPercent })
    })
    .when(AppLoadingAction.setLoadingState.matches, (action) => {
      return s.merge({
        state: action.state,
        loaded: action.state === AppLoadingStates.SUCCESS
      })
    })
}

export class AppLoadingAction {
  static setLoadPercent = defineAction({
    type: 'ee.client.AppLoading.SET_LOADING_PERCENT' as const,
    loadPercent: matches.number
  })

  static setLoadingState = defineAction({
    type: 'ee.client.AppLoading.SET_LOADING_STATE' as const,
    state: matches.string as Validator<unknown, AppLoadingStatesType>
  })
}
