import ClickAwayListener from '@mui/material/ClickAwayListener'
import LinkIcon from '@mui/icons-material/Link'
import PersonIcon from '@mui/icons-material/Person'
import SettingsIcon from '@mui/icons-material/Settings'
import { EngineEvents } from '@xrengine/engine/src/ecs/classes/EngineEvents'
import { enableInput } from '@xrengine/engine/src/input/systems/ClientInputSystem'
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
import { UserMenuProps, Views } from './util'
import EmoteMenu from './menus//EmoteMenu'
import { useEngineState } from '@xrengine/engine/src/ecs/classes/EngineService'
import { UserSetting } from '@xrengine/common/src/interfaces/User'

export const menuPanel = new Map<string, (...props: any & { setActiveMenu: (menu: string) => {} }) => JSX.Element>()

menuPanel.set(Views.Profile, ProfileMenu)
menuPanel.set(Views.Settings, SettingMenu)
menuPanel.set(Views.Share, ShareMenu)
menuPanel.set(Views.Avatar, AvatarMenu)
menuPanel.set(Views.AvatarUpload, AvatarSelectMenu)
menuPanel.set(Views.ReadyPlayer, ReadyPlayerMenu)
menuPanel.set(Views.Emote, EmoteMenu)

const UserMenu = (props: UserMenuProps): any => {
  const { enableSharing, hideLogin } = props

  let menus = [
    { id: Views.Profile, iconNode: PersonIcon },
    { id: Views.Settings, iconNode: SettingsIcon },
    { id: Views.Share, iconNode: LinkIcon },
    { id: Views.Emote, imageNode: '/static/EmoteIcon.svg' }
  ]

  if (enableSharing === false) {
    const share = menus.find((el) => el.id === Views.Share)!
    menus = menus.filter((el) => el.id !== share.id)
  }

  const [engineLoaded, setEngineLoaded] = useState(false)
  const authState = useAuthState()
  const selfUser = authState.user

  const [currentActiveMenu, setCurrentActiveMenu] = useState(enableSharing === false ? (menus[0] as any) : null)

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

  const setActiveMenu = (e): void => {
    const identity = e.currentTarget.id.split('_')
    const enabled = Boolean(currentActiveMenu && currentActiveMenu.id === identity[0])
    setCurrentActiveMenu(enabled ? null : menus[identity[1]])
    if (EngineEvents.instance)
      enableInput({
        keyboard: enabled,
        mouse: enabled
      })
  }

  const changeActiveMenu = (menu) => {
    if (currentActiveMenu !== null) {
      const enabled = Boolean(menu)
      if (EngineEvents.instance)
        enableInput({
          keyboard: !enabled,
          mouse: !enabled
        })
    }
    setCurrentActiveMenu(menu ? { id: menu } : null)
  }

  const renderMenuPanel = () => {
    if (!currentActiveMenu) return null

    let args = {}
    switch (currentActiveMenu.id) {
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
      default:
        return null
    }

    const Panel = menuPanel.get(currentActiveMenu.id)

    // @ts-ignore
    return <Panel changeActiveMenu={changeActiveMenu} {...args} />
  }

  return (
    <>
      {engineLoaded && (
        <ClickAwayListener onClickAway={() => changeActiveMenu(null)} mouseEvent="onMouseDown">
          <section className={styles.settingContainer}>
            <div className={styles.iconContainer}>
              {menus.map((menu, index) => {
                return (
                  <span
                    key={index}
                    id={menu.id + '_' + index}
                    onClick={setActiveMenu}
                    className={`${styles.materialIconBlock} ${
                      currentActiveMenu && currentActiveMenu.id === menu.id ? styles.activeMenu : null
                    }`}
                  >
                    {menu.iconNode ? <menu.iconNode className={styles.icon} /> : <img src={menu.imageNode} />}
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
