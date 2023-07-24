/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { createState } from '@hookstate/core'
import React, { useEffect, useLayoutEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { AudioSettingAction, AudioState } from '@etherealengine/engine/src/audio/AudioState'
import { AvatarComponent } from '@etherealengine/engine/src/avatar/components/AvatarComponent'
import {
  AvatarAxesControlScheme,
  AvatarControllerType,
  AvatarInputSettingsAction,
  AvatarInputSettingsState
} from '@etherealengine/engine/src/avatar/state/AvatarInputSettingsState'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { getComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { RendererState } from '@etherealengine/engine/src/renderer/RendererState'
import { XRState } from '@etherealengine/engine/src/xr/XRState'
import { createXRUI } from '@etherealengine/engine/src/xrui/functions/createXRUI'
import { dispatchAction, getMutableState, useHookstate } from '@etherealengine/hyperflux'
import Icon from '@etherealengine/ui/src/primitives/mui/Icon'

import XRCheckboxButton from '../../components/XRCheckboxButton'
import XRSelectDropdown from '../../components/XRSelectDropdown'
import XRSlider from '../../components/XRSlider'
import XRToggleButton from '../../components/XRToggleButton'
import styleString from './index.scss?inline'

/** @deprecated */
export function createSettingDetailView() {
  return createXRUI(SettingDetailView, createSettingDetailState())
}

function createSettingDetailState() {
  return createState({})
}
/** @deprecated */
// TODO: update this to newest settings implementation
const SettingDetailView = () => {
  const { t } = useTranslation()
  const rendererState = useHookstate(getMutableState(RendererState))
  const audioState = useHookstate(getMutableState(AudioState))
  const xrSessionActive = useHookstate(getMutableState(XRState).sessionActive)
  const avatarInputState = useHookstate(getMutableState(AvatarInputSettingsState))
  const leftAxesControlScheme = avatarInputState.leftAxesControlScheme.value
  const rightAxesControlScheme = avatarInputState.rightAxesControlScheme.value
  const invertRotationAndMoveSticks = avatarInputState.invertRotationAndMoveSticks.value
  const showAvatar = avatarInputState.showAvatar.value
  const firstRender = useRef(true)
  const showAudioDetails = useHookstate(false)

  const controllerTypes = Object.values(AvatarControllerType).filter((value) => typeof value === 'string')
  const handOptions = ['left', 'right'] as const
  const controlSchemes = Object.values(AvatarAxesControlScheme).filter((value) => typeof value === 'string')

  useEffect(() => {
    const entity = Engine.instance.localClientEntity
    const avatar = getComponent(entity, AvatarComponent)
    if (!avatar) return
    if (showAvatar) {
      if (avatar.model!.visible) return
      avatar.model!.visible = showAvatar
    } else {
      if (!avatar.model!.visible) return
      avatar.model!.visible = showAvatar
    }
  }, [showAvatar])

  useLayoutEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    /** @todo - switch handedness */
  }, [avatarInputState.invertRotationAndMoveSticks])

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

  const toggleShowOtherAudioSettings = () => {
    showAudioDetails.set(!showAudioDetails.value)
  }

  const handleQualityLevelChange = (value) => {
    rendererState.qualityLevel.set(value)
    rendererState.automatic.set(false)
  }

  const handlePostProcessingCheckbox = () => {
    rendererState.usePostProcessing.set(!rendererState.usePostProcessing.value)
    rendererState.automatic.set(false)
  }

  const handleShadowCheckbox = () => {
    rendererState.useShadows.set(!rendererState.useShadows.value)
    rendererState.automatic.set(false)
  }

  const handleAutomaticCheckbox = () => {
    rendererState.automatic.set(!rendererState.automatic.value)
  }

  return (
    <>
      <style>{styleString}</style>
      <div className="container" xr-layer="true">
        <div className="settingView">
          <section className="audioSection">
            <h4 className="title">{t('user:usermenu.setting.audio')}</h4>
            <div className="sectionRow">
              <Icon type="VolumeUp" />
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
              <Icon type="Mic" />
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
            <div className="sectionRow justifySpaceBetween" onClick={toggleShowOtherAudioSettings}>
              <h4 className="title">{t('user:usermenu.setting.other-audio-setting')}</h4>
              <div xr-layer="true" className="showHideButton">
                {showAudioDetails.value ? 'hide details' : 'show details'}
              </div>
            </div>
            {showAudioDetails.value && (
              <>
                <div className="sectionRow">
                  <Icon type="SurroundSound" />
                  <XRCheckboxButton
                    labelContent={t('user:usermenu.setting.use-positional-media')}
                    checked={audioState.positionalMedia.value}
                    onChange={(_, value: boolean) => {
                      dispatchAction(AudioSettingAction.setUsePositionalMedia({ value }))
                    }}
                  />
                </div>
                <div className="sectionRow">
                  <Icon type="VolumeUp" />
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
                  <Icon type="VolumeUp" />
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
                  <Icon type="VolumeUp" />
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
                  <Icon type="VolumeUp" />
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
              <Icon type="BlurLinear" />
              <XRSlider
                labelContent={t('user:usermenu.setting.lbl-resolution')}
                min="1"
                max="5"
                step="1"
                value={rendererState.qualityLevel.value}
                onChange={handleQualityLevelChange}
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
              </div>
            </section>
            <section className="settingView">
              <div className="controlsContainer">
                <h4 className="title">{t('user:usermenu.setting.controls')}</h4>
                <div className="selectSize">
                  <span className="checkBoxLabel">{t('user:usermenu.setting.lbl-left-control-scheme')}</span>
                  <XRSelectDropdown
                    value={leftAxesControlScheme}
                    onChange={(value) =>
                      dispatchAction(AvatarInputSettingsAction.setLeftAxesControlScheme({ scheme: value }))
                    }
                    options={controlSchemes}
                  />
                </div>
                <div className="selectSize">
                  <span className="checkBoxLabel">{t('user:usermenu.setting.lbl-right-control-scheme')}</span>
                  <XRSelectDropdown
                    value={rightAxesControlScheme}
                    onChange={(value) =>
                      dispatchAction(AvatarInputSettingsAction.setRightAxesControlScheme({ scheme: value }))
                    }
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
                <div className="selectSize">
                  <span className="checkBoxLabel">{t('user:usermenu.setting.lbl-preferred-hand')}</span>
                  <XRSelectDropdown
                    value={avatarInputState.preferredHand.value}
                    onChange={(value) =>
                      dispatchAction(AvatarInputSettingsAction.setPreferredHand({ handdedness: value }))
                    }
                    options={handOptions}
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
