import ClickAwayListener from '@mui/material/ClickAwayListener'
import LinkIcon from '@mui/icons-material/Link'
import PersonIcon from '@mui/icons-material/Person'
import SettingsIcon from '@mui/icons-material/Settings'
import React, { useState, useEffect } from 'react'
import { useAuthState } from '../../services/AuthService'
import { AuthService } from '../../services/AuthService'
import AvatarMenu from './menus/AvatarMenu'
import ReadyPlayerMenu from './menus/ReadyPlayerMenu'
import AvatarSelectMenu from './menus/AvatarSelectMenu'
import ProfileMenu from './menus/ProfileMenu'
import SettingMenu from './menus/SettingMenu'
import ShareMenu from './menus/ShareMenu'
import styles from './UserMenu.module.scss'
import { Views } from './util'
import EmoteMenu from './menus//EmoteMenu'
import { useEngineState } from '@xrengine/engine/src/ecs/classes/EngineService'
import { UserSetting } from '@xrengine/common/src/interfaces/User'

export interface UserMenuProps {
  enableSharing?: boolean
  hideLogin?: boolean
}

// panels that can be open
export const UserMenuPanels = new Map<
  string,
  (...props: any & { setActiveMenu: (menu: string) => {} }) => JSX.Element
>()

UserMenuPanels.set(Views.Profile, ProfileMenu)
UserMenuPanels.set(Views.Settings, SettingMenu)
UserMenuPanels.set(Views.Share, ShareMenu)
UserMenuPanels.set(Views.Avatar, AvatarMenu)
UserMenuPanels.set(Views.AvatarUpload, AvatarSelectMenu)
UserMenuPanels.set(Views.ReadyPlayer, ReadyPlayerMenu)
UserMenuPanels.set(Views.Emote, EmoteMenu)

// menus to be shown as icons at bottom of screen
export const HotbarMenu = new Map<string, any>()
HotbarMenu.set(Views.Profile, PersonIcon)
HotbarMenu.set(Views.Settings, SettingsIcon)
HotbarMenu.set(Views.Share, LinkIcon)
HotbarMenu.set(Views.Emote, '/static/EmoteIcon.svg')

const UserMenu = (props: UserMenuProps): any => {
  const { enableSharing, hideLogin } = props

  if (enableSharing === false && HotbarMenu.has(Views.Share)) {
    HotbarMenu.delete(Views.Share)
  }

  const [engineLoaded, setEngineLoaded] = useState(false)
  const authState = useAuthState()
  const selfUser = authState.user

  const [currentActiveMenu, setCurrentActiveMenu] = useState<typeof Views[keyof typeof Views]>()

  const [userSetting, setUserSetting] = useState<UserSetting>(selfUser?.user_setting.value!)
  const engineState = useEngineState()

  useEffect(() => {
    setEngineLoaded(true)
  }, [engineState.isEngineInitialized.value])

  const setUserSettings = (newSetting: any): void => {
    const setting = { ...userSetting, ...newSetting }
    setUserSetting(setting)
    AuthService.updateUserSettings(selfUser.user_setting.value?.id, setting)
  }

  const changeActiveMenu = (menu) => {
    console.log(menu)
    setCurrentActiveMenu(menu)
  }

  const renderMenuPanel = () => {
    if (!currentActiveMenu) return null

    let args = {}
    switch (currentActiveMenu) {
      case Views.Profile:
        args = {
          changeActiveMenu,
          hideLogin
        }
        break
      case Views.Avatar:
        args = {
          changeActiveMenu
        }
        break
      case Views.Emote:
        args = {
          changeActiveMenu
        }
        break
      case Views.Settings:
        args = {
          setting: userSetting,
          setUserSettings: setUserSettings
        }
        break
      case Views.Share:
        break
      case Views.AvatarUpload:
        args = {
          userId: selfUser?.id.value
        }
        break
      case Views.ReadyPlayer:
        args = {
          userId: selfUser?.id.value
        }
        break
    }

    const Panel = UserMenuPanels.get(currentActiveMenu)!

    return <Panel changeActiveMenu={changeActiveMenu} {...args} />
  }

  return (
    <>
      {engineLoaded && (
        <ClickAwayListener onClickAway={() => changeActiveMenu(null)} mouseEvent="onMouseDown">
          <section className={styles.settingContainer}>
            <div className={styles.iconContainer}>
              {Array.from(HotbarMenu.keys()).map((id, index) => {
                const IconNode = HotbarMenu.get(id)
                return (
                  <span
                    key={index}
                    id={id + '_' + index}
                    onClick={() => changeActiveMenu(id)}
                    className={`${styles.materialIconBlock} ${
                      currentActiveMenu && currentActiveMenu === id ? styles.activeMenu : null
                    }`}
                  >
                    {typeof IconNode === 'string' ? <img src={IconNode} /> : <IconNode className={styles.icon} />}
                  </span>
                )
              })}
            </div>
            {currentActiveMenu ? renderMenuPanel() : null}
          </section>
        </ClickAwayListener>
      )}
    </>
  )
}

export default UserMenu
