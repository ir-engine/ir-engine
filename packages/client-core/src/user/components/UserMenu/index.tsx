import React, { useEffect } from 'react'

import {
  addActionReceptor,
  getMutableState,
  getState,
  removeActionReceptor,
  useHookstate
} from '@etherealengine/hyperflux'
import IconButton from '@etherealengine/ui/src/primitives/mui/IconButton'

import ClickAwayListener from '@mui/material/ClickAwayListener'

import { useShelfStyles } from '../../../components/Shelves/useShelfStyles'
import styles from './index.module.scss'
import { PopupMenuServiceReceptor, PopupMenuServices, PopupMenuState } from './PopupMenuService'

export const UserMenu = () => {
  const popupMenuState = useHookstate(getMutableState(PopupMenuState))
  const popupMenu = getState(PopupMenuState)
  const Panel = popupMenu.openMenu ? popupMenu.menus[popupMenu.openMenu] : null
  const hotbarItems = popupMenu.hotbar

  useEffect(() => {
    addActionReceptor(PopupMenuServiceReceptor)
    return () => {
      removeActionReceptor(PopupMenuServiceReceptor)
    }
  }, [])

  const { bottomShelfStyle } = useShelfStyles()

  return (
    <ClickAwayListener onClickAway={() => PopupMenuServices.showPopupMenu()} mouseEvent="onMouseDown">
      <>
        <section
          className={`${styles.hotbarContainer} ${bottomShelfStyle} ${
            popupMenuState.openMenu.value ? styles.fadeOutBottom : ''
          }`}
        >
          <div className={styles.buttonsContainer}>
            {Object.keys(hotbarItems).map((id, index) => {
              const IconNode = hotbarItems[id]
              if (!IconNode) return null
              return (
                <IconButton
                  key={index}
                  type="solid"
                  icon={<IconNode />}
                  sizePx={50}
                  onClick={() => PopupMenuServices.showPopupMenu(id)}
                />
              )
            })}
          </div>
        </section>
        {Panel && (
          <div style={{ pointerEvents: 'auto' }}>
            <Panel {...popupMenu.params} />
          </div>
        )}
      </>
    </ClickAwayListener>
  )
}
