import React, { useState } from 'react'
import { Mic, VolumeUp, BlurLinear } from '@mui/icons-material'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import Slider from '@mui/material/Slider'
import Typography from '@mui/material/Typography'
import styles from '../UserMenu.module.scss'
import { EngineRendererAction, useEngineRendererState } from '@xrengine/engine/src/renderer/EngineRendererState'
import { useTranslation } from 'react-i18next'
import { UserSetting } from '@xrengine/common/src/interfaces/User'
import { dispatchLocal } from '@xrengine/engine/src/networking/functions/dispatchFrom'
import { AuthService, useAuthState } from '../../../services/AuthService'

const SettingMenu = (): JSX.Element => {
  const { t } = useTranslation()
  const rendererState = useEngineRendererState()

  const authState = useAuthState()
  const selfUser = authState.user
  const [userSettings, setUserSetting] = useState<UserSetting>(selfUser?.user_setting.value!)

  const setUserSettings = (newSetting: any): void => {
    const setting = { ...userSettings, ...newSetting }
    setUserSetting(setting)
    AuthService.updateUserSettings(selfUser.user_setting.value?.id, setting)
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
      </div>
    </div>
  )
}

export default SettingMenu
