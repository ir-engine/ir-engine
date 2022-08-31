import { createState } from '@hookstate/core'
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { UserSetting } from '@xrengine/common/src/interfaces/User'
import { AudioSettingAction, useAudioState } from '@xrengine/engine/src/audio/AudioState'
import { AvatarSettings, updateMap } from '@xrengine/engine/src/avatar/AvatarControllerSystem'
import { AvatarComponent } from '@xrengine/engine/src/avatar/components/AvatarComponent'
import {
  AvatarInputSettingsAction,
  AvatarInputSettingsState
} from '@xrengine/engine/src/avatar/state/AvatarInputSettingsState'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { useEngineState } from '@xrengine/engine/src/ecs/classes/EngineState'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { AvatarControllerType, AvatarMovementScheme } from '@xrengine/engine/src/input/enums/InputEnums'
import { EngineRendererAction, useEngineRendererState } from '@xrengine/engine/src/renderer/EngineRendererState'
import { XRState } from '@xrengine/engine/src/xr/XRState'
import { createXRUI } from '@xrengine/engine/src/xrui/functions/createXRUI'
import { dispatchAction, getState, useHookstate } from '@xrengine/hyperflux'

import { BlurLinear, Mic, VolumeUp } from '@mui/icons-material'
import SurroundSoundIcon from '@mui/icons-material/SurroundSound'

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
  const xrSessionActive = useHookstate(getState(XRState).sessionActive)
  const avatarInputState = useHookstate(getState(AvatarInputSettingsState))
  const controlScheme = avatarInputState.controlScheme.value
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
    dispatchAction(AvatarInputSettingsAction.setControlType(value as any))
  }

  const handleChangeControlScheme = (value: typeof AvatarMovementScheme[keyof typeof AvatarMovementScheme]) => {
    dispatchAction(AvatarInputSettingsAction.setControlScheme({ scheme: value }))
  }

  const toggleShowDetails = () => {
    setShowDetails(!showDetails)
  }

  const toggleShowOtherAudioSettings = () => {
    setShowAudioDetails(!showAudioDetails)
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
                min="0"
                max="1"
                step="0.01"
                value={audioState.masterVolume.value}
                onChange={(event: any) => {
                  dispatchAction(AudioSettingAction.setMasterVolume({ value: parseInt(event.target.value) }))
                }}
              />
            </div>
            <div className="sectionRow">
              <Mic />
              <XRSlider
                labelContent={t('user:usermenu.setting.lbl-microphone')}
                min="0"
                max="1"
                step="0.01"
                value={audioState.microphoneGain.value}
                onChange={(event: any) => {
                  dispatchAction(AudioSettingAction.setMicrophoneVolume({ value: parseInt(event.target.value) }))
                }}
              />
            </div>
            <div className="sectionRow justifySpaceBetween">
              <h4 className="title">{t('user:usermenu.setting.other-audio-setting')}</h4>
              <div xr-layer="true" className="showHideButton" onClick={toggleShowOtherAudioSettings}>
                {showAudioDetails ? 'hide details' : 'show details'}
              </div>
            </div>
            {showAudioDetails && (
              <>
                <div className="sectionRow">
                  <SurroundSoundIcon />
                  <XRCheckboxButton
                    labelContent={t('user:usermenu.setting.use-positional-media')}
                    checked={audioState.usePositionalMedia.value}
                    onChange={(_, value: boolean) => {
                      dispatchAction(AudioSettingAction.setUsePositionalMedia({ value }))
                    }}
                  />
                </div>
                <div className="sectionRow">
                  <VolumeUp />
                  <XRSlider
                    labelContent={t('user:usermenu.setting.lbl-media-instance')}
                    min="0"
                    max="1"
                    step="0.01"
                    value={audioState.mediaStreamVolume.value}
                    onChange={(event: any) => {
                      dispatchAction(AudioSettingAction.setMediaStreamVolume({ value: parseInt(event.target.value) }))
                    }}
                  />
                </div>
                <div className="sectionRow">
                  <VolumeUp />
                  <XRSlider
                    labelContent={t('user:usermenu.setting.lbl-notification')}
                    min="0"
                    max="1"
                    step="0.01"
                    value={audioState.notificationVolume.value}
                    onChange={(event: any) => {
                      dispatchAction(AudioSettingAction.setNotificationVolume({ value: parseInt(event.target.value) }))
                    }}
                  />
                </div>
                <div className="sectionRow">
                  <VolumeUp />
                  <XRSlider
                    labelContent={t('user:usermenu.setting.lbl-sound-effect')}
                    min="0"
                    max="1"
                    step="0.01"
                    value={audioState.soundEffectsVolume.value}
                    onChange={(event: any) => {
                      dispatchAction(AudioSettingAction.setSoundEffectsVolume({ value: parseInt(event.target.value) }))
                    }}
                  />
                </div>
                <div className="sectionRow">
                  <VolumeUp />
                  <XRSlider
                    labelContent={t('user:usermenu.setting.lbl-background-music-volume')}
                    min="0"
                    max="1"
                    step="0.01"
                    value={audioState.backgroundMusicVolume.value}
                    onChange={(event: any) => {
                      dispatchAction(
                        AudioSettingAction.setMusicVolume({
                          value: parseInt(event.target.value)
                        })
                      )
                    }}
                  />
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
        {xrSessionActive.value && (
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
                    value={controlScheme}
                    onChange={handleChangeControlScheme}
                    options={controlSchemes}
                  />
                </div>
                <div className="selectSize">
                  <span className="checkBoxLabel">{t('user:usermenu.setting.lbl-control-type')}</span>
                  <XRSelectDropdown
                    value={avatarInputState.controlType.value}
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
