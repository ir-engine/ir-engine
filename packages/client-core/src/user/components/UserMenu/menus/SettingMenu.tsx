import React, { useLayoutEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import Button from '@xrengine/client-core/src/common/components/Button'
import InputCheck from '@xrengine/client-core/src/common/components/InputCheck'
import InputSelect, { InputMenuItem } from '@xrengine/client-core/src/common/components/InputSelect'
import InputSlider from '@xrengine/client-core/src/common/components/InputSlider'
import InputSwitch from '@xrengine/client-core/src/common/components/InputSwitch'
import Menu from '@xrengine/client-core/src/common/components/Menu'
import Tabs from '@xrengine/client-core/src/common/components/Tabs'
import Text from '@xrengine/client-core/src/common/components/Text'
import { AuthService, useAuthState } from '@xrengine/client-core/src/user/services/AuthService'
import { defaultThemeModes, defaultThemeSettings } from '@xrengine/common/src/constants/DefaultThemeSettings'
import capitalizeFirstLetter from '@xrengine/common/src/utils/capitalizeFirstLetter'
import { AudioSettingAction, useAudioState } from '@xrengine/engine/src/audio/AudioState'
import {
  AvatarControllerType,
  AvatarInputSettingsAction,
  AvatarInputSettingsState,
  AvatarMovementScheme
} from '@xrengine/engine/src/avatar/state/AvatarInputSettingsState'
import { isMobile } from '@xrengine/engine/src/common/functions/isMobile'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { EngineRendererAction, useEngineRendererState } from '@xrengine/engine/src/renderer/EngineRendererState'
import { XRState } from '@xrengine/engine/src/xr/XRState'
import { dispatchAction, getState, useHookstate } from '@xrengine/hyperflux'

import { BlurLinear, Mic, MicOff, VolumeOff, VolumeUp } from '@mui/icons-material'
import SurroundSoundIcon from '@mui/icons-material/SurroundSound'
import Collapse from '@mui/material/Collapse'
import Grid from '@mui/material/Grid'
import { SelectChangeEvent } from '@mui/material/Select'

import { useClientSettingState } from '../../../../admin/services/Setting/ClientSettingService'
import { userHasAccess } from '../../../userHasAccess'
import styles from '../index.module.scss'
import { Views } from '../util'

const chromeDesktop = !isMobile && /chrome/i.test(navigator.userAgent)

interface Props {
  isPopover?: boolean
  popoverWidthPx?: number
  changeActiveMenu?: (type: string | null) => void
}

const SettingMenu = ({ changeActiveMenu, isPopover, popoverWidthPx }: Props): JSX.Element => {
  const { t } = useTranslation()
  const rendererState = useEngineRendererState()
  const audioState = useAudioState()
  const avatarInputState = useHookstate(getState(AvatarInputSettingsState))
  const selfUser = useAuthState().user
  const controlScheme = avatarInputState.controlScheme.value
  const preferredHand = avatarInputState.preferredHand.value
  const invertRotationAndMoveSticks = avatarInputState.invertRotationAndMoveSticks.value
  const firstRender = useRef(true)
  const xrSupportedModes = useHookstate(getState(XRState).supportedSessionModes)
  const xrSupported = xrSupportedModes['immersive-ar'].value || xrSupportedModes['immersive-vr'].value
  const windowsPerformanceHelp = navigator.platform?.startsWith('Win')
  const controlSchemes = Object.values(AvatarMovementScheme).filter((value) => typeof value === 'string')
  const handOptions = ['left', 'right']
  const [openOtherAudioSettings, setOpenOtherAudioSettings] = useState(false)
  const [selectedTab, setSelectedTab] = React.useState('general')

  const clientSettingState = useClientSettingState()
  const [clientSetting] = clientSettingState?.client?.value || []
  const userSettings = selfUser.user_setting.value

  const world = Engine.instance.currentWorld

  const hasAdminAccess =
    selfUser?.id?.value?.length > 0 && selfUser?.scopes?.value?.find((scope) => scope.type === 'admin:admin')
  const hasEditorAccess = userHasAccess('editor:write')
  const themeModes = { ...defaultThemeModes, ...userSettings?.themeModes }
  const themeSettings = { ...defaultThemeSettings, ...clientSetting.themeSettings }

  const showWorldSettings = world.localClientEntity || Engine.instance.isEditor

  /**
   * Note: If you're editing this function, be sure to make the same changes to
   * the XRUI version over at packages/client-core/src/systems/ui/ProfileDetailView/index.tsx
   * @param event
   */
  const handleChangeUserThemeMode = (event) => {
    const { name, value } = event.target

    const settings = { ...userSettings, themeModes: { ...themeModes, [name]: value } }
    userSettings && AuthService.updateUserSettings(userSettings.id as string, settings)
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

  const handleChangeControlScheme = (event: SelectChangeEvent) => {
    dispatchAction(AvatarInputSettingsAction.setControlScheme({ scheme: event.target.value as any }))
  }

  const handleChangePreferredHand = (event: SelectChangeEvent) => {
    dispatchAction(AvatarInputSettingsAction.setPreferredHand({ handdedness: event.target.value as any }))
  }

  const handleTabChange = (newValue: string) => {
    setSelectedTab(newValue)
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
    } else if (mode === 'editor' && !hasEditorAccess) {
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

  const controlSchemesMenu: InputMenuItem[] = controlSchemes.map((el) => {
    return {
      label: el,
      value: el
    }
  })

  const handOptionsMenu: InputMenuItem[] = handOptions.map((el) => {
    return {
      label: el,
      value: el
    }
  })

  return (
    <Menu
      open
      showBackButton
      isPopover={isPopover}
      popoverWidthPx={popoverWidthPx}
      header={<Tabs value={selectedTab} items={settingTabs} onChange={handleTabChange} />}
      onBack={() => changeActiveMenu && changeActiveMenu(Views.Profile)}
      onClose={() => changeActiveMenu && changeActiveMenu(Views.Closed)}
    >
      <div className={styles.menuContent}>
        {selectedTab === 'general' && selfUser && (
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

                <InputSwitch
                  checked={invertRotationAndMoveSticks}
                  label={t('user:usermenu.setting.invert-rotation')}
                  sx={{ mb: 2 }}
                  onChange={handleChangeInvertRotationAndMoveSticks}
                />

                <Grid container spacing={{ xs: 0, sm: 2 }}>
                  <Grid item xs={12} sm={8}>
                    <InputSelect
                      label={t('user:usermenu.setting.lbl-control-scheme')}
                      value={controlScheme}
                      menu={controlSchemesMenu}
                      onChange={handleChangeControlScheme}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <InputSelect
                      label={t('user:usermenu.setting.lbl-preferred-hand')}
                      value={preferredHand}
                      menu={handOptionsMenu}
                      onChange={handleChangePreferredHand}
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

        {selectedTab === 'audio' && (
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

            <InputSlider
              icon={audioState.masterVolume.value == 0 ? <VolumeOff /> : <VolumeUp />}
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
              icon={audioState.microphoneGain.value == 0 ? <MicOff /> : <Mic />}
              label={t('user:usermenu.setting.lbl-microphone')}
              max={1}
              min={0}
              step={0.01}
              value={audioState.microphoneGain.value}
              onChange={(value: number) => {
                dispatchAction(AudioSettingAction.setMicrophoneVolume({ value }))
              }}
            />

            <Button
              type="expander"
              open={openOtherAudioSettings}
              sx={{ justifyContent: 'center', margin: 1.5 }}
              onClick={() => setOpenOtherAudioSettings(!openOtherAudioSettings)}
            >
              {t('user:usermenu.setting.other-audio-setting')}
            </Button>

            <Collapse in={openOtherAudioSettings} timeout="auto" unmountOnExit>
              <>
                <InputCheck
                  type="wide"
                  icon={<SurroundSoundIcon />}
                  label={t('user:usermenu.setting.use-positional-media')}
                  checked={audioState.usePositionalMedia.value}
                  onChange={(value: boolean) => {
                    dispatchAction(AudioSettingAction.setUsePositionalMedia({ value }))
                  }}
                />

                <InputSlider
                  icon={audioState.mediaStreamVolume.value == 0 ? <VolumeOff /> : <VolumeUp />}
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
                  icon={audioState.notificationVolume.value == 0 ? <VolumeOff /> : <VolumeUp />}
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
                  icon={audioState.soundEffectsVolume.value == 0 ? <VolumeOff /> : <VolumeUp />}
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
                  icon={audioState.backgroundMusicVolume.value == 0 ? <VolumeOff /> : <VolumeUp />}
                  label={t('user:usermenu.setting.lbl-background-music-volume')}
                  max={1}
                  min={0}
                  step={0.01}
                  value={audioState.backgroundMusicVolume.value}
                  onChange={(value: number) => {
                    dispatchAction(AudioSettingAction.setMusicVolume({ value }))
                  }}
                />
              </>
            </Collapse>
          </>
        )}

        {/* Graphics Settings */}
        {selectedTab === 'graphics' && (
          <>
            <InputSlider
              icon={<BlurLinear sx={{ ml: '-3px' }} />}
              label={t('user:usermenu.setting.lbl-resolution')}
              max={1}
              min={5}
              step={1}
              value={rendererState.qualityLevel.value}
              sx={{ mt: 4 }}
              onChange={(value: number) => {
                dispatchAction(EngineRendererAction.setQualityLevel({ qualityLevel: value }))
                dispatchAction(EngineRendererAction.setAutomatic({ automatic: false }))
              }}
            />

            <Grid container spacing={{ xs: 0, sm: 2 }}>
              <Grid item xs={12} sm={4}>
                <InputCheck
                  label={t('user:usermenu.setting.lbl-pp')}
                  checked={rendererState.usePostProcessing.value}
                  disabled={!Engine.instance.currentWorld.sceneJson?.metadata?.postprocessing}
                  onChange={(value: boolean) => {
                    dispatchAction(EngineRendererAction.setPostProcessing({ usePostProcessing: value }))
                    dispatchAction(EngineRendererAction.setAutomatic({ automatic: false }))
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <InputCheck
                  label={t('user:usermenu.setting.lbl-shadow')}
                  checked={rendererState.useShadows.value}
                  onChange={(value: boolean) => {
                    dispatchAction(EngineRendererAction.setShadows({ useShadows: value }))
                    dispatchAction(EngineRendererAction.setAutomatic({ automatic: false }))
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <InputCheck
                  label={t('user:usermenu.setting.lbl-automatic')}
                  checked={rendererState.automatic.value}
                  onChange={(value: boolean) => {
                    dispatchAction(EngineRendererAction.setAutomatic({ automatic: value }))
                  }}
                />
              </Grid>
            </Grid>
          </>
        )}
      </div>
    </Menu>
  )
}

export default SettingMenu
