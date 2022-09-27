import { ClientStorage } from '@xrengine/engine/src/common/classes/ClientStorage'
import { matches, Validator } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, getState, useState } from '@xrengine/hyperflux'

export const AppState = defineState({
  name: 'AppState',
  initial: () => ({
    showTopShelf: true,
    showBottomShelf: true,
    showTouchPad: true
  })
})

export const AppServiceReceptor = (action) => {
  const s = getState(AppState)
  matches(action)
    .when(AppAction.showTopShelf.matches, (action) => {
      ClientStorage.set(AppLayoutConfig.showTopShelf, action.show)
      return s.showTopShelf.set(action.show)
    })
    .when(AppAction.showBottomShelf.matches, (action) => {
      ClientStorage.set(AppLayoutConfig.showBottomShelf, action.show)
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

const appLayoutPrefix = 'app-layout-'
const AppLayoutConfig = {
  showTopShelf: appLayoutPrefix + 'showTopShelf',
  showBottomShelf: appLayoutPrefix + 'showBottomShelf'
}

export async function restoreEditorHelperData(): Promise<void> {
  const s = getState(AppState)
  ClientStorage.get(AppLayoutConfig.showTopShelf).then((v) => {
    if (typeof v !== 'undefined') s.showBottomShelf.set(v)
  })
  ClientStorage.get(AppLayoutConfig.showBottomShelf).then((v) => {
    if (typeof v !== 'undefined') s.showBottomShelf.set(v)
  })
}
