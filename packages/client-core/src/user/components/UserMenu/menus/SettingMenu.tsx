import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useDispatch } from '@xrengine/client-core/src/store'
import { UserSetting } from '@xrengine/common/src/interfaces/User'
import { AvatarSettings } from '@xrengine/engine/src/avatar/AvatarControllerSystem'
import { AvatarInputAction, useAvatarInputState } from '@xrengine/engine/src/avatar/state/AvatarInputState'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { AvatarControllerType, AvatarMovementScheme } from '@xrengine/engine/src/input/enums/InputEnums'
import { dispatchLocal } from '@xrengine/engine/src/networking/functions/dispatchFrom'
import { EngineRendererAction, useEngineRendererState } from '@xrengine/engine/src/renderer/EngineRendererState'

import { BlurLinear, Mic, VolumeUp } from '@mui/icons-material'
import Checkbox from '@mui/material/Checkbox'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import Slider from '@mui/material/Slider'
import Typography from '@mui/material/Typography'

import { AuthService, useAuthState } from '../../../services/AuthService'
import styles from '../index.module.scss'

const SettingMenu = (): JSX.Element => {
  const { t } = useTranslation()
  const rendererState = useEngineRendererState()
  const avatarInputState = useAvatarInputState()
  const authState = useAuthState()
  const selfUser = authState.user
  const dispatch = useDispatch()
  const [userSettings, setUserSetting] = useState<UserSetting>(selfUser?.user_setting.value!)
  const [controlTypeSelected, setControlType] = React.useState(avatarInputState.controlType.value)
  const [controlSchemeSelected, setControlScheme] = React.useState(
    AvatarMovementScheme[AvatarSettings.instance.movementScheme]
  )
  const controllerTypes = Object.values(AvatarControllerType).filter((value) => typeof value === 'string')
  const controlSchemes = Object.values(AvatarMovementScheme).filter((value) => typeof value === 'string')
  const setUserSettings = (newSetting: any): void => {
    const setting = { ...userSettings, ...newSetting }
    setUserSetting(setting)
    AuthService.updateUserSettings(selfUser.user_setting.value?.id, setting)
  }

  const handleChangeControlType = (event: SelectChangeEvent) => {
    setControlType(event.target.value)
    dispatch(AvatarInputAction.setControlType(event.target.value))
  }

  const handleChangeControlScheme = (event: SelectChangeEvent) => {
    setControlScheme(event.target.value)
    AvatarSettings.instance.movementScheme = AvatarMovementScheme[event.target.value]
  }

  return (
    <div className={styles.menuPanel}>
      <div className={styles.settingPanel}>
        <section className={styles.settingSection}>
          <Typography variant="h4" className={styles.settingHeader}>
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
          <Typography variant="h4" className={styles.settingHeader}>
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
                dispatchLocal(EngineRendererAction.setQualityLevel(value))
                dispatchLocal(EngineRendererAction.setAutomatic(false))
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
                dispatchLocal(EngineRendererAction.setPostProcessing(value))
                dispatchLocal(EngineRendererAction.setAutomatic(false))
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
                dispatchLocal(EngineRendererAction.setShadows(value))
                dispatchLocal(EngineRendererAction.setAutomatic(false))
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
                dispatchLocal(EngineRendererAction.setAutomatic(value))
              }}
            />
          </div>
        </section>
        <section className={styles.settingSection}>
          <div className={styles.controlsContainer}>
            <Typography variant="h4" className={styles.settingHeader}>
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
                    <MenuItem
                      value={el}
                      key={el}
                      classes={{ root: styles.menuItem }}
                      disabled={!Engine.isHMD && el == 'Teleport'}
                    >
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
      </div>
    </div>
  )
}

export default SettingMenu
