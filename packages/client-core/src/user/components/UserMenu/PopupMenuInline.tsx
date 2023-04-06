import React, { useEffect } from 'react'

import {
  addActionReceptor,
  getMutableState,
  getState,
  removeActionReceptor,
  useHookstate
} from '@etherealengine/hyperflux'

import ClickAwayListener from '@mui/material/ClickAwayListener'

import { PopupMenuServiceReceptor, PopupMenuServices, PopupMenuState } from './PopupMenuService'

export const PopupMenuInline = () => {
  const openMenu = useHookstate(getMutableState(PopupMenuState).openMenu)
  const popupMenu = getState(PopupMenuState)
  const Panel = openMenu.value ? popupMenu.menus[openMenu.value] : null

  useEffect(() => {
    addActionReceptor(PopupMenuServiceReceptor)
    return () => {
      removeActionReceptor(PopupMenuServiceReceptor)
    }
  }, [])

  return (
    <ClickAwayListener onClickAway={() => PopupMenuServices.showPopupMenu()} mouseEvent="onMouseDown">
      <>
        {Panel && (
          <div style={{ pointerEvents: 'auto' }}>
            <Panel {...popupMenu.params} />
          </div>
        )}
      </>
    </ClickAwayListener>
  )
}
