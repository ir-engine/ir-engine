import { SceneData } from '@etherealengine/common/src/interfaces/SceneInterface'
import { matches, Validator } from '@etherealengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, getState, none } from '@etherealengine/hyperflux'

import { Views } from './util'

export const PopupMenuState = defineState({
  name: 'PopupMenuState',
  initial: () => ({
    openMenu: Views.Closed,
    params: null! as object | null,
    menus: {} as { [id: string]: UserMenuPanelType },
    hotbar: {} as { [id: string]: any }
  })
})

type UserMenuPanelType = (...props: any & { setActiveMenu: (menu: string) => {} }) => JSX.Element

export const PopupMenuServiceReceptor = (action) => {
  const s = getState(PopupMenuState)
  matches(action)
    .when(PopupMenuActions.showPopupMenu.matches, (action) => {
      s.openMenu.set(action.id)
      s.params.set(action.params)
    })
    .when(PopupMenuActions.registerPopupMenu.matches, (action) => {
      if (action.unregister) {
        s.menus.merge({ [action.id]: none })
        s.hotbar.merge({ [action.id]: none })
      } else {
        if (action.menu) s.menus.merge({ [action.id]: action.menu })
        if (action.icon) s.hotbar.merge({ [action.id]: action.icon })
      }
    })
}

export class PopupMenuActions {
  static showPopupMenu = defineAction({
    type: 'xre.client.PopupMenu.showPopupMenu',
    id: matches.string,
    params: matches.any.optional()
  })

  static registerPopupMenu = defineAction({
    type: 'xre.client.PopupMenu.registerPopupMenu',
    id: matches.string,
    menu: matches.any.optional() as Validator<unknown, UserMenuPanelType>,
    icon: matches.any.optional(),
    unregister: matches.boolean.optional()
  })
}
