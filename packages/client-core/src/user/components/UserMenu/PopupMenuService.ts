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
