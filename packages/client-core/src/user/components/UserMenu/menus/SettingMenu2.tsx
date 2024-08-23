/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import React, { useLayoutEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { AuthService, AuthState } from '@ir-engine/client-core/src/user/services/AuthService'
import { defaultThemeModes, defaultThemeSettings } from '@ir-engine/common/src/constants/DefaultThemeSettings'
import { UserSettingPatch, clientSettingPath } from '@ir-engine/common/src/schema.type.module'
import capitalizeFirstLetter from '@ir-engine/common/src/utils/capitalizeFirstLetter'
import { AudioState } from '@ir-engine/engine/src/audio/AudioState'
import {
  AvatarAxesControlScheme,
  AvatarInputSettingsState
} from '@ir-engine/engine/src/avatar/state/AvatarInputSettingsState'
import { getMutableState, useHookstate, useMutableState } from '@ir-engine/hyperflux'
import { useFind } from '@ir-engine/spatial/src/common/functions/FeathersHooks'
import { isMobile } from '@ir-engine/spatial/src/common/functions/isMobile'
import { InputState } from '@ir-engine/spatial/src/input/state/InputState'
import { RendererState } from '@ir-engine/spatial/src/renderer/RendererState'
import { XRState } from '@ir-engine/spatial/src/xr/XRState'
import BooleanInput from '@ir-engine/ui/src/components/editor/input/Boolean'
import InputGroup from '@ir-engine/ui/src/components/editor/input/Group'
import SelectInput from '@ir-engine/ui/src/components/editor/input/Select'
import { SelectOptionsType } from '@ir-engine/ui/src/primitives/tailwind/Select'
import Slider from '@ir-engine/ui/src/primitives/tailwind/Slider'
import Text from '@ir-engine/ui/src/primitives/tailwind/Text'
import Menu from '../../../../common/components/Menu'
import { UserMenus } from '../../../UserUISystem'
import { userHasAccess } from '../../../userHasAccess'
import { PopupMenuServices } from '../PopupMenuService'
import styles from '../index.module.scss'

export const ShadowMapResolutionOptions: SelectOptionsType[] = [
  {
    label: '256px',
    value: 256
  },
  {
    label: '512px',
    value: 512
  },
  {
    label: '1024px',
    value: 1024
  },
  {
    label: '2048px',
    value: 2048
  },
  {
    label: '4096px (not recommended)',
    value: 4096
  }
]

const chromeDesktop = !isMobile && /chrome/i.test(navigator.userAgent)

export type Props = {
  isPopover?: boolean
}

const SettingMenu2 = ({ isPopover }: Props): JSX.Element => {
  const { t } = useTranslation()
  const rendererState = useMutableState(RendererState)
  const audioState = useMutableState(AudioState)
  const avatarInputState = useMutableState(AvatarInputSettingsState)
  const selfUser = useMutableState(AuthState).user
  const leftAxesControlScheme = avatarInputState.leftAxesControlScheme.value
  const rightAxesControlScheme = avatarInputState.rightAxesControlScheme.value
  const inputState = useMutableState(InputState)
  const preferredHand = inputState.preferredHand.value
  const firstRender = useRef(true)
  const xrSupportedModes = useMutableState(XRState).supportedSessionModes
  const xrSupported = xrSupportedModes['immersive-ar'].value || xrSupportedModes['immersive-vr'].value
  const windowsPerformanceHelp = navigator.platform?.startsWith('Win')
  const controlSchemes = Object.entries(AvatarAxesControlScheme)
  const handOptions = ['left', 'right']
  const selectedTab = useHookstate('general')

  const clientSettingQuery = useFind(clientSettingPath)
  const clientSettings = clientSettingQuery.data[0]
  const userSettings = selfUser.userSetting.value

  const hasAdminAccess = userHasAccess('admin:admin')
  const hasEditorAccess = userHasAccess('editor:write')
  const themeSettings = { ...defaultThemeSettings, ...clientSettings?.themeSettings }
  const themeModes = {
    client: userSettings?.themeModes?.client ?? defaultThemeModes.client,
    studio: userSettings?.themeModes?.studio ?? defaultThemeModes.studio,
    admin: userSettings?.themeModes?.admin ?? defaultThemeModes.admin
  }

  const handleChangeUserThemeMode = (mode, event) => {
    if (!userSettings) return

    const settings: UserSettingPatch = { themeModes: { ...themeModes, [mode]: event } }
    AuthService.updateUserSettings(userSettings.id, settings)
  }

  useLayoutEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    /** @todo switch handdedness */
  }, [avatarInputState.invertRotationAndMoveSticks])

  const handleTabChange = (newValue: string) => {
    selectedTab.set(newValue)
  }

  const settingTabs = [
    { value: 'general', label: t('user:usermenu.setting.general') },
    { value: 'audio', label: t('user:usermenu.setting.audio') },
    { value: 'graphics', label: t('user:usermenu.setting.graphics') }
  ]

  const accessibleThemeModes = Object.keys(themeModes).filter((mode) => {
    if (mode === 'admin' && !hasAdminAccess) {
      return false
    } else if (mode === 'studio' && !hasEditorAccess) {
      return false
    }
    return true
  })

  const colorModesMenu: SelectOptionsType[] = Object.keys(themeSettings).map((el) => {
    return {
      label: capitalizeFirstLetter(el),
      value: el
    }
  })

  const controlSchemesMenu: SelectOptionsType[] = controlSchemes.map(([label, value]) => {
    return {
      label,
      value
    }
  })

  const handOptionsMenu: SelectOptionsType[] = handOptions.map((el) => {
    return {
      label: el,
      value: el
    }
  })

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
    <Menu
      open
      showBackButton
      isPopover={isPopover}
      onBack={() => PopupMenuServices.showPopupMenu(UserMenus.Profile)}
      onClose={() => PopupMenuServices.showPopupMenu()}
    >
      <div className="mb-3 flex">
        {settingTabs.map((tab) => (
          <div className={`${tab.value === selectedTab.value ? 'border-b-2 border-[#6B7280]' : ''} p-2`}>
            <button
              className={`p-2 ${tab.value === selectedTab.value ? 'text-[#214AA6]' : 'text-[#6B7280]'}`}
              onClick={() => handleTabChange(tab.value)}
            >
              {tab.label}
            </button>
          </div>
        ))}
      </div>
      {selectedTab.value === 'general' && selfUser && (
        <>
          <Text className="mb-5 mt-1">{t('user:usermenu.setting.themes')}</Text>
          <div className="mb-4 flex justify-between gap-1">
            {accessibleThemeModes.map((mode, index) => (
              <div className="flex-1" key={index}>
                <InputGroup className="w-full" name="Type" label="">
                  <SelectInput
                    label={`${t(`user:usermenu.setting.${mode}`)} ${t('user:usermenu.setting.theme')}`}
                    value={mode === 'client' ? 'dark' : themeModes[mode]}
                    className="w-full"
                    inputClassName="rounded-lg overflow-hidden"
                    onChange={(val) => handleChangeUserThemeMode(mode, val)}
                    options={colorModesMenu}
                  />
                </InputGroup>
              </div>
            ))}
          </div>

          {xrSupported && (
            <>
              <Text className="my-1 items-center">{t('user:usermenu.setting.xrusersetting')}</Text>

              <div className="grid">
                <div className="grid">
                  <SelectInput
                    label={t('user:usermenu.setting.lbl-left-control-scheme')}
                    value={leftAxesControlScheme}
                    options={controlSchemesMenu}
                    onChange={(event) =>
                      getMutableState(AvatarInputSettingsState).leftAxesControlScheme.set(controlSchemesMenu[event])
                    }
                  />
                </div>
                <div className="grid">
                  <SelectInput
                    label={t('user:usermenu.setting.lbl-right-control-scheme')}
                    value={rightAxesControlScheme}
                    options={controlSchemesMenu}
                    onChange={(event) =>
                      getMutableState(AvatarInputSettingsState).rightAxesControlScheme.set(
                        AvatarAxesControlScheme[event]
                      )
                    }
                  />
                </div>
                <div className="grid">
                  <SelectInput
                    label={t('user:usermenu.setting.lbl-preferred-hand')}
                    value={preferredHand}
                    options={handOptionsMenu}
                    onChange={(event) => getMutableState(InputState).preferredHand.set(handOptionsMenu[event])}
                  />
                </div>
              </div>
            </>
          )}

          {/* Controls Helptext */}
          <>
            <div className="mb-5 mt-1">{t('user:usermenu.setting.controls')}</div>

            {!isMobile && !xrSupported && (
              <>
                <div className="m-2 rounded-md bg-[#191B1F]">
                  <img src="/static/Desktop_Tutorial_Keyboard.png" alt="Desktop Controls" className="m-auto" />
                </div>
                <div className="flex">
                  <div className="m-2 flex-1 rounded-md bg-[#191B1F]">
                    <img src="/static/Controller_Tutorial.png" alt="Controller Controls" className="m-auto" />
                  </div>
                  <div className="m-2 flex-1 rounded-md bg-[#191B1F]">
                    <img src="/static/Desktop_Tutorial_Mouse.png" alt="Controller Controls" className="m-auto" />
                  </div>
                </div>
              </>
            )}

            {isMobile && (
              <img
                className={`${styles.row} ${styles.tutorialImage}`}
                src="/static/Mobile_Tutorial.png"
                alt="Mobile Controls"
              />
            )}

            {xrSupported && (
              <img
                className={`${styles.row} ${styles.tutorialImage}`}
                src="/static/XR_Tutorial.png"
                alt="XR Controls"
              />
            )}
          </>

          {/* Windows-specific Graphics/Performance Optimization Helptext */}
          {windowsPerformanceHelp && (
            <>
              <Text>{t('user:usermenu.setting.windowsPerformanceHelp')}</Text>

              <Text>
                If you're experiencing performance issues, and you're running on a machine with Nvidia graphics, try the
                following.
              </Text>

              <Text>Open the Nvidia Control Panel, select Chrome, make sure "High Performance" is selected.</Text>

              <img className={styles.row} src="/static/Nvidia_control_panel1.png" alt="Nvidia Control Panel" />

              <Text>In settings for Windows 10/11, search for the 'Graphics' preference on AMD/Nvidia for Chrome.</Text>

              <img className={styles.row} src="/static/Nvidia_windows_prefs.png" alt="Nvidia Windows Preferences" />
            </>
          )}
        </>
      )}

      {selectedTab.value === 'audio' && (
        <>
          {chromeDesktop && (
            <div className="py-2 text-xs">
              {t('user:usermenu.setting.chromeAEC')}
              <br />
              <b>
                <u>chrome://flags/#chrome-wide-echo-cancellation</u>
              </b>
            </div>
          )}

          <InputGroup name="Type" label={t('user:usermenu.setting.use-positional-media')} className="justify-start">
            <BooleanInput
              value={audioState.positionalMedia.value}
              onChange={(value: boolean) => {
                getMutableState(AudioState).positionalMedia.set(value)
              }}
            />
          </InputGroup>
          <InputGroup name="Type" label={t('user:usermenu.setting.lbl-volume')} className="justify-start">
            <Slider
              max={1}
              min={0}
              step={0.01}
              value={audioState.masterVolume.value}
              onChange={(value: number) => {
                getMutableState(AudioState).masterVolume.set(value)
              }}
              onRelease={() => {}}
            />
          </InputGroup>
          <InputGroup name="Type" label={t('user:usermenu.setting.lbl-microphone')} className="justify-start">
            <Slider
              max={1}
              min={0}
              step={0.01}
              value={audioState.microphoneGain.value}
              onChange={(value: number) => {
                getMutableState(AudioState).microphoneGain.set(value)
              }}
              onRelease={() => {}}
            />
          </InputGroup>
          <InputGroup name="Type" label={t('user:usermenu.setting.lbl-media-instance')} className="justify-start">
            <Slider
              max={1}
              min={0}
              step={0.01}
              value={audioState.mediaStreamVolume.value}
              onChange={(value: number) => {
                getMutableState(AudioState).mediaStreamVolume.set(value)
              }}
              onRelease={() => {}}
            />
          </InputGroup>
          <InputGroup name="Type" label={t('user:usermenu.setting.lbl-notification')} className="justify-start">
            <Slider
              max={1}
              min={0}
              step={0.01}
              value={audioState.notificationVolume.value}
              onChange={(value: number) => {
                getMutableState(AudioState).notificationVolume.set(value)
              }}
              onRelease={() => {}}
            />
          </InputGroup>
          <InputGroup name="Type" label={t('user:usermenu.setting.lbl-sound-effect')} className="justify-start">
            <Slider
              max={1}
              min={0}
              step={0.01}
              value={audioState.soundEffectsVolume.value}
              onChange={(value: number) => {
                getMutableState(AudioState).soundEffectsVolume.set(value)
              }}
              onRelease={() => {}}
            />
          </InputGroup>
          <InputGroup
            name="Type"
            label={t('user:usermenu.setting.lbl-background-music-volume')}
            className="justify-start"
          >
            <Slider
              max={1}
              min={0}
              step={0.01}
              value={audioState.backgroundMusicVolume.value}
              onChange={(value: number) => {
                getMutableState(AudioState).backgroundMusicVolume.set(value)
              }}
              onRelease={() => {}}
            />
          </InputGroup>
        </>
      )}

      {/* Graphics Settings */}
      {selectedTab.value === 'graphics' && (
        <>
          <InputGroup name="Type" label={t('user:usermenu.setting.lbl-quality')} className="justify-start">
            <Slider
              max={5}
              min={0}
              step={1}
              value={rendererState.qualityLevel.value}
              onChange={handleQualityLevelChange}
              onRelease={() => {}}
            />
          </InputGroup>

          <div className="grid py-4">
            <div className="grid">
              <InputGroup name="Type" label={t('user:usermenu.setting.lbl-pp')} className="justify-start">
                <BooleanInput onChange={handlePostProcessingCheckbox} value={rendererState.usePostProcessing.value} />
              </InputGroup>
            </div>

            <div className="grid">
              <InputGroup name="Type" label={t('user:usermenu.setting.lbl-shadow')} className="justify-start">
                <BooleanInput onChange={handleShadowCheckbox} value={rendererState.useShadows.value} />
              </InputGroup>
            </div>

            <div className="grid">
              <InputGroup name="Type" label={t('user:usermenu.setting.lbl-automatic')} className="justify-start">
                <BooleanInput onChange={handleAutomaticCheckbox} value={rendererState.automatic.value} />
              </InputGroup>
            </div>
          </div>

          {rendererState.useShadows.value && (
            <SelectInput
              label={t('editor:properties.directionalLight.lbl-shadowmapResolution')}
              value={rendererState.shadowMapResolution.value}
              options={ShadowMapResolutionOptions}
              onChange={(event) => rendererState.shadowMapResolution.set(ShadowMapResolutionOptions[event])}
            />
          )}
        </>
      )}
    </Menu>
  )
}

export default SettingMenu2
