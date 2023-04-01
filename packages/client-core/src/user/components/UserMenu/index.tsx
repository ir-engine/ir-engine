import React, { useEffect } from 'react'

import {
  addActionReceptor,
  dispatchAction,
  getMutableState,
  getState,
  removeActionReceptor,
  useHookstate
} from '@etherealengine/hyperflux'
import IconButton from '@etherealengine/ui/src/IconButton'

import ClickAwayListener from '@mui/material/ClickAwayListener'

import { useShelfStyles } from '../../../components/Shelves/useShelfStyles'
import styles from './index.module.scss'
import { PopupMenuActions, PopupMenuServiceReceptor, PopupMenuState } from './PopupMenuService'

export interface UserMenuProps {
  enableSharing?: boolean
}

export const UserMenu = () => {
  const popupMenuState = useHookstate(getMutableState(PopupMenuState))
  const popupMenu = getState(PopupMenuState)
  const Panel = popupMenu.openMenu ? popupMenu.menus[popupMenu.openMenu] : null
  const hotbarItems = popupMenu.hotbar

  const setCurrentActiveMenu = (args: { id?: string; params?: any }) => {
    if (!args.id) return dispatchAction(PopupMenuActions.showPopupMenu({ id: '' }))
    dispatchAction(PopupMenuActions.showPopupMenu(args))
  }

  useEffect(() => {
    addActionReceptor(PopupMenuServiceReceptor)
    return () => {
      removeActionReceptor(PopupMenuServiceReceptor)
    }
  }, [])

  const { bottomShelfStyle } = useShelfStyles()

  return (
    <ClickAwayListener onClickAway={() => setCurrentActiveMenu({})} mouseEvent="onMouseDown">
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
                  onClick={() => setCurrentActiveMenu({ id })}
                />
              )
            })}
          </div>
        </section>
        {Panel && (
          <div style={{ pointerEvents: 'auto' }}>
            <Panel
              {...popupMenuState.params}
              changeActiveMenu={(id, params) => {
                setCurrentActiveMenu({ id, params })
              }}
            />
          </div>
        )}
      </>
    </ClickAwayListener>
  )
}
