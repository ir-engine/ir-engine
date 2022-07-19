import { createState } from '@speigg/hookstate'
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { UserSetting } from '@xrengine/common/src/interfaces/User'
import { AudioSettingAction, useAudioState } from '@xrengine/engine/src/audio/AudioState'
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
import XRCheckboxButton from '../../components/XRCheckboxButton'
import XRSelectDropdown from '../../components/XRSelectDropdown'
import XRSlider from '../../components/XRSlider'
import XRToggleButton from '../../components/XRToggleButton'
import styleString from './index.scss'

export function createSettingDetailView() {
  return createXRUI(SettingDetailView, createSettingDetailState())
}

function createSettingDetailState() {
  return createState({})
}

// TODO: update this to newest settings implementation
const SettingDetailView = () => {
  const { t } = useTranslation()
  const rendererState = useEngineRendererState()
  const audioState = useAudioState()
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
  const [showAudioDetails, setShowAudioDetails] = useState(false)
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

  const handleChangeControlType = (value) => {
    setControlType(value as any)
    dispatchAction(AvatarInputSettingsAction.setControlType(value as any))
  }

  const handleChangeControlScheme = (value: string) => {
    setControlScheme(value)
    AvatarSettings.instance.movementScheme = AvatarMovementScheme[value]
  }

  const toggleShowDetails = () => {
    setShowDetails(!showDetails)
  }
  const toggleShowOtherAudioSettings = () => {
    setShowDetails(!showDetails)
  }

  const handlePostProcessingCheckbox = () => {
    dispatchAction(
      EngineRendererAction.setPostProcessing({
        usePostProcessing: !rendererState.usePostProcessing.value
      })
    )
    dispatchAction(EngineRendererAction.setAutomatic({ automatic: false }))
  }

  const handleShadowCheckbox = () => {
    dispatchAction(EngineRendererAction.setShadows({ useShadows: !rendererState.useShadows.value }))
    dispatchAction(EngineRendererAction.setAutomatic({ automatic: false }))
  }

  const handleAutomaticCheckbox = () => {
    dispatchAction(EngineRendererAction.setAutomatic({ automatic: !rendererState.automatic.value }))
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
              <XRSlider
                labelContent={t('user:usermenu.setting.lbl-volume')}
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
              />
            </div>
            <div className="sectionRow">
              <Mic />
              <XRSlider
                labelContent={t('user:usermenu.setting.lbl-microphone')}
                min="1"
                max="100"
                value={userSettings?.microphone == null ? 100 : userSettings?.microphone}
                onChange={(event: any) => {
                  setUserSettings({ microphone: parseInt(event.target.value) })
                }}
              />
            </div>
            <div className="sectionRow">
              <h4 className="title">{t('user:usermenu.setting.other-audio-setting')}</h4>
              <div xr-layer className="showHideButton" onClick={toggleShowOtherAudioSettings}>
                {showAudioDetails ? 'hide details' : 'show details'}
              </div>
            </div>
            {showAudioDetails && (
              <>
                <div className="sectionRow">
                  <span className="iconSpan">
                    <svg className="iconSvg" focusable="false" aria-hidden="true" viewBox="0 0 24 24">
                      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"></path>
                    </svg>
                  </span>
                  <span className="label">{t('user:usermenu.setting.lbl-media-instance')}</span>
                  <input
                    className="slider"
                    type="range"
                    min="1"
                    max="100"
                    value={audioState.mediaStreamVolume.value == null ? 100 : audioState.mediaStreamVolume.value}
                    onChange={(event: any) => {
                      dispatchAction(
                        AudioSettingAction.setMediaStreamVolume({ mediastreamVolume: parseInt(event.target.value) })
                      )
                    }}
                  ></input>
                </div>
                <div className="sectionRow">
                  <span className="iconSpan">
                    <svg className="iconSvg" focusable="false" aria-hidden="true" viewBox="0 0 24 24">
                      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"></path>
                    </svg>
                  </span>
                  <span className="label">{t('user:usermenu.setting.lbl-notification')}</span>
                  <input
                    className="slider"
                    type="range"
                    min="1"
                    max="100"
                    value={audioState.notificationVolume.value == null ? 100 : audioState.notificationVolume.value}
                    onChange={(event: any) => {
                      dispatchAction(
                        AudioSettingAction.setNotification({ notificationVolume: parseInt(event.target.value) })
                      )
                    }}
                  ></input>
                </div>
                <div className="sectionRow">
                  <span className="iconSpan">
                    <svg className="iconSvg" focusable="false" aria-hidden="true" viewBox="0 0 24 24">
                      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"></path>
                    </svg>
                  </span>
                  <span className="label">{t('user:usermenu.setting.lbl-sound-effect')}</span>
                  <input
                    className="slider"
                    type="range"
                    min="1"
                    max="100"
                    value={audioState.soundEffectsVolume.value == null ? 100 : audioState.soundEffectsVolume.value}
                    onChange={(event: any) => {
                      dispatchAction(
                        AudioSettingAction.setSoundEffectsVolume({ soundEffectsVolume: parseInt(event.target.value) })
                      )
                    }}
                  ></input>
                </div>
                <div className="sectionRow">
                  <span className="iconSpan">
                    <svg className="iconSvg" focusable="false" aria-hidden="true" viewBox="0 0 24 24">
                      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"></path>
                    </svg>
                  </span>
                  <span className="label">{t('user:usermenu.setting.lbl-background-music-volume')}</span>
                  <input
                    className="slider"
                    type="range"
                    min="1"
                    max="100"
                    value={
                      audioState.backgroundMusicVolume.value == null ? 100 : audioState.backgroundMusicVolume.value
                    }
                    onChange={(event: any) => {
                      dispatchAction(
                        AudioSettingAction.setBackgroundMusicVolume({
                          backgroundMusicVolume: parseInt(event.target.value)
                        })
                      )
                    }}
                  ></input>
                </div>
              </>
            )}
          </section>
          <section className="graphicsSection">
            <h4 className="title">{t('user:usermenu.setting.graphics')}</h4>
            <div className="sectionRow">
              <BlurLinear />
              <XRSlider
                labelContent={t('user:usermenu.setting.lbl-resolution')}
                min="1"
                max="5"
                step="1"
                value={rendererState.qualityLevel.value}
                onChange={(event: any) => {
                  dispatchAction(EngineRendererAction.setQualityLevel({ qualityLevel: parseInt(event.target.value) }))
                  dispatchAction(EngineRendererAction.setAutomatic({ automatic: false }))
                }}
              />
            </div>

            <div className="graphicsCheckBoxRow">
              <XRCheckboxButton
                checked={rendererState.usePostProcessing.value}
                labelContent={t('user:usermenu.setting.lbl-pp')}
                onChange={handlePostProcessingCheckbox}
              />
              <XRCheckboxButton
                checked={rendererState.useShadows.value}
                labelContent={t('user:usermenu.setting.lbl-shadow')}
                onChange={handleShadowCheckbox}
              />
            </div>
            <div className="automaticContainer">
              <XRCheckboxButton
                checked={rendererState.automatic.value}
                labelContent={t('user:usermenu.setting.lbl-automatic')}
                onChange={handleAutomaticCheckbox}
              />
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
                  <XRSelectDropdown
                    value={controlSchemeSelected}
                    onChange={handleChangeControlScheme}
                    options={controlSchemes}
                  />
                </div>
                <div className="selectSize">
                  <span className="checkBoxLabel">{t('user:usermenu.setting.lbl-control-type')}</span>
                  <XRSelectDropdown
                    value={controlTypeSelected}
                    onChange={handleChangeControlType}
                    options={controllerTypes}
                  />
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </>
  )
}
