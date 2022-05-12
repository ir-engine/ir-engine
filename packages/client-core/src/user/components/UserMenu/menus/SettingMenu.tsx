import React, { useLayoutEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useDispatch } from '@xrengine/client-core/src/store'
import { UserSetting } from '@xrengine/common/src/interfaces/User'
import { AvatarSettings, updateMap } from '@xrengine/engine/src/avatar/AvatarControllerSystem'
import {
  AvatarInputSettingsAction,
  useAvatarInputSettingsState
} from '@xrengine/engine/src/avatar/state/AvatarInputSettingsState'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { EngineActions, useEngineState } from '@xrengine/engine/src/ecs/classes/EngineState'
import { AvatarControllerType, AvatarMovementScheme } from '@xrengine/engine/src/input/enums/InputEnums'
import { EngineRendererAction, useEngineRendererState } from '@xrengine/engine/src/renderer/EngineRendererState'
import { dispatchAction } from '@xrengine/hyperflux'

import { BlurLinear, Mic, VolumeUp } from '@mui/icons-material'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import Box from '@mui/material/Box'
import Checkbox from '@mui/material/Checkbox'
import Collapse from '@mui/material/Collapse'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import IconButton from '@mui/material/IconButton'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import Slider from '@mui/material/Slider'
import Switch from '@mui/material/Switch'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'

import { AuthService, useAuthState } from '../../../services/AuthService'
import styles from '../index.module.scss'

const SettingMenu = (): JSX.Element => {
  const { t } = useTranslation()
  const rendererState = useEngineRendererState()
  const avatarInputState = useAvatarInputSettingsState()
  const authState = useAuthState()
  const selfUser = authState.user
  const dispatch = useDispatch()
  const [userSettings, setUserSetting] = useState<UserSetting>(selfUser?.user_setting.value!)
  const [controlTypeSelected, setControlType] = useState(avatarInputState.controlType.value)
  const [controlSchemeSelected, setControlScheme] = useState(
    AvatarMovementScheme[AvatarSettings.instance.movementScheme]
  )
  const [invertRotationAndMoveSticks, setInvertRotationAndMoveSticksState] = useState(
    avatarInputState.invertRotationAndMoveSticks.value
  )
  const firstRender = useRef(true)
  const engineState = useEngineState()
  const controllerTypes = Object.values(AvatarControllerType).filter((value) => typeof value === 'string')
  const controlSchemes = Object.values(AvatarMovementScheme).filter((value) => typeof value === 'string')
  const setUserSettings = (newSetting: any): void => {
    const setting = { ...userSettings, ...newSetting }
    setUserSetting(setting)
    AuthService.updateUserSettings(selfUser.user_setting.value?.id, setting)
  }
  const [open, setOpen] = useState(false)
  const handleChangeInvertRotationAndMoveSticks = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInvertRotationAndMoveSticksState((prev) => !prev)
    dispatchAction(
      Engine.instance.store,
      AvatarInputSettingsAction.setInvertRotationAndMoveSticks(!invertRotationAndMoveSticks)
    )
  }

  useLayoutEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    updateMap()
  }, [avatarInputState.invertRotationAndMoveSticks])

  const handleChangeControlType = (event: SelectChangeEvent) => {
    setControlType(event.target.value as any)
    dispatchAction(Engine.instance.store, AvatarInputSettingsAction.setControlType(event.target.value as any))
  }

  const handleChangeControlScheme = (event: SelectChangeEvent) => {
    setControlScheme(event.target.value)
    AvatarSettings.instance.movementScheme = AvatarMovementScheme[event.target.value]
  }

  return (
    <div className={styles.menuPanel}>
      <div className={styles.settingPanel}>
        <section className={styles.settingSection}>
          <Typography variant="h6" className={styles.settingHeader}>
            {t('user:usermenu.setting.audio')}
          </Typography>
          <div className={styles.row}>
            <span className={styles.materialIconBlock}>
              <VolumeUp color="primary" />
            </span>
            <span className={styles.settingLabel}>{t('user:usermenu.setting.lbl-volume')}</span>
            <Slider
              value={userSettings?.volume == null ? 100 : userSettings?.volume}
              onChange={(_, value: number) => {
                setUserSettings({ volume: value })
                const mediaElements = document.querySelectorAll<HTMLMediaElement>('video, audio')
                for (let i = 0; i < mediaElements.length; i++) {
                  mediaElements[i].volume = (value as number) / 100
                }
              }}
              className={styles.slider}
              max={100}
              min={0}
            />
          </div>
          <div className={styles.row}>
            <span className={styles.materialIconBlock}>
              <Mic color="primary" />
            </span>
            <span className={styles.settingLabel}>{t('user:usermenu.setting.lbl-microphone')}</span>
            <Slider
              value={userSettings?.microphone == null ? 100 : userSettings?.microphone}
              onChange={(_, value: number) => {
                setUserSettings({ microphone: value })
              }}
              className={styles.slider}
              max={100}
              min={0}
            />
          </div>
        </section>
        <section className={styles.settingSection}>
          <Typography variant="h6" className={styles.settingHeader}>
            {t('user:usermenu.setting.graphics')}
          </Typography>
          <div className={styles.row}>
            <span className={styles.materialIconBlock}>
              <BlurLinear color="primary" />
            </span>
            <span className={styles.settingLabel}>{t('user:usermenu.setting.lbl-resolution')}</span>
            <Slider
              value={rendererState.qualityLevel.value}
              onChange={(_, value: number) => {
                dispatchAction(Engine.instance.store, EngineRendererAction.setQualityLevel(value))
                dispatchAction(Engine.instance.store, EngineRendererAction.setAutomatic(false))
              }}
              className={styles.slider}
              min={1}
              max={5}
              step={1}
            />
          </div>
          <div className={`${styles.row} ${styles.FlexWrap}`}>
            <FormControlLabel
              className={styles.checkboxBlock}
              control={<Checkbox checked={rendererState.usePostProcessing.value} size="small" />}
              label={t('user:usermenu.setting.lbl-pp') as string}
              onChange={(_, value) => {
                dispatchAction(Engine.instance.store, EngineRendererAction.setPostProcessing(value))
                dispatchAction(Engine.instance.store, EngineRendererAction.setAutomatic(false))
              }}
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
                dispatchAction(Engine.instance.store, EngineRendererAction.setShadows(value))
                dispatchAction(Engine.instance.store, EngineRendererAction.setAutomatic(false))
              }}
            />
          </div>
          <div className={`${styles.row} ${styles.automatic}`}>
            <FormControlLabel
              className={styles.checkboxBlock}
              control={<Checkbox checked={rendererState.automatic.value} size="small" />}
              label={t('user:usermenu.setting.lbl-automatic') as string}
              labelPlacement="start"
              onChange={(_, value) => {
                dispatchAction(Engine.instance.store, EngineRendererAction.setAutomatic(value))
              }}
            />
          </div>
        </section>
        {engineState.xrSupported.value && (
          <>
            <section className={styles.settingSection}>
              <div className={styles.sectionBar}>
                <Typography variant="h6" className={styles.settingHeader}>
                  {t('user:usermenu.setting.xrusersetting')}
                </Typography>
                <IconButton
                  className={styles.collapseBtn}
                  aria-label="expand"
                  size="small"
                  onClick={() => setOpen(!open)}
                >
                  {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                </IconButton>
                <FormControlLabel
                  control={
                    <Switch
                      checked={invertRotationAndMoveSticks}
                      onChange={handleChangeInvertRotationAndMoveSticks}
                      color="primary"
                    />
                  }
                  label="Invert Rotation And Move Sticks"
                />
              </div>
              <Collapse in={open} timeout="auto" unmountOnExit>
                <Box margin={1}>
                  <Table size="small" aria-label="purchases">
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
              </Collapse>
            </section>
            <section className={styles.settingSection}>
              <div className={styles.controlsContainer}>
                <Typography variant="h6" className={styles.settingHeader}>
                  {t('user:usermenu.setting.controls')}
                </Typography>
                <div className={styles.selectSize}>
                  <FormControl fullWidth>
                    <InputLabel>{t('user:usermenu.setting.lbl-control-scheme')}</InputLabel>
                    <Select
                      value={controlSchemeSelected}
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
                <div className={styles.selectSize}>
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
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  )
}

export default SettingMenu
