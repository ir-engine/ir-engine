import { createState } from '@speigg/hookstate'
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { UserSetting } from '@xrengine/common/src/interfaces/User'
import { AvatarSettings, updateMap } from '@xrengine/engine/src/avatar/AvatarControllerSystem'
import { AvatarComponent } from '@xrengine/engine/src/avatar/components/AvatarComponent'
import {
  AvatarInputSettingsAction,
  useAvatarInputSettingsState
} from '@xrengine/engine/src/avatar/state/AvatarInputSettingsState'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { useEngineState } from '@xrengine/engine/src/ecs/classes/EngineState'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { AvatarControllerType, AvatarMovementScheme } from '@xrengine/engine/src/input/enums/InputEnums'
import { EngineRendererAction, useEngineRendererState } from '@xrengine/engine/src/renderer/EngineRendererState'
import { createXRUI } from '@xrengine/engine/src/xrui/functions/createXRUI'
import { dispatchAction } from '@xrengine/hyperflux'

import { BlurLinear, Mic, VolumeUp } from '@mui/icons-material'

import { AuthService, useAuthState } from '../../../user/services/AuthService'
import XRToggleButton from '../../components/XRToggleButton'
import styleString from './index.scss'

export function createSettingDetailView() {
  return createXRUI(SettingDetailView, createSettingDetailState())
}

function createSettingDetailState() {
  return createState({
    settingMenuOpen: false
  })
}

// TODO: update this to newest settings implementation
const SettingDetailView = () => {
  const { t } = useTranslation()
  const rendererState = useEngineRendererState()

  const engineState = useEngineState()
  const avatarInputState = useAvatarInputSettingsState()
  const [controlTypeSelected, setControlType] = useState(avatarInputState.controlType.value)
  const [controlSchemeSelected, setControlScheme] = useState(
    AvatarMovementScheme[AvatarSettings.instance.movementScheme]
  )
  const invertRotationAndMoveSticks = avatarInputState.invertRotationAndMoveSticks.value
  const showAvatar = avatarInputState.showAvatar.value
  const authState = useAuthState()
  const selfUser = authState.user
  const firstRender = useRef(true)
  const [showDetails, setShowDetails] = useState(false)
  const [userSettings, setUserSetting] = useState<UserSetting>(selfUser?.user_setting.value!)

  const controllerTypes = Object.values(AvatarControllerType).filter((value) => typeof value === 'string')
  const controlSchemes = Object.values(AvatarMovementScheme).filter((value) => typeof value === 'string')

  useEffect(() => {
    const world = Engine.instance.currentWorld
    const entity = world.localClientEntity
    const avatar = getComponent(entity, AvatarComponent)
    if (!avatar) return
    if (showAvatar) {
      if (avatar.modelContainer.visible) return
      avatar.modelContainer.visible = showAvatar
    } else {
      if (!avatar.modelContainer.visible) return
      avatar.modelContainer.visible = showAvatar
    }
  }, [showAvatar])

  useLayoutEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    updateMap()
  }, [avatarInputState.invertRotationAndMoveSticks])

  const setUserSettings = (newSetting: any): void => {
    const setting = { ...userSettings, ...newSetting }
    setUserSetting(setting)
    AuthService.updateUserSettings(selfUser.user_setting.value?.id, setting)
  }

  const handleChangeInvertRotationAndMoveSticks = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatchAction(
      AvatarInputSettingsAction.setInvertRotationAndMoveSticks({
        invertRotationAndMoveSticks: !invertRotationAndMoveSticks
      })
    )
  }

  const handleChangeShowAvatar = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatchAction(AvatarInputSettingsAction.setShowAvatar({ showAvatar: !showAvatar }))
  }

  const handleChangeControlType = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setControlType(event.target.value as any)
    dispatchAction(AvatarInputSettingsAction.setControlType(event.target.value as any))
  }

  const handleChangeControlScheme = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setControlScheme(event.target.value)
    AvatarSettings.instance.movementScheme = AvatarMovementScheme[event.target.value]
  }

  const toggleShowDetails = () => {
    setShowDetails(!showDetails)
  }

  return (
    <>
      <style>{styleString}</style>
      <div className="container" xr-layer="true">
        <div className="settingView">
          <section className="audioSection">
            <h4 className="title">{t('user:usermenu.setting.audio')}</h4>
            <div className="sectionRow">
              <VolumeUp />
              <span className="label">{t('user:usermenu.setting.lbl-volume')}</span>
              <input
                className="slider"
                type="range"
                min="1"
                max="100"
                value={userSettings?.volume == null ? 100 : userSettings?.volume}
                onChange={(event: any) => {
                  setUserSettings({ volume: parseInt(event.target.value) })
                  const mediaElements = document.querySelectorAll<HTMLMediaElement>('video, audio')
                  for (let i = 0; i < mediaElements.length; i++) {
                    mediaElements[i].volume = parseInt(event.target.value) / 100
                  }
                }}
              ></input>
            </div>

            <div className="sectionRow">
              <Mic />
              <span className="label">{t('user:usermenu.setting.lbl-microphone')}</span>
              <input
                className="slider"
                type="range"
                min="1"
                max="100"
                value={userSettings?.microphone == null ? 100 : userSettings?.microphone}
                onChange={(event: any) => {
                  setUserSettings({ microphone: parseInt(event.target.value) })
                }}
              ></input>
            </div>
          </section>
          <section className="graphicsSection">
            <h4 className="title">{t('user:usermenu.setting.graphics')}</h4>
            <div className="sectionRow">
              <BlurLinear />
              <span className="label">{t('user:usermenu.setting.lbl-resolution')}</span>
              <input
                className="slider"
                type="range"
                min="1"
                max="5"
                step="1"
                value={rendererState.qualityLevel.value}
                onChange={(event: any) => {
                  dispatchAction(EngineRendererAction.setQualityLevel({ qualityLevel: parseInt(event.target.value) }))
                  dispatchAction(EngineRendererAction.setAutomatic({ automatic: false }))
                }}
              ></input>
            </div>

            <div className="graphicsCheckBoxRow">
              <label className="checkBoxRow">
                <span
                  className="checkBoxSpan"
                  onClick={() => {
                    dispatchAction(
                      EngineRendererAction.setPostProcessing({
                        usePostProcessing: !rendererState.usePostProcessing.value
                      })
                    )
                    dispatchAction(EngineRendererAction.setAutomatic({ automatic: false }))
                  }}
                >
                  <input
                    className="checkBoxInput"
                    checked={rendererState.usePostProcessing.value}
                    type="checkbox"
                    data-indeterminate="false"
                    onChange={(value: any) => {
                      dispatchAction(
                        EngineRendererAction.setPostProcessing({ usePostProcessing: value.target.checked })
                      )
                      dispatchAction(EngineRendererAction.setAutomatic({ automatic: false }))
                    }}
                  />
                  <svg className="checkBoxSvg" focusable="false" aria-hidden="true" viewBox="0 0 24 24">
                    {rendererState.usePostProcessing.value ? (
                      <path d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2V5c0-1.1-.89-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"></path>
                    ) : (
                      <path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"></path>
                    )}
                  </svg>
                </span>
                <span className="checkBoxLabel">{t('user:usermenu.setting.lbl-pp')}</span>
              </label>
              <label className="checkBoxRow">
                <span
                  className="checkBoxSpan"
                  onClick={() => {
                    dispatchAction(EngineRendererAction.setShadows({ useShadows: !rendererState.useShadows.value }))
                    dispatchAction(EngineRendererAction.setAutomatic({ automatic: false }))
                  }}
                >
                  <input
                    className="checkBoxInput"
                    type="checkbox"
                    data-indeterminate="false"
                    checked={rendererState.useShadows.value}
                    onChange={(value: any) => {
                      dispatchAction(EngineRendererAction.setShadows({ useShadows: value.target.checked }))
                      dispatchAction(EngineRendererAction.setAutomatic({ automatic: false }))
                    }}
                  />
                  <svg className="checkBoxSvg" focusable="false" aria-hidden="true" viewBox="0 0 24 24">
                    {rendererState.useShadows.value ? (
                      <path d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2V5c0-1.1-.89-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"></path>
                    ) : (
                      <path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"></path>
                    )}
                  </svg>
                </span>
                <span className="checkBoxLabel">{t('user:usermenu.setting.lbl-shadow')}</span>
              </label>
            </div>
            <div className="automaticContainer">
              <label className="automaticRow">
                <span className="automaticCheckBoxSpan">
                  <input
                    className="checkBoxInput"
                    type="checkbox"
                    data-indeterminate="false"
                    checked={rendererState.automatic.value}
                    onChange={(value: React.ChangeEvent<HTMLInputElement>) => {
                      dispatchAction(EngineRendererAction.setAutomatic({ automatic: value.target.checked }))
                    }}
                  />
                  <svg className="checkBoxSvg" focusable="false" aria-hidden="true" viewBox="0 0 24 24">
                    {rendererState.automatic.value ? (
                      <path d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2V5c0-1.1-.89-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"></path>
                    ) : (
                      <path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"></path>
                    )}
                  </svg>
                </span>
                <span className="checkBoxLabel">{t('user:usermenu.setting.lbl-automatic')}</span>
              </label>
            </div>
          </section>
        </div>
        <section className="settingView">
          <h4 className="title">{t('user:usermenu.setting.user-avatar')}</h4>
          <div className="sectionRow">
            <XRToggleButton
              labelContent={t('user:usermenu.setting.show-avatar')}
              checked={showAvatar}
              onChange={handleChangeShowAvatar}
            />
          </div>
        </section>
        {engineState.xrSupported.value && (
          <>
            <section className="settingView">
              <h4 className="title">{t('user:usermenu.setting.xrusersetting')}</h4>
              <div className="sectionRow justifySpaceBetween">
                <div className="sectionRow">
                  <XRToggleButton
                    labelContent={t('user:usermenu.setting.invert-rotation')}
                    checked={invertRotationAndMoveSticks}
                    onChange={handleChangeInvertRotationAndMoveSticks}
                  />
                </div>
                <div className="showHideButton" onClick={toggleShowDetails}>
                  {showDetails ? 'hide details' : 'show details'}
                </div>
              </div>
              {showDetails && (
                <table>
                  <thead>
                    <tr>
                      <th>{t('user:usermenu.setting.rotation')}</th>
                      <th>{t('user:usermenu.setting.rotation-angle')}</th>
                      <th align="right">{t('user:usermenu.setting.rotation-smooth-speed')}</th>
                      <th align="right">{t('user:usermenu.setting.moving')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td align="center">{avatarInputState.rotation.value}</td>
                      <td align="center">{avatarInputState.rotationAngle.value}</td>
                      <td align="center">{avatarInputState.rotationSmoothSpeed.value}</td>
                      <td align="center">{avatarInputState.moving.value}</td>
                    </tr>
                  </tbody>
                </table>
              )}
            </section>
            <section className="settingView">
              <div className="controlsContainer">
                <h4 className="title">{t('user:usermenu.setting.controls')}</h4>
                <div className="selectSize">
                  <span className="checkBoxLabel">{t('user:usermenu.setting.lbl-control-scheme')}</span>
                  <select value={controlSchemeSelected} onChange={handleChangeControlScheme}>
                    {controlSchemes.map((el, index) => (
                      <option value={el} key={index}>
                        {el}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="selectSize">
                  <span className="checkBoxLabel">{t('user:usermenu.setting.lbl-control-type')}</span>
                  <select value={controlTypeSelected} onChange={handleChangeControlType}>
                    {controllerTypes.map((el, index) => (
                      <option value={el} key={el + index}>
                        {el}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </>
  )
}
