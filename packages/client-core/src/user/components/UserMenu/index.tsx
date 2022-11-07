import React, { createContext, useContext, useState } from 'react'

import { AudioEffectPlayer } from '@xrengine/engine/src/audio/systems/MediaSystem'
import { XRState } from '@xrengine/engine/src/xr/XRState'
import { getState, useHookstate } from '@xrengine/hyperflux'

import GroupsIcon from '@mui/icons-material/Groups'
import PersonIcon from '@mui/icons-material/Person'
import ClickAwayListener from '@mui/material/ClickAwayListener'

import { useShelfStyles } from '../../../components/Shelves/useShelfStyles'
import styles from './index.module.scss'
import AvatarContextMenu from './menus/AvatarContextMenu'
import AvatarUploadModal from './menus/AvatarSelectMenu'
import EmoteMenu from './menus/EmoteMenu'
import FriendsMenu from './menus/FriendsMenu'
import PartyMenu from './menus/PartyMenu'
import ProfileMenu from './menus/ProfileMenu'
import ReadyPlayerMenu from './menus/ReadyPlayerMenu'
import SelectAvatarMenu from './menus/SelectAvatar'
import SettingMenu from './menus/SettingMenu'
import ShareMenu from './menus/ShareMenu'
import { Views } from './util'

export interface UserMenuProps {
  enableSharing?: boolean
}

type UserMenuPanelType = (...props: any & { setActiveMenu: (menu: string) => {} }) => JSX.Element

// panels that can be open
/**  @todo  Replace these top level consts with hyperflux state once new hookstate version is brought in */
export const UserMenuPanels = new Map<string, UserMenuPanelType>()

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

const ActiveMenuContext = createContext<[ActiveMenu, (c: ActiveMenu) => void]>([{ view: Views.Closed }, () => {}])

export const useActiveMenu = () => useContext(ActiveMenuContext)

UserMenuPanels.set(Views.Profile, (props) => <ProfileMenu {...props} allowAvatarChange />)
UserMenuPanels.set(Views.Settings, SettingMenu)
UserMenuPanels.set(Views.Share, ShareMenu)
UserMenuPanels.set(Views.Party, PartyMenu)
UserMenuPanels.set(Views.AvatarSelect, SelectAvatarMenu)
UserMenuPanels.set(Views.AvatarUpload, AvatarUploadModal)
UserMenuPanels.set(Views.ReadyPlayer, ReadyPlayerMenu)
UserMenuPanels.set(Views.Emote, EmoteMenu)
UserMenuPanels.set(Views.Friends, FriendsMenu)
UserMenuPanels.set(Views.AvatarContext, AvatarContextMenu)

// menus to be shown as icons at bottom of screen
export const HotbarMenu = new Map<string, any>()
HotbarMenu.set(Views.Profile, PersonIcon)
// HotbarMenu.set(Views.Settings, SettingsIcon)
HotbarMenu.set(Views.Share, GroupsIcon)
// HotbarMenu.set(Views.Party, GroupsIcon)
HotbarMenu.set(Views.Emote, EmoteIcon)

interface Props {
  animate?: any
  fadeOutBottom?: any
}

interface ActiveMenu {
  view: typeof Views[keyof typeof Views]
  params?: any
}

export const UserMenu = (props: Props): any => {
  const [currentActiveMenu, setCurrentActiveMenu] = useState<ActiveMenu>({ view: Views.Closed })

  const { bottomShelfStyle } = useShelfStyles()
  const Panel = UserMenuPanels.get(currentActiveMenu?.view)!
  const xrSessionActive = useHookstate(getState(XRState).sessionActive)

  return (
    <ActiveMenuContext.Provider value={[currentActiveMenu, setCurrentActiveMenu]}>
      <ClickAwayListener onClickAway={() => setCurrentActiveMenu(null!)} mouseEvent="onMouseDown">
        <div>
          <section
            className={`${styles.settingContainer} ${bottomShelfStyle} ${
              currentActiveMenu?.view ? styles.fadeOutBottom : ''
            }`}
          >
            <div className={styles.iconContainer}>
              {Array.from(HotbarMenu.keys()).map((id, index) => {
                const IconNode = HotbarMenu.get(id)
                return (
                  <span
                    key={index}
                    id={id + '_' + index}
                    onClick={() => setCurrentActiveMenu({ view: id })}
                    className={`${styles.materialIconBlock} ${
                      currentActiveMenu && currentActiveMenu.view === id ? styles.activeMenu : null
                    }`}
                  >
                    <IconNode
                      className={styles.icon}
                      onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
                      onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
                    />
                  </span>
                )
              })}
            </div>
          </section>
          {currentActiveMenu && currentActiveMenu.view && (
            <div style={{ pointerEvents: 'auto' }}>
              <Panel
                {...currentActiveMenu.params}
                changeActiveMenu={(view, params) => {
                  setCurrentActiveMenu({ view, params })
                }}
              />
            </div>
          )}
        </div>
      </ClickAwayListener>
    </ActiveMenuContext.Provider>
  )
}
