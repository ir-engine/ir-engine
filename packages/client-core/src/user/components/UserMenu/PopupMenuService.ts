import { matches, Validator } from '@etherealengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, dispatchAction, getMutableState, none } from '@etherealengine/hyperflux'

export const PopupMenuState = defineState({
  name: 'PopupMenuState',
  initial: () => ({
    openMenu: null as string | null,
    params: null as object | null,
    menus: {} as { [id: string]: UserMenuPanelType },
    hotbar: {} as { [id: string]: any }
  })
})

type UserMenuPanelType = (...props: any & { setActiveMenu: (menu: string) => {} }) => JSX.Element

export const PopupMenuServiceReceptor = (action) => {
  const s = getMutableState(PopupMenuState)
  matches(action)
    .when(PopupMenuActions.showPopupMenu.matches, (action) => {
      s.openMenu.set(action.id ?? null)
      s.params.set(action.params ?? null)
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

export const PopupMenuServices = {
  showPopupMenu: (id?: string, params?: any) => {
    dispatchAction(PopupMenuActions.showPopupMenu({ id, params }))
  }
}

export class PopupMenuActions {
  static showPopupMenu = defineAction({
    type: 'ee.client.PopupMenu.showPopupMenu',
    id: matches.string.optional(),
    params: matches.any.optional()
  })

  static registerPopupMenu = defineAction({
    type: 'ee.client.PopupMenu.registerPopupMenu',
    id: matches.string,
    menu: matches.any.optional() as Validator<unknown, UserMenuPanelType>,
    icon: matches.any.optional(),
    unregister: matches.boolean.optional()
  })
}
