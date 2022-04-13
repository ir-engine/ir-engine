import React, { useState } from 'react'

import LinkIcon from '@mui/icons-material/Link'
import PersonIcon from '@mui/icons-material/Person'
import SettingsIcon from '@mui/icons-material/Settings'
import ClickAwayListener from '@mui/material/ClickAwayListener'

import styles from './index.module.scss'
import EmoteMenu from './menus//EmoteMenu'
import AvatarUploadModal from './menus/AvatarSelectMenu'
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
export const UserMenuPanels = new Map<string, UserMenuPanelType>()

UserMenuPanels.set(Views.Profile, ProfileMenu)
UserMenuPanels.set(Views.Settings, SettingMenu)
UserMenuPanels.set(Views.Share, ShareMenu)
UserMenuPanels.set(Views.AvatarSelect, SelectAvatarMenu)
UserMenuPanels.set(Views.AvatarUpload, AvatarUploadModal)
UserMenuPanels.set(Views.ReadyPlayer, ReadyPlayerMenu)
UserMenuPanels.set(Views.Emote, EmoteMenu)

// menus to be shown as icons at bottom of screen
export const HotbarMenu = new Map<string, any>()
HotbarMenu.set(Views.Profile, PersonIcon)
HotbarMenu.set(Views.Settings, SettingsIcon)
HotbarMenu.set(Views.Share, LinkIcon)
HotbarMenu.set(Views.Emote, '/static/EmoteIcon.svg')

interface Props {
  animate?: any
}

const UserMenu = (props: Props): any => {
  const [currentActiveMenu, setCurrentActiveMenu] = useState<typeof Views[keyof typeof Views]>()
  const Panel = UserMenuPanels.get(currentActiveMenu!)!

  return (
    <>
      <ClickAwayListener onClickAway={() => setCurrentActiveMenu(null!)} mouseEvent="onMouseDown">
        <section className={`${styles.settingContainer} ${props.animate}`}>
          <div className={styles.iconContainer}>
            {Array.from(HotbarMenu.keys()).map((id, index) => {
              const IconNode = HotbarMenu.get(id)
              return (
                <span
                  key={index}
                  id={id + '_' + index}
                  onClick={() => setCurrentActiveMenu(id)}
                  className={`${styles.materialIconBlock} ${
                    currentActiveMenu && currentActiveMenu === id ? styles.activeMenu : null
                  }`}
                >
                  {typeof IconNode === 'string' ? <img src={IconNode} /> : <IconNode className={styles.icon} />}
                </span>
              )
            })}
          </div>
          {currentActiveMenu && <Panel changeActiveMenu={setCurrentActiveMenu} />}
        </section>
      </ClickAwayListener>
    </>
  )
}

export default UserMenu
