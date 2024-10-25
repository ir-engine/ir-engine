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

import ClickAwayListener from '@mui/material/ClickAwayListener'
import React from 'react'

import { getState, useMutableState } from '@ir-engine/hyperflux'
import IconButtonWithTooltip from '@ir-engine/ui/src/primitives/mui/IconButtonWithTooltip'

import PopupMenu from '@ir-engine/ui/src/primitives/tailwind/PopupMenu'
import { AppState } from '../../../common/services/AppService'
import { useShelfStyles } from '../../../components/Shelves/useShelfStyles'
import { PopupMenuServices, PopupMenuState } from './PopupMenuService'
import styles from './index.module.scss'

export const UserMenu = () => {
  const popupMenuState = useMutableState(PopupMenuState)
  const popupMenu = getState(PopupMenuState)
  const Panel = popupMenu.openMenu ? popupMenu.menus[popupMenu.openMenu] : null
  const hotbarItems = popupMenu.hotbar

  const { bottomShelfStyle } = useShelfStyles()

  return (
    <div>
      <ClickAwayListener onClickAway={() => PopupMenuServices.showPopupMenu()} mouseEvent="onMouseDown">
        <>
          <section
            className={`${styles.hotbarContainer} ${bottomShelfStyle} ${
              popupMenuState.openMenu.value ? styles.fadeOutBottom : ''
            }`}
          >
            <div className={styles.buttonsContainer}>
              {Object.keys(hotbarItems).map((id, index) => {
                const hotbarItem = hotbarItems[id]
                if (!hotbarItem) return null
                return (
                  <IconButtonWithTooltip
                    key={index}
                    type="solid"
                    title={hotbarItem.tooltip}
                    icon={hotbarItem.icon}
                    sizePx={50}
                    disabled={hotbarItem.disabled}
                    onClick={() => {
                      if (getState(AppState).showBottomShelf) PopupMenuServices.showPopupMenu(id)
                    }}
                    sx={{
                      cursor: 'pointer',
                      background: 'var(--iconButtonBackground)'
                    }}
                  />
                )
              })}
            </div>
          </section>
          {Panel && <Panel {...popupMenu.params} />}
          <PopupMenu />
        </>
      </ClickAwayListener>
    </div>
  )
}
