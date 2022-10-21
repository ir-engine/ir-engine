import { matches, Validator } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, getState, syncStateWithLocalStorage, useState } from '@xrengine/hyperflux'

export const AppState = defineState({
  name: 'AppState',
  initial: () => ({
    showTopShelf: true,
    showBottomShelf: true,
    showTouchPad: true
  }),
  onCreate: () => {
    syncStateWithLocalStorage(AppState, ['showTopShelf', 'showBottomShelf', 'showTouchPad'])
  }
})

export const AppServiceReceptor = (action) => {
  const s = getState(AppState)
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
    type: 'xre.client.App.SHOW_TOP_SHELF' as const,
    show: matches.boolean
  })
  static showBottomShelf = defineAction({
    type: 'xre.client.App.SHOW_BOTTOM_SHELF' as const,
    show: matches.boolean
  })
  static showTouchPad = defineAction({
    type: 'xre.client.App.SHOW_TOUCH_PAD' as const,
    show: matches.boolean
  })
}
