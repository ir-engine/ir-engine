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

import { matches } from '@etherealengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, getMutableState, syncStateWithLocalStorage } from '@etherealengine/hyperflux'

export const AppState = defineState({
  name: 'AppState',
  initial: () => ({
    showTopShelf: true,
    showBottomShelf: true,
    showTouchPad: true
  }),
  onCreate: () => {
    syncStateWithLocalStorage(AppState, ['showTopShelf', 'showBottomShelf'])
  }
})

export const AppServiceReceptor = (action) => {
  const s = getMutableState(AppState)
  matches(action)
    .when(AppAction.showTopShelf.matches, (action) => {
      return s.showTopShelf.set(action.show)
    })
    .when(AppAction.showBottomShelf.matches, (action) => {
      return s.showBottomShelf.set(action.show)
    })
    .when(AppAction.showTouchPad.matches, (action) => {
      return s.showTouchPad.set(action.show)
    })
}

export class AppAction {
  static showTopShelf = defineAction({
    type: 'ee.client.App.SHOW_TOP_SHELF' as const,
    show: matches.boolean
  })
  static showBottomShelf = defineAction({
    type: 'ee.client.App.SHOW_BOTTOM_SHELF' as const,
    show: matches.boolean
  })
  static showTouchPad = defineAction({
    type: 'ee.client.App.SHOW_TOUCH_PAD' as const,
    show: matches.boolean
  })
}
