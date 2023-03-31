import React, { useEffect } from 'react'

import {
  addActionReceptor,
  dispatchAction,
  getMutableState,
  NO_PROXY,
  removeActionReceptor,
  useHookstate
} from '@etherealengine/hyperflux'
import IconButton from '@etherealengine/ui/src/IconButton'

import { FaceRetouchingNatural, Groups, Person } from '@mui/icons-material'
import ClickAwayListener from '@mui/material/ClickAwayListener'

import { useShelfStyles } from '../../../components/Shelves/useShelfStyles'
import styles from './index.module.scss'
import AvatarContextMenu from './menus/AvatarContextMenu'
import AvatarModifyMenu from './menus/AvatarModifyMenu'
import AvatarSelectMenu from './menus/AvatarSelectMenu'
import EmoteMenu from './menus/EmoteMenu'
import FriendsMenu from './menus/FriendsMenu'
import PartyMenu from './menus/PartyMenu'
import ProfileMenu from './menus/ProfileMenu'
import ReadyPlayerMenu from './menus/ReadyPlayerMenu'
import SettingMenu from './menus/SettingMenu'
import ShareMenu from './menus/ShareMenu'
import { PopupMenuActions, PopupMenuServiceReceptor, PopupMenuState } from './PopupMenuService'
import { Views } from './util'

export interface UserMenuProps {
  enableSharing?: boolean
}

export const EmoteIcon = () => (
  <svg width="35px" height="35px" viewBox="0 0 184 184" version="1.1">
    <path
      fill="var(--iconButtonColor)"
      d="M105.314,76.175l-0,24.977c3.463,10.391 8.751,32.633 -1.824,48.494c-1.64,2.552 -5.469,2.917 -7.839,0.729c-1.823,-1.641 -2.005,-4.375 -0.729,-6.381c7.11,-10.938 4.011,-27.711 0,-40.108l-10.938,31.904c-1.277,4.011 -6.381,5.47 -9.663,2.735l-17.137,-14.949c-2.187,-1.824 -2.37,-4.923 -0.547,-7.11c1.823,-2.188 5.105,-2.37 7.11,-0.547l11.85,10.027l5.834,-21.877l0,-26.799c-5.287,-0.183 -11.121,-0.365 -16.59,-0.548c-4.011,-0.182 -7.11,-3.646 -6.745,-7.839l2.37,-27.893c0.729,-2.005 2.917,-3.281 4.922,-3.281c3.282,-0 6.016,3.281 5.105,6.563l-1.823,14.767c-0.365,2.552 1.823,4.922 4.375,4.922l30.081,-0c1.459,-0 2.734,-0.547 3.464,-1.641c4.193,-5.469 6.927,-14.22 8.386,-20.601c1.094,-3.281 3.281,-4.01 5.651,-4.01c2.918,0.364 4.923,3.281 4.376,6.198c-2.005,9.115 -7.293,26.982 -19.689,32.268Z"
    />
    <path
      fill="var(--iconButtonColor)"
      d="M82.89,53.205c-2.917,-4.375 -3.464,-9.298 -1.094,-13.491c2.005,-4.011 6.198,-6.381 10.574,-6.381c6.563,0 12.032,5.47 12.032,12.033c0,4.375 -2.552,9.115 -6.199,11.485c-1.823,1.276 -3.828,1.823 -5.833,1.823c-1.459,0 -2.735,-0.364 -4.193,-0.911c-2.188,-0.912 -4.011,-2.37 -5.287,-4.558Z"
    />
  </svg>
)

export const UserMenu = (): any => {
  const popupMenuState = useHookstate(getMutableState(PopupMenuState))
  const Panel = popupMenuState.openMenu.value ? popupMenuState.menus.get(NO_PROXY)[popupMenuState.openMenu.value] : null
  const hotbarItems = popupMenuState.hotbar

  const setCurrentActiveMenu = (args: { id: string; params?: any }) => {
    dispatchAction(PopupMenuActions.showPopupMenu(args))
  }

  useEffect(() => {
    getMutableState(PopupMenuState).menus.merge({
      [Views.Profile]: (props) => <ProfileMenu {...props} allowAvatarChange />,
      [Views.Settings]: SettingMenu,
      [Views.Share]: ShareMenu,
      [Views.Party]: PartyMenu,
      [Views.AvatarSelect]: AvatarSelectMenu,
      [Views.AvatarModify]: AvatarModifyMenu,
      [Views.ReadyPlayer]: ReadyPlayerMenu,
      [Views.Emote]: EmoteMenu,
      [Views.Friends]: FriendsMenu,
      [Views.AvatarContext]: AvatarContextMenu
    })
    getMutableState(PopupMenuState).hotbar.merge({
      [Views.Profile]: FaceRetouchingNatural,
      [Views.Share]: Groups,
      [Views.Emote]: EmoteIcon
    })

    addActionReceptor(PopupMenuServiceReceptor)
    return () => {
      removeActionReceptor(PopupMenuServiceReceptor)
    }
  }, [])

  const { bottomShelfStyle } = useShelfStyles()

  return (
    <ClickAwayListener onClickAway={() => setCurrentActiveMenu({ id: Views.Closed })} mouseEvent="onMouseDown">
      <>
        <section
          className={`${styles.hotbarContainer} ${bottomShelfStyle} ${
            popupMenuState.openMenu.value ? styles.fadeOutBottom : ''
          }`}
        >
          <div className={styles.buttonsContainer}>
            {Object.keys(hotbarItems.value).map((id, index) => {
              const IconNode = hotbarItems.get(NO_PROXY)[id]
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
              {...popupMenuState.get(NO_PROXY)?.params}
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
