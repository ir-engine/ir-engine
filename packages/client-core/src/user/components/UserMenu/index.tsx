import ClickAwayListener from '@material-ui/core/ClickAwayListener'
import LinkIcon from '@material-ui/icons/Link'
import PersonIcon from '@material-ui/icons/Person'
import SettingsIcon from '@material-ui/icons/Settings'
// TODO: Reenable me! Disabled because we don't want the client-networking dep in client-core, need to fix this
import { EngineEvents } from '@xrengine/engine/src/ecs/classes/EngineEvents'
import { enableInput } from '@xrengine/engine/src/input/systems/ClientInputSystem'
import { EngineRenderer } from '@xrengine/engine/src/renderer/WebGLRendererSystem'
import React, { useState, useEffect } from 'react'
import { useDispatch } from '../../../store'
import { AlertService } from '../../../common/state/AlertService'
import { useAuthState } from '../../state/AuthState'
import { AuthService } from '../../state/AuthService'
import AvatarMenu from './menus/AvatarMenu'
import ReadyPlayerMenu from './menus/ReadyPlayerMenu'
import AvatarSelectMenu from './menus/AvatarSelectMenu'
import ProfileMenu from './menus/ProfileMenu'
import SettingMenu from './menus/SettingMenu'
import ShareMenu from './menus/ShareMenu'
import LocationMenu from './menus/LocationMenu'
import CreateLocationMenu from './menus/CreateLocationMenu'
import styles from './UserMenu.module.scss'
import { UserMenuProps, Views } from './util'
import EmoteMenu from './menus//EmoteMenu'

type StateType = {
  currentActiveMenu: any
  profileMenuOpen: boolean
  username: any
  userSetting: any
  graphics: any
  hideLogin: boolean
}

const UserMenu = (props: UserMenuProps): any => {
  const { enableSharing, hideLogin } = props

  const dispatch = useDispatch()

  let menus = [
    { id: Views.Profile, iconNode: PersonIcon },
    { id: Views.Settings, iconNode: SettingsIcon },
    { id: Views.Share, iconNode: LinkIcon },
    { id: Views.Emote, imageNode: '/static/EmoteIcon.svg' }
    //  { id: Views.Location, iconNode: FilterHdrIcon },
  ]

  if (enableSharing === false) {
    const share = menus.find((el) => el.id === Views.Share)
    menus = menus.filter((el) => el.id !== share.id)
  }

  const menuPanel = {
    [Views.Profile]: ProfileMenu,
    [Views.Settings]: SettingMenu,
    [Views.Share]: ShareMenu,
    [Views.Avatar]: AvatarMenu,
    [Views.AvatarUpload]: AvatarSelectMenu,
    [Views.Location]: LocationMenu,
    [Views.NewLocation]: CreateLocationMenu,
    [Views.ReadyPlayer]: ReadyPlayerMenu,
    [Views.Emote]: EmoteMenu
  }

  const [engineLoaded, setEngineLoaded] = useState(false)
  const authState = useAuthState()
  const selfUser = authState.user
  const avatarList = authState.avatarList.value

  const [currentActiveMenu, setCurrentActiveMenu] = useState(enableSharing === false ? (menus[0] as any) : null)
  const [activeLocation, setActiveLocation] = useState(null)

  const [userSetting, setUserSetting] = useState(selfUser?.user_setting.value)
  const [graphics, setGraphicsSetting] = useState({})

  useEffect(() => {
    EngineEvents.instance?.addEventListener(EngineRenderer.EVENTS.QUALITY_CHANGED, updateGraphicsSettings)

    return () => {
      EngineEvents.instance?.removeEventListener(EngineRenderer.EVENTS.QUALITY_CHANGED, updateGraphicsSettings)
    }
  }, [])
  const onEngineLoaded = () => {
    setEngineLoaded(true)
    document.removeEventListener('ENGINE_LOADED', onEngineLoaded)
  }
  document.addEventListener('ENGINE_LOADED', onEngineLoaded)

  const setAvatar = (avatarId: string, avatarURL: string, thumbnailURL: string) => {
    if (selfUser?.value) {
      AuthService.updateUserAvatarId(selfUser.id.value, avatarId, avatarURL, thumbnailURL)
    }
  }

  const setUserSettings = (newSetting: any): void => {
    const setting = { ...userSetting, ...newSetting }
    setUserSetting(setting)
    AuthService.updateUserSettings(selfUser.user_setting.id.value, setting)
  }

  const handleFetchAvatarList = (): any => {
    return AuthService.fetchAvatarList()
  }

  const handleUploadAvatarModel = (model: any, thumbnail: any, avatarName?: string, isPublicAvatar?: boolean): any => {
    return AuthService.uploadAvatarModel(model, thumbnail, avatarName, isPublicAvatar)
  }

  const handleRemoveAvatar = (keys: [string]): any => {
    return AuthService.removeAvatar(keys)
  }

  const updateGraphicsSettings = (newSetting: any): void => {
    const setting = { ...graphics, ...newSetting }
    setGraphicsSetting(setting)
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

  const changeActiveLocation = (location) => {
    setActiveLocation(location)
    setCurrentActiveMenu({ id: Views.NewLocation })
  }

  const updateLocationDetail = (location) => {
    setActiveLocation({ ...location })
  }

  const alertSuccess = (message) => {
    AlertService.alertSuccess(message)
  }

  const renderMenuPanel = () => {
    if (!currentActiveMenu) return null

    let args = {}
    switch (currentActiveMenu.id) {
      case Views.Profile:
        args = {
          changeActiveMenu: changeActiveMenu,
          hideLogin
        }
        break
      case Views.Avatar:
        args = {
          setAvatar: setAvatar,
          changeActiveMenu: changeActiveMenu,
          removeAvatar: handleRemoveAvatar,
          fetchAvatarList: handleFetchAvatarList,
          avatarList: avatarList,
          avatarId: selfUser?.avatarId?.value,
          enableSharing: enableSharing
        }
        break
      case Views.Emote:
        args = {
          location: activeLocation,
          changeActiveMenu,
          updateLocationDetail
        }
        break
      case Views.Settings:
        args = {
          setting: userSetting,
          setUserSettings: setUserSettings,
          graphics: graphics,
          setGraphicsSettings: updateGraphicsSettings
        }
        break
      case Views.Share:
        args = { alertSuccess: alertSuccess }
        break
      case Views.AvatarUpload:
        args = {
          userId: selfUser?.id.value,
          changeActiveMenu: changeActiveMenu,
          uploadAvatarModel: handleUploadAvatarModel
        }
        break
      case Views.Location:
        args = {
          changeActiveLocation
        }
        break
      case Views.NewLocation:
        args = {
          location: activeLocation,
          changeActiveMenu,
          updateLocationDetail
        }
        break
      case Views.ReadyPlayer:
        args = {
          userId: selfUser?.id.value,
          changeActiveMenu: changeActiveMenu,
          uploadAvatarModel: handleUploadAvatarModel,
          isPublicAvatar: false
        }
        break
      default:
        return null
    }

    const Panel = menuPanel[currentActiveMenu.id]

    // @ts-ignore
    return <Panel {...args} />
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
