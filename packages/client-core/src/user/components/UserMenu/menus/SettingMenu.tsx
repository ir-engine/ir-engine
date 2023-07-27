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

import React, { useLayoutEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import InputCheck from '@etherealengine/client-core/src/common/components/InputCheck'
import InputSelect, { InputMenuItem } from '@etherealengine/client-core/src/common/components/InputSelect'
import InputSlider from '@etherealengine/client-core/src/common/components/InputSlider'
import Menu from '@etherealengine/client-core/src/common/components/Menu'
import Tabs from '@etherealengine/client-core/src/common/components/Tabs'
import Text from '@etherealengine/client-core/src/common/components/Text'
import { AuthService, AuthState } from '@etherealengine/client-core/src/user/services/AuthService'
import { defaultThemeModes, defaultThemeSettings } from '@etherealengine/common/src/constants/DefaultThemeSettings'
import capitalizeFirstLetter from '@etherealengine/common/src/utils/capitalizeFirstLetter'
import InputGroup from '@etherealengine/editor/src/components/inputs/InputGroup'
import SelectInput from '@etherealengine/editor/src/components/inputs/SelectInput'
import { AudioSettingAction, AudioState } from '@etherealengine/engine/src/audio/AudioState'
import {
  AvatarAxesControlScheme,
  AvatarInputSettingsAction,
  AvatarInputSettingsState
} from '@etherealengine/engine/src/avatar/state/AvatarInputSettingsState'
import { isMobile } from '@etherealengine/engine/src/common/functions/isMobile'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { EngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { RendererState } from '@etherealengine/engine/src/renderer/RendererState'
import { XRState } from '@etherealengine/engine/src/xr/XRState'
import { dispatchAction, getMutableState, useHookstate } from '@etherealengine/hyperflux'
import Box from '@etherealengine/ui/src/primitives/mui/Box'
import Grid from '@etherealengine/ui/src/primitives/mui/Grid'
import Icon from '@etherealengine/ui/src/primitives/mui/Icon'

import { AdminClientSettingsState } from '../../../../admin/services/Setting/ClientSettingService'
import { userHasAccess } from '../../../userHasAccess'
import { UserMenus } from '../../../UserUISystem'
import styles from '../index.module.scss'
import { PopupMenuServices } from '../PopupMenuService'

export const ShadowMapResolutionOptions = [
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

type Props = {
  isPopover?: boolean
}

const SettingMenu = ({ isPopover }: Props): JSX.Element => {
  const { t } = useTranslation()
  const rendererState = useHookstate(getMutableState(RendererState))
  const audioState = useHookstate(getMutableState(AudioState))
  const avatarInputState = useHookstate(getMutableState(AvatarInputSettingsState))
  const selfUser = useHookstate(getMutableState(AuthState).user)
  const leftAxesControlScheme = avatarInputState.leftAxesControlScheme.value
  const rightAxesControlScheme = avatarInputState.rightAxesControlScheme.value
  const preferredHand = avatarInputState.preferredHand.value
  const invertRotationAndMoveSticks = avatarInputState.invertRotationAndMoveSticks.value
  const firstRender = useRef(true)
  const xrSupportedModes = useHookstate(getMutableState(XRState).supportedSessionModes)
  const xrSupported = xrSupportedModes['immersive-ar'].value || xrSupportedModes['immersive-vr'].value
  const windowsPerformanceHelp = navigator.platform?.startsWith('Win')
  const controlSchemes = Object.entries(AvatarAxesControlScheme)
  const handOptions = ['left', 'right']
  const selectedTab = useHookstate('general')
  const engineState = useHookstate(getMutableState(EngineState))

  const clientSettingState = useHookstate(getMutableState(AdminClientSettingsState))
  const [clientSetting] = clientSettingState?.client?.value || []
  const userSettings = selfUser.user_setting.value

  const hasAdminAccess =
    selfUser?.id?.value?.length > 0 && selfUser?.scopes?.value?.find((scope) => scope.type === 'admin:admin')
  const hasEditorAccess = userHasAccess('editor:write')
  const themeSettings = { ...defaultThemeSettings, ...clientSetting.themeSettings }
  const themeModes = {
    client: userSettings?.themeModes?.client ?? defaultThemeModes.client,
    studio: userSettings?.themeModes?.studio ?? defaultThemeModes.studio,
    admin: userSettings?.themeModes?.admin ?? defaultThemeModes.admin
  }

  const showWorldSettings = Engine.instance.localClientEntity || engineState.value

  const handleChangeUserThemeMode = (event) => {
    if (!userSettings) return
    const { name, value } = event.target

    const settings = { themeModes: { ...themeModes, [name]: value } }
    AuthService.updateUserSettings(userSettings.id as string, settings)
  }

  const handleChangeInvertRotationAndMoveSticks = () => {
    dispatchAction(
      AvatarInputSettingsAction.setInvertRotationAndMoveSticks({
        invertRotationAndMoveSticks: !invertRotationAndMoveSticks
      })
    )
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

  const settingTabs = [{ value: 'general', label: t('user:usermenu.setting.general') }]
  if (showWorldSettings) {
    settingTabs.push(
      { value: 'audio', label: t('user:usermenu.setting.audio') },
      { value: 'graphics', label: t('user:usermenu.setting.graphics') }
    )
  }

  const accessibleThemeModes = Object.keys(themeModes).filter((mode) => {
    if (mode === 'admin' && !hasAdminAccess) {
      return false
    } else if (mode === 'studio' && !hasEditorAccess) {
      return false
    }
    return true
  })

  const colorModesMenu: InputMenuItem[] = Object.keys(themeSettings).map((el) => {
    return {
      label: capitalizeFirstLetter(el),
      value: el
    }
  })

  const controlSchemesMenu: InputMenuItem[] = controlSchemes.map(([label, value]) => {
    return {
      label,
      value
    }
  })

  const handOptionsMenu: InputMenuItem[] = handOptions.map((el) => {
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
      header={<Tabs value={selectedTab.value} items={settingTabs} onChange={handleTabChange} />}
      onBack={() => PopupMenuServices.showPopupMenu(UserMenus.Profile)}
      onClose={() => PopupMenuServices.showPopupMenu()}
    >
      <Box className={styles.menuContent}>
        {selectedTab.value === 'general' && selfUser && (
          <>
            <Text align="center" variant="body1" mb={2} mt={1}>
              {t('user:usermenu.setting.themes')}
            </Text>

            <Grid container spacing={{ xs: 0, sm: 2 }}>
              {accessibleThemeModes.map((mode, index) => (
                <Grid key={index} item xs={12} sm={4}>
                  <InputSelect
                    name={mode}
                    label={`${t(`user:usermenu.setting.${mode}`)} ${t('user:usermenu.setting.theme')}`}
                    value={themeModes[mode]}
                    menu={colorModesMenu}
                    onChange={(e) => handleChangeUserThemeMode(e)}
                  />
                </Grid>
              ))}
            </Grid>

            {xrSupported && showWorldSettings && (
              <>
                <Text align="center" variant="body1" mb={1} mt={1}>
                  {t('user:usermenu.setting.xrusersetting')}
                </Text>

                {/* <InputSwitch
                  checked={invertRotationAndMoveSticks}
                  label={t('user:usermenu.setting.invert-rotation')}
                  sx={{ mb: 2 }}
                  onChange={handleChangeInvertRotationAndMoveSticks}
                /> */}

                <Grid container spacing={{ xs: 0, sm: 2 }}>
                  <Grid item xs={12} sm={4}>
                    <InputSelect
                      label={t('user:usermenu.setting.lbl-left-control-scheme')}
                      value={leftAxesControlScheme}
                      menu={controlSchemesMenu}
                      onChange={(event) => {
                        dispatchAction(
                          AvatarInputSettingsAction.setLeftAxesControlScheme({ scheme: event.target.value })
                        )
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <InputSelect
                      label={t('user:usermenu.setting.lbl-right-control-scheme')}
                      value={rightAxesControlScheme}
                      menu={controlSchemesMenu}
                      onChange={(event) => {
                        dispatchAction(
                          AvatarInputSettingsAction.setRightAxesControlScheme({ scheme: event.target.value })
                        )
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <InputSelect
                      label={t('user:usermenu.setting.lbl-preferred-hand')}
                      value={preferredHand}
                      menu={handOptionsMenu}
                      onChange={(event) =>
                        dispatchAction(AvatarInputSettingsAction.setPreferredHand({ handdedness: event.target.value }))
                      }
                    />
                  </Grid>
                </Grid>
              </>
            )}

            {/* Controls Helptext */}
            {showWorldSettings && (
              <>
                <Text align="center" variant="body1" mb={2} mt={1}>
                  {t('user:usermenu.setting.controls')}
                </Text>

                {!isMobile && !xrSupported && (
                  <>
                    <img
                      className={`${styles.row} ${styles.tutorialImage}`}
                      src="/static/Desktop_Tutorial.png"
                      alt="Desktop Controls"
                    />
                    <img
                      className={`${styles.row} ${styles.tutorialImage}`}
                      src="/static/Controller_Tutorial.png"
                      alt="Controller Controls"
                    />
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
            )}

            {/* Windows-specific Graphics/Performance Optimization Helptext */}
            {windowsPerformanceHelp && showWorldSettings && (
              <>
                <Text align="center" variant="body1" mb={2} mt={3}>
                  {t('user:usermenu.setting.windowsPerformanceHelp')}
                </Text>

                <Text variant="caption">
                  If you're experiencing performance issues, and you're running on a machine with Nvidia graphics, try
                  the following.
                </Text>

                <Text variant="caption">
                  Open the Nvidia Control Panel, select Chrome, make sure "High Performance" is selected.
                </Text>

                <img className={styles.row} src="/static/Nvidia_control_panel1.png" alt="Nvidia Control Panel" />

                <Text variant="caption">
                  In settings for Windows 10/11, search for the 'Graphics' preference on AMD/Nvidia for Chrome.
                </Text>

                <img className={styles.row} src="/static/Nvidia_windows_prefs.png" alt="Nvidia Windows Preferences" />
              </>
            )}
          </>
        )}

        {selectedTab.value === 'audio' && (
          <>
            {chromeDesktop && (
              <Text align="center" variant="caption" mb={2.5}>
                {t('user:usermenu.setting.chromeAEC')}
                <br />
                <b>
                  <u>chrome://flags/#chrome-wide-echo-cancellation</u>
                </b>
              </Text>
            )}

            <InputCheck
              type="wide"
              icon={<Icon type="SurroundSound" />}
              label={t('user:usermenu.setting.use-positional-media')}
              checked={audioState.positionalMedia.value}
              onChange={(value: boolean) => {
                dispatchAction(AudioSettingAction.setUsePositionalMedia({ value }))
              }}
            />

            <InputSlider
              icon={<Icon type={audioState.masterVolume.value == 0 ? 'VolumeOff' : 'VolumeUp'} />}
              label={t('user:usermenu.setting.lbl-volume')}
              max={1}
              min={0}
              step={0.01}
              value={audioState.masterVolume.value}
              onChange={(value: number) => {
                dispatchAction(AudioSettingAction.setMasterVolume({ value }))
              }}
            />

            <InputSlider
              icon={<Icon type={audioState.microphoneGain.value == 0 ? 'MicOff' : 'Mic'} />}
              label={t('user:usermenu.setting.lbl-microphone')}
              max={1}
              min={0}
              step={0.01}
              value={audioState.microphoneGain.value}
              onChange={(value: number) => {
                dispatchAction(AudioSettingAction.setMicrophoneVolume({ value }))
              }}
            />

            {/* <Button
              type="expander"
              open={openOtherAudioSettings}
              sx={{ justifyContent: 'center', margin: 1.5 }}
              onClick={() => setOpenOtherAudioSettings(!openOtherAudioSettings)}
            >
              {t('user:usermenu.setting.other-audio-setting')}
            </Button> */}

            {/* <Collapse in={openOtherAudioSettings} timeout="auto" unmountOnExit>
              <> */}

            <InputSlider
              icon={<Icon type={audioState.mediaStreamVolume.value == 0 ? 'VolumeOff' : 'VolumeUp'} />}
              label={t('user:usermenu.setting.lbl-media-instance')}
              max={1}
              min={0}
              step={0.01}
              value={audioState.mediaStreamVolume.value}
              onChange={(value: number) => {
                dispatchAction(AudioSettingAction.setMediaStreamVolume({ value }))
              }}
            />

            <InputSlider
              icon={<Icon type={audioState.notificationVolume.value == 0 ? 'VolumeOff' : 'VolumeUp'} />}
              label={t('user:usermenu.setting.lbl-notification')}
              max={1}
              min={0}
              step={0.01}
              value={audioState.notificationVolume.value}
              onChange={(value: number) => {
                dispatchAction(AudioSettingAction.setNotificationVolume({ value }))
              }}
            />

            <InputSlider
              icon={<Icon type={audioState.soundEffectsVolume.value == 0 ? 'VolumeOff' : 'VolumeUp'} />}
              label={t('user:usermenu.setting.lbl-sound-effect')}
              max={1}
              min={0}
              step={0.01}
              value={audioState.soundEffectsVolume.value}
              onChange={(value: number) => {
                dispatchAction(AudioSettingAction.setSoundEffectsVolume({ value }))
              }}
            />

            <InputSlider
              icon={<Icon type={audioState.backgroundMusicVolume.value == 0 ? 'VolumeOff' : 'VolumeUp'} />}
              label={t('user:usermenu.setting.lbl-background-music-volume')}
              max={1}
              min={0}
              step={0.01}
              value={audioState.backgroundMusicVolume.value}
              onChange={(value: number) => {
                dispatchAction(AudioSettingAction.setMusicVolume({ value }))
              }}
            />
            {/* </>
            </Collapse> */}
          </>
        )}

        {/* Graphics Settings */}
        {selectedTab.value === 'graphics' && (
          <>
            <InputSlider
              icon={<Icon type="BlurLinear" sx={{ ml: '-3px' }} />}
              label={t('user:usermenu.setting.lbl-resolution')}
              max={5}
              min={1}
              step={1}
              value={rendererState.qualityLevel.value}
              sx={{ mt: 4 }}
              onChange={handleQualityLevelChange}
            />

            <InputGroup
              name="Shadow Map Resolution"
              label={t('editor:properties.directionalLight.lbl-shadowmapResolution')}
            >
              <SelectInput
                options={ShadowMapResolutionOptions}
                value={rendererState.shadowMapResolution.value}
                onChange={(resolution: number) => rendererState.shadowMapResolution.set(resolution)}
              />
            </InputGroup>

            <Grid container spacing={{ xs: 0, sm: 2 }}>
              <Grid item xs={12} sm={4}>
                <InputCheck
                  label={t('user:usermenu.setting.lbl-pp')}
                  checked={rendererState.usePostProcessing.value}
                  onChange={handlePostProcessingCheckbox}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <InputCheck
                  label={t('user:usermenu.setting.lbl-shadow')}
                  checked={rendererState.useShadows.value}
                  onChange={handleShadowCheckbox}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <InputCheck
                  label={t('user:usermenu.setting.lbl-automatic')}
                  checked={rendererState.automatic.value}
                  onChange={handleAutomaticCheckbox}
                />
              </Grid>
            </Grid>
          </>
        )}
      </Box>
    </Menu>
  )
}

export default SettingMenu
