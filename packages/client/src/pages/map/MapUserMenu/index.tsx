import Badge from '@material-ui/core/Badge'
import { alertSuccess } from '@xrengine/client-core/src/common/reducers/alert/AlertService'
import { useAppState } from '@xrengine/client-core/src/common/reducers/app/AppState'
import { useAuthState } from '@xrengine/client-core/src/user/reducers/auth/AuthState'
import { AuthService } from '@xrengine/client-core/src/user/reducers/auth/AuthService'
import { EngineEvents } from '@xrengine/engine/src/ecs/classes/EngineEvents'
import { enableInput } from '@xrengine/engine/src/input/systems/ClientInputSystem'
import { EngineRenderer } from '@xrengine/engine/src/renderer/WebGLRendererSystem'
import React, { useEffect, useState } from 'react'
import { connect, useDispatch } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
import { DownArrow } from '../icons/DownArrow'
import AvatarMenu from './menus/AvatarMenu'
import AvatarSelectMenu from './menus/AvatarSelectMenu'
import ProfileMenu from './menus/ProfileMenu'
import ShareMenu from './menus/ShareMenu'
import InstanceChat from '../MapInstanceChat'
import styles from './MapUserMenu.module.scss'
import { UserMenuProps, Views } from './util'
import { AvatarAnimations, AvatarStates, WeightsParameterType } from '@xrengine/engine/src/avatar/animations/Util'
import { Network } from '@xrengine/engine/src/networking/classes/Network'
import { AnimationGraph } from '@xrengine/engine/src/avatar/animations/AnimationGraph'
import { stopAutopilot } from '@xrengine/engine/src/navigation/functions/stopAutopilot'
import { getComponent, hasComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { AvatarAnimationComponent } from '@xrengine/engine/src/avatar/components/AvatarAnimationComponent'
import { AutoPilotComponent } from '@xrengine/engine/src/navigation/component/AutoPilotComponent'

enum PanelState {
  CLOSE,
  MENU_OPEN,
  PANEL_OPEN
}

enum ActivePanel {
  NONE,
  SHARE,
  CHAT
}

const mapStateToProps = (state: any): any => {
  return {}
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  alertSuccess: bindActionCreators(alertSuccess, dispatch)
  // provisionInstanceServer: bindActionCreators(provisionInstanceServer, dispatch),
})

const UserMenu = (props: UserMenuProps): any => {
  const { alertSuccess, uploadAvatarModel, enableSharing, hideLogin, showHideProfile } = props
  const dispatch = useDispatch()
  const menuPanel = {
    [Views.Profile]: ProfileMenu,
    [Views.Share]: ShareMenu,
    [Views.Avatar]: AvatarMenu,
    [Views.AvatarUpload]: AvatarSelectMenu
  }

  const [engineLoaded, setEngineLoaded] = useState(false)
  const [panelState, setPanelState] = useState(PanelState.CLOSE)
  const [activePanel, setActivePanel] = useState(ActivePanel.NONE)
  const [hasUnreadMessages, setUnreadMessages] = useState(false)

  const authState = useAuthState()
  const selfUser = authState.user
  const avatarList = authState.avatarList.value || []

  const [currentActiveMenu, setCurrentActiveMenu] = useState(null)
  const [activeLocation, setActiveLocation] = useState(null)

  const [userSetting, setUserSetting] = useState(selfUser?.user_setting)
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
    if (selfUser) {
      dispatch(AuthService.updateUserAvatarId(selfUser.id.value, avatarId, avatarURL, thumbnailURL))
    }
  }

  const setUserSettings = (newSetting: any): void => {
    const setting = { ...userSetting, ...newSetting }
    setUserSetting(setting)
    dispatch(AuthService.updateUserSettings(selfUser.user_setting.id.value, setting))
  }

  const updateGraphicsSettings = (newSetting: any): void => {
    const setting = { ...graphics, ...newSetting }
    setGraphicsSetting(setting)
  }

  const setActiveMenu = (e): void => {
    const enabled = true
    console.log('setActiveMenu called')
    // const enabled = Boolean(currentActiveMenu && currentActiveMenu.id === identity[0])
    // setCurrentActiveMenu(enabled ? null : menus[identity[1]])
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

  const handleShowProfile = () => {
    showHideProfile(true)
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
          removeAvatar: AuthService.removeAvatar,
          fetchAvatarList: AuthService.fetchAvatarList,
          avatarList: avatarList,
          avatarId: selfUser?.avatarId.value,
          enableSharing: enableSharing
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
          uploadAvatarModel: uploadAvatarModel
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
      default:
        return null
    }

    const Panel = menuPanel[currentActiveMenu.id] as any
    return <Panel {...args} />
  }

  const changeActivePanel = (panel: ActivePanel) => {
    setActivePanel(panel)
    setPanelState(panel === ActivePanel.NONE ? PanelState.CLOSE : PanelState.PANEL_OPEN)
  }

  const togglePanelStatus = () => {
    if (panelState === PanelState.MENU_OPEN || panelState === PanelState.PANEL_OPEN) {
      setPanelState(PanelState.CLOSE)
      setActivePanel(ActivePanel.NONE)
    } else {
      setPanelState(PanelState.MENU_OPEN)
    }
  }

  const runAnimation = (animationName: string, params: WeightsParameterType) => {
    const entity = Network.instance.localClientEntity
    const avatarAnimationComponent = getComponent(entity, AvatarAnimationComponent)

    if (
      !avatarAnimationComponent.animationGraph.validateTransition(
        avatarAnimationComponent.currentState,
        avatarAnimationComponent.animationGraph.states[animationName]
      )
    ) {
      console.warn(
        'immediate transition to [%s] is not available from current state [%s]',
        animationName,
        avatarAnimationComponent.currentState.name
      )
    }

    if (!hasComponent(entity, AutoPilotComponent)) {
      AnimationGraph.forceUpdateAnimationState(entity, animationName, params)
    } else {
      stopAutopilot(entity)
      let interval
      interval = setInterval(() => {
        // wait for valid state (like IDLE)
        if (
          avatarAnimationComponent.animationGraph.validateTransition(
            avatarAnimationComponent.currentState,
            avatarAnimationComponent.animationGraph.states[animationName]
          )
        ) {
          clearInterval(interval)
          AnimationGraph.forceUpdateAnimationState(entity, animationName, params)
        }
      }, 50)
    }

    togglePanelStatus()
  }

  return (
    <>
      <section className={styles.settingContainer}>
        <div className={styles.iconContainer}>
          <span
            id={Views.Profile}
            onClick={handleShowProfile}
            // className={'profile'}
            className={styles.profile}
          >
            <DownArrow />
          </span>
        </div>
        {currentActiveMenu ? renderMenuPanel() : null}
      </section>
      <section className={styles.circleMenu}>
        {panelState === PanelState.MENU_OPEN ? (
          <div className={styles.menu}>
            <div className={styles.menuBackground}>
              <img src="/static/Oval.png" />
            </div>
            <Badge
              color="primary"
              variant="dot"
              invisible={!hasUnreadMessages}
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
              className={styles.chatBadge}
            >
              <button className={styles.iconCallChat} onClick={() => changeActivePanel(ActivePanel.CHAT)} title="Chat">
                <img src="/static/Chat.png" />
              </button>
            </Badge>
            <button className={styles.share} onClick={() => changeActivePanel(ActivePanel.SHARE)} title="Share">
              <img src="/static/Share.png" />
            </button>
            <button
              className={styles.dance1}
              onClick={() => runAnimation(AvatarStates.LOOPABLE_EMOTE, { animationName: AvatarAnimations.DANCING_1 })}
              title="Dance"
            >
              <img src="/static/Dance1.png" />
            </button>
            <button
              className={styles.dance2}
              onClick={() => runAnimation(AvatarStates.LOOPABLE_EMOTE, { animationName: AvatarAnimations.DANCING_2 })}
              title="Dance"
            >
              <img src="/static/Dance2.png" />
            </button>
            <button
              className={styles.dance3}
              onClick={() => runAnimation(AvatarStates.LOOPABLE_EMOTE, { animationName: AvatarAnimations.DANCING_3 })}
              title="Dance"
            >
              <img src="/static/Dance3.png" />
            </button>
            <button
              className={styles.dance4}
              onClick={() => runAnimation(AvatarStates.LOOPABLE_EMOTE, { animationName: AvatarAnimations.DANCING_4 })}
              title="Dance"
            >
              <img src="/static/Dance4.png" />
            </button>
            <button
              className={styles.wave}
              onClick={() => runAnimation(AvatarStates.EMOTE, { animationName: AvatarAnimations.WAVE })}
              title="Wave"
            >
              <img src="/static/Wave.png" />
            </button>
          </div>
        ) : panelState === PanelState.PANEL_OPEN ? (
          <InstanceChat isOpen={activePanel === ActivePanel.CHAT} setUnreadMessages={setUnreadMessages} />
        ) : null}

        <button className={styles.menuBtn} onClick={togglePanelStatus}>
          {panelState === PanelState.CLOSE ? (
            <img src="/static/Plus.png" />
          ) : (
            <img src="/static/Plus.png" className={styles.open} />
          )}
        </button>
      </section>
    </>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(UserMenu)
