import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { AuthService, useAuthState } from '@xrengine/client-core/src/user/services/AuthService'
import { defaultThemeModes, defaultThemeSettings } from '@xrengine/common/src/constants/DefaultThemeSettings'
import capitalizeFirstLetter from '@xrengine/common/src/utils/capitalizeFirstLetter'
import { AudioSettingAction, useAudioState } from '@xrengine/engine/src/audio/AudioState'
import { AudioEffectPlayer } from '@xrengine/engine/src/audio/systems/MediaSystem'
import { updateMap } from '@xrengine/engine/src/avatar/AvatarControllerSystem'
import { AvatarComponent } from '@xrengine/engine/src/avatar/components/AvatarComponent'
import {
  AvatarInputSettingsAction,
  AvatarInputSettingsState
} from '@xrengine/engine/src/avatar/state/AvatarInputSettingsState'
import { isMobile } from '@xrengine/engine/src/common/functions/isMobile'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { AvatarControllerType, AvatarMovementScheme } from '@xrengine/engine/src/input/enums/InputEnums'
import { EngineRendererAction, useEngineRendererState } from '@xrengine/engine/src/renderer/EngineRendererState'
import { EngineRenderer } from '@xrengine/engine/src/renderer/WebGLRendererSystem'
import { XRState } from '@xrengine/engine/src/xr/XRState'
import { dispatchAction, getState, useHookstate } from '@xrengine/hyperflux'

import { BlurLinear, Mic, MicOff, VolumeOff, VolumeUp } from '@mui/icons-material'
import ArrowBack from '@mui/icons-material/ArrowBack'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import SurroundSoundIcon from '@mui/icons-material/SurroundSound'
import Box from '@mui/material/Box'
import Checkbox from '@mui/material/Checkbox'
import Collapse from '@mui/material/Collapse'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import Slider from '@mui/material/Slider'
import Switch from '@mui/material/Switch'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Typography from '@mui/material/Typography'

import InputSelect, { InputMenuItem } from '../../../../admin/common/InputSelect'
import { useClientSettingState } from '../../../../admin/services/Setting/ClientSettingService'
import { userHasAccess } from '../../../userHasAccess'
import styles from '../index.module.scss'
import { Views } from '../util'

const chromeDesktop = !isMobile && /chrome/i.test(navigator.userAgent)

interface Props {
  isPopover?: boolean
  changeActiveMenu?: (type: string | null) => void
}

const SettingMenu = ({ changeActiveMenu, isPopover }: Props): JSX.Element => {
  const { t } = useTranslation()
  const rendererState = useEngineRendererState()
  const audioState = useAudioState()
  const avatarInputState = useHookstate(getState(AvatarInputSettingsState))
  const selfUser = useAuthState().user
  const controlScheme = avatarInputState.controlScheme.value
  const invertRotationAndMoveSticks = avatarInputState.invertRotationAndMoveSticks.value
  const showAvatar = avatarInputState.showAvatar.value
  const firstRender = useRef(true)
  const xrSupportedModes = useHookstate(getState(XRState).supportedSessionModes)
  const xrSupported = xrSupportedModes['immersive-ar'].value || xrSupportedModes['immersive-vr'].value
  const windowsPerformanceHelp = navigator.platform?.startsWith('Win')
  const controllerTypes = Object.values(AvatarControllerType).filter((value) => typeof value === 'string')
  const controlSchemes = Object.values(AvatarMovementScheme).filter((value) => typeof value === 'string')
  // const [open, setOpen] = useState(false)
  const [openOtherAudioSettings, setOpenOtherAudioSettings] = useState(false)
  const [selectedTab, setSelectedTab] = React.useState('general')

  const clientSettingState = useClientSettingState()
  const [clientSetting] = clientSettingState?.client?.value || []
  const userSettings = selfUser.user_setting.value

  const hasAdminAccess =
    selfUser?.id?.value?.length > 0 && selfUser?.scopes?.value?.find((scope) => scope.type === 'admin:admin')
  const hasEditorAccess = userHasAccess('editor:write')
  const themeModes = { ...defaultThemeModes, ...userSettings?.themeModes }
  const themeSettings = { ...defaultThemeSettings, ...clientSetting.themeSettings }

  const showWorldSettings = Engine.instance.currentWorld.localClientEntity || Engine.instance.isEditor

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

  const handleChangeControlType = (event: SelectChangeEvent) => {
    dispatchAction(AvatarInputSettingsAction.setControlType({ controlType: event.target.value as any }))
  }

  const handleChangeControlScheme = (event: SelectChangeEvent) => {
    dispatchAction(AvatarInputSettingsAction.setControlScheme({ scheme: event.target.value as any }))
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setSelectedTab(newValue)
  }

  return (
    <div className={isPopover ? styles.profilePanelRoot : styles.menuPanel}>
      <div className={styles.settingPanel}>
        <div className={styles.headerBlock}>
          {changeActiveMenu && (
            <button type="button" className={styles.iconBlock} onClick={() => changeActiveMenu(Views.Profile)}>
              <ArrowBack />
            </button>
          )}

          <Tabs className={styles.tabsPanel} value={selectedTab} onChange={handleTabChange} variant="fullWidth">
            <Tab value="general" label={t('user:usermenu.setting.general')} />
            {showWorldSettings && <Tab value="audio" label={t('user:usermenu.setting.audio')} />}
            {showWorldSettings && <Tab value="graphics" label={t('user:usermenu.setting.graphics')} />}
          </Tabs>
        </div>

        <div className={styles.tabsContent}>
          {selectedTab === 'general' && selfUser && (
            <>
              <section className={styles.settingSection}>
                <Typography variant="h5" className={styles.settingHeader}>
                  {t('user:usermenu.setting.themes')}
                </Typography>

                <div className={styles.themeSettingContainer}>
                  <Grid container spacing={{ xs: 0, sm: 2 }} sx={{ mt: 2 }}>
                    {accessibleThemeModes.map((mode, index) => (
                      <Grid key={index} item xs={12} md={4}>
                        <InputSelect
                          name={mode}
                          label={`${t(`user:usermenu.setting.${mode}`)} ${t('user:usermenu.setting.theme')}`}
                          value={themeModes[mode]}
                          menu={colorModesMenu}
                          onChange={(e) => handleChangeUserThemeMode(e)}
                          onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
                          onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </div>
              </section>

              {/* <section className={styles.settingSection}>
          <Typography variant="h5" className={styles.settingHeader}>
            {t('user:usermenu.setting.user-avatar')}
          </Typography>
          <FormControlLabel
            label={t('user:usermenu.setting.show-avatar')}
            labelPlacement="start"
            control={
              <Switch
              checked={showAvatar}
              onChange={handleChangeShowAvatar}
              onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
              onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
              className={styles.iconBtn}
              />
            }
          />
        </section> */}
              {xrSupported && showWorldSettings && (
                <section className={styles.settingSection}>
                  <Typography variant="h5" className={styles.settingHeader}>
                    {t('user:usermenu.setting.xrusersetting')}
                  </Typography>
                  {/*
              <div className={styles.sectionBar}>
              <IconButton
                className={styles.collapseBtn}
                aria-label="expand"
                size="small"
                onClick={() => setOpen(!open)}
              >
                {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
              </IconButton>
            </div> */}
                  <FormControlLabel
                    control={
                      <Switch
                        checked={invertRotationAndMoveSticks}
                        onChange={handleChangeInvertRotationAndMoveSticks}
                        className={styles.iconBtn}
                      />
                    }
                    label={t('user:usermenu.setting.invert-rotation')}
                  />
                  <div className={styles.controlsContainer}>
                    <Typography variant="h6" className={styles.settingHeader}>
                      {t('user:usermenu.setting.controls')}
                    </Typography>
                    <div className={styles.selectSize}>
                      <FormControl fullWidth>
                        <InputLabel>{t('user:usermenu.setting.lbl-control-scheme')}</InputLabel>
                        <Select
                          value={controlScheme}
                          onChange={handleChangeControlScheme}
                          size="small"
                          classes={{
                            select: styles.select
                          }}
                          MenuProps={{ classes: { paper: styles.paper } }}
                        >
                          {controlSchemes.map((el) => (
                            <MenuItem value={el} key={el} classes={{ root: styles.menuItem }}>
                              {el}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </div>
                    {/* <div className={styles.selectSize}>
                <FormControl fullWidth>
                  <InputLabel>{t('user:usermenu.setting.lbl-control-type')}</InputLabel>
                  <Select
                    value={controlTypeSelected}
                    onChange={handleChangeControlType}
                    size="small"
                    classes={{
                      select: styles.select
                    }}
                    MenuProps={{ classes: { paper: styles.paper } }}
                  >
                    {controllerTypes.map((el, index) => (
                      <MenuItem value={el} key={el + index} classes={{ root: styles.menuItem }}>
                        {el}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div> */}
                  </div>
                  {/* <Collapse in={open} timeout="auto" unmountOnExit>
              <Box margin={1}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell classes={{ root: styles.tableRow }}>{t('user:usermenu.setting.rotation')}</TableCell>
                      <TableCell classes={{ root: styles.tableRow }}>
                        {t('user:usermenu.setting.rotation-angle')}
                      </TableCell>
                      <TableCell align="right" classes={{ root: styles.tableRow }}>
                        {t('user:usermenu.setting.rotation-smooth-speed')}
                      </TableCell>
                      <TableCell align="right" classes={{ root: styles.tableRow }}>
                        {t('user:usermenu.setting.moving')}
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell align="center" classes={{ root: styles.tableRow }} component="th" scope="row">
                        {avatarInputState.rotation.value}
                      </TableCell>
                      <TableCell align="center" classes={{ root: styles.tableRow }}>
                        {avatarInputState.rotationAngle.value}
                      </TableCell>
                      <TableCell align="center" classes={{ root: styles.tableRow }}>
                        {avatarInputState.rotationSmoothSpeed.value}
                      </TableCell>
                      <TableCell align="center" classes={{ root: styles.tableRow }}>
                        {avatarInputState.moving.value}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Box>
            </Collapse> */}
                </section>
              )}

              {/* Controls Helptext */}
              {showWorldSettings && (
                <section className={styles.settingSection}>
                  <Typography variant="h5" className={styles.settingHeader}>
                    {t('user:usermenu.setting.controls')}
                  </Typography>
                  {!isMobile && !xrSupported && (
                    <>
                      <div className={`${styles.row} ${styles.tutorialImage}`}>
                        <img src="/static/Desktop_Tutorial.png" alt="Desktop Controls" />
                      </div>
                      <div className={`${styles.row} ${styles.tutorialImage}`}>
                        <img src="/static/Controller_Tutorial.png" alt="Controller Controls" />
                      </div>
                    </>
                  )}
                  {isMobile && (
                    <div className={`${styles.row} ${styles.tutorialImage}`}>
                      <img src="/static/Mobile_Tutorial.png" alt="Mobile Controls" />
                    </div>
                  )}
                  {xrSupported && (
                    <div className={`${styles.row} ${styles.tutorialImage}`}>
                      <img src="/static/XR_Tutorial.png" alt="XR Controls" />
                    </div>
                  )}
                </section>
              )}

              {/* Windows-specific Graphics/Performance Optimization Helptext */}
              {windowsPerformanceHelp && showWorldSettings && (
                <section className={styles.settingSection}>
                  <Typography variant="h5" className={styles.settingHeader}>
                    {t('user:usermenu.setting.windowsPerformanceHelp')}
                  </Typography>
                  <div className={styles.row}>
                    <p>
                      If you're experiencing performance issues, and you're running on a machine with Nvidia graphics,
                      try the following.
                    </p>
                  </div>
                  <div className={styles.row}>
                    <p>Open the Nvidia Control Panel, select Chrome, make sure "High Performance" is selected.</p>
                  </div>
                  <div className={styles.row}>
                    <img src="/static/Nvidia_control_panel1.png" alt="Nvidia Control Panel" />
                  </div>
                  <div className={styles.row}>
                    <p>In settings for Windows 10/11, search for the 'Graphics' preference on AMD/Nvidia for Chrome.</p>
                  </div>
                  <div className={styles.row}>
                    <img src="/static/Nvidia_windows_prefs.png" alt="Nvidia Windows Preferences" />
                  </div>
                </section>
              )}
            </>
          )}

          {selectedTab === 'audio' && (
            <section className={styles.settingSection}>
              {chromeDesktop && (
                <p style={{ textAlign: 'center', marginBottom: '20px' }}>
                  {t('user:usermenu.setting.chromeAEC')}
                  <br />
                  <b>
                    <u>chrome://flags/#chrome-wide-echo-cancellation</u>
                  </b>
                </p>
              )}

              <div className={styles.row}>
                <span className={styles.materialIconBlock}>
                  {audioState.masterVolume.value == 0 ? (
                    <VolumeOff className={styles.iconBtn} />
                  ) : (
                    <VolumeUp className={styles.iconBtn} />
                  )}
                </span>
                <span className={styles.settingLabel}>{t('user:usermenu.setting.lbl-volume')}</span>
                <Slider
                  value={audioState.masterVolume.value}
                  onChange={(_, value: number) => {
                    dispatchAction(AudioSettingAction.setMasterVolume({ value }))
                  }}
                  onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
                  onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
                  className={styles.slider}
                  max={1}
                  step={0.01}
                  min={0}
                />
              </div>
              <div className={styles.row}>
                <span className={styles.materialIconBlock}>
                  {audioState.microphoneGain.value == 0 ? (
                    <MicOff className={styles.iconBtn} />
                  ) : (
                    <Mic className={styles.iconBtn} />
                  )}
                </span>
                <span className={styles.settingLabel}>{t('user:usermenu.setting.lbl-microphone')}</span>
                <Slider
                  value={audioState.microphoneGain.value}
                  onChange={(_, value: number) => {
                    dispatchAction(AudioSettingAction.setMicrophoneVolume({ value }))
                  }}
                  className={styles.slider}
                  max={1}
                  step={0.01}
                  min={0}
                  onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
                  onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
                />
              </div>
              <section className={styles.settingSection}>
                <div className={styles.row}>
                  <div className={styles.settingHeader}>{t('user:usermenu.setting.other-audio-setting')}</div>
                  <IconButton
                    className={styles.collapseBtn}
                    aria-label="expand"
                    size="small"
                    onClick={() => setOpenOtherAudioSettings(!openOtherAudioSettings)}
                    onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
                    onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
                  >
                    {openOtherAudioSettings ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                  </IconButton>
                </div>
                <Collapse in={openOtherAudioSettings} timeout="auto" unmountOnExit>
                  <Box margin={1}>
                    <div className={styles.row}>
                      <span className={styles.materialIconBlock}>
                        <SurroundSoundIcon />
                      </span>
                      <span className={styles.settingLabel}>{t('user:usermenu.setting.use-positional-media')}</span>
                      <Checkbox
                        className={styles.checkboxBlock}
                        checked={audioState.usePositionalMedia.value}
                        onChange={(_, value: boolean) => {
                          dispatchAction(AudioSettingAction.setUsePositionalMedia({ value }))
                        }}
                        onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
                        onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
                        size="small"
                      />
                    </div>
                    <div className={styles.row}>
                      <span className={styles.materialIconBlock}>
                        {audioState.mediaStreamVolume.value == 0 ? (
                          <VolumeOff className={styles.iconBtn} />
                        ) : (
                          <VolumeUp className={styles.iconBtn} />
                        )}
                      </span>
                      <span className={styles.settingLabel}>{t('user:usermenu.setting.lbl-media-instance')}</span>
                      <Slider
                        value={audioState.mediaStreamVolume.value}
                        onChange={(_, value: number) => {
                          dispatchAction(AudioSettingAction.setMediaStreamVolume({ value }))
                        }}
                        onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
                        onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
                        className={styles.slider}
                        max={1}
                        step={0.01}
                        min={0}
                      />
                    </div>
                    <div className={styles.row}>
                      <span className={styles.materialIconBlock}>
                        {audioState.notificationVolume.value == 0 ? (
                          <VolumeOff className={styles.iconBtn} />
                        ) : (
                          <VolumeUp className={styles.iconBtn} />
                        )}
                      </span>
                      <span className={styles.settingLabel}>{t('user:usermenu.setting.lbl-notification')}</span>
                      <Slider
                        value={audioState.notificationVolume.value}
                        onChange={(_, value: number) => {
                          dispatchAction(AudioSettingAction.setNotificationVolume({ value }))
                        }}
                        onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
                        onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
                        className={styles.slider}
                        max={1}
                        step={0.01}
                        min={0}
                      />
                    </div>
                    <div className={styles.row}>
                      <span className={styles.materialIconBlock}>
                        {audioState.soundEffectsVolume.value == 0 ? (
                          <VolumeOff className={styles.iconBtn} />
                        ) : (
                          <VolumeUp className={styles.iconBtn} />
                        )}
                      </span>
                      <span className={styles.settingLabel}>{t('user:usermenu.setting.lbl-sound-effect')}</span>
                      <Slider
                        value={audioState.soundEffectsVolume.value}
                        onChange={(_, value: number) => {
                          dispatchAction(AudioSettingAction.setSoundEffectsVolume({ value }))
                        }}
                        onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
                        onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
                        className={styles.slider}
                        max={1}
                        step={0.01}
                        min={0}
                      />
                    </div>
                    <div className={styles.row}>
                      <span className={styles.materialIconBlock}>
                        {audioState.backgroundMusicVolume.value == 0 ? (
                          <VolumeOff className={styles.iconBtn} />
                        ) : (
                          <VolumeUp className={styles.iconBtn} />
                        )}
                      </span>
                      <span className={styles.settingLabel}>
                        {t('user:usermenu.setting.lbl-background-music-volume')}
                      </span>
                      <Slider
                        value={audioState.backgroundMusicVolume.value}
                        onChange={(_, value: number) => {
                          dispatchAction(AudioSettingAction.setMusicVolume({ value }))
                        }}
                        onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
                        onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
                        className={styles.slider}
                        max={1}
                        step={0.01}
                        min={0}
                      />
                    </div>
                  </Box>
                </Collapse>
              </section>
            </section>
          )}

          {/* Graphics Settings */}
          {selectedTab === 'graphics' && (
            <section className={styles.settingSection}>
              <div style={{ height: '30px' }} />
              <div className={styles.row}>
                <span className={styles.materialIconBlock}>
                  <BlurLinear className={styles.iconBtn} />
                </span>
                <span className={styles.settingLabel}>{t('user:usermenu.setting.lbl-resolution')}</span>
                <Slider
                  value={rendererState.qualityLevel.value}
                  onChange={(_, value: number) => {
                    dispatchAction(EngineRendererAction.setQualityLevel({ qualityLevel: value }))
                    dispatchAction(EngineRendererAction.setAutomatic({ automatic: false }))
                  }}
                  onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
                  onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
                  className={styles.slider}
                  min={1}
                  max={5}
                  step={1}
                />
              </div>
              <div className={styles.row}>
                <FormControlLabel
                  className={styles.checkboxBlock}
                  disabled={!Engine.instance.currentWorld.sceneJson?.metadata?.postprocessing}
                  control={<Checkbox checked={rendererState.usePostProcessing.value} size="small" />}
                  label={t('user:usermenu.setting.lbl-pp') as string}
                  onChange={(_, value) => {
                    dispatchAction(EngineRendererAction.setPostProcessing({ usePostProcessing: value }))
                    dispatchAction(EngineRendererAction.setAutomatic({ automatic: false }))
                  }}
                  onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
                  onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
                />
                {/* <FormControlLabel
              className={styles.checkboxBlock}
              control={<Checkbox checked={props.graphics.pbr} size="small" />}
              label={t('user:usermenu.setting.lbl-pbr')}
              onChange={(_, value) => {
                props.setGraphicsSettings({
                  pbr: value
                })
              }}
            /> */}
                <FormControlLabel
                  className={styles.checkboxBlock}
                  control={<Checkbox checked={rendererState.useShadows.value} size="small" />}
                  label={t('user:usermenu.setting.lbl-shadow') as string}
                  onChange={(_, value) => {
                    dispatchAction(EngineRendererAction.setShadows({ useShadows: value }))
                    dispatchAction(EngineRendererAction.setAutomatic({ automatic: false }))
                  }}
                  onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
                  onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
                />
                <FormControlLabel
                  className={styles.checkboxBlock}
                  control={<Checkbox checked={rendererState.automatic.value} size="small" />}
                  label={t('user:usermenu.setting.lbl-automatic') as string}
                  onChange={(_, value) => {
                    dispatchAction(EngineRendererAction.setAutomatic({ automatic: value }))
                  }}
                  onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
                  onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
                />
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}

export default SettingMenu
