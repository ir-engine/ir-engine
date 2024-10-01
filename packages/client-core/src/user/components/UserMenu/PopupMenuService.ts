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

import { defineState, getMutableState, none } from '@ir-engine/hyperflux'

export const PopupMenuState = defineState({
  name: 'PopupMenuState',
  initial: () => ({
    openMenu: null as string | null,
    params: null as object | null,
    menus: {} as { [id: string]: UserMenuPanelType },
    hotbar: {} as { [id: string]: { icon: React.ReactNode; tooltip: string; disabled?: boolean } }
  })
})

type UserMenuPanelType = (...props: any & { setActiveMenu: (menu: string) => void }) => JSX.Element

export const PopupMenuServices = {
  showPopupMenu: (id?: string, params?: any) => {
    getMutableState(PopupMenuState).merge({ openMenu: id ?? null, params: params ?? null })
  },

  registerPopupMenu: (
    id: string,
    menu?: UserMenuPanelType,
    tooltip?: string,
    icon?: React.ReactNode,
    unregister?: boolean,
    disabled = false
  ) => {
    const s = getMutableState(PopupMenuState)
    if (unregister) {
      s.menus.merge({ [id]: none })
      s.hotbar.merge({ [id]: none })
    } else {
      if (menu) s.menus.merge({ [id]: menu })
      if (icon) s.hotbar.merge({ [id]: { icon: icon!, tooltip: tooltip!, disabled: disabled } })
    }
  }
}
