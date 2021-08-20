import React from 'react'
import { Mic, VolumeUp, BlurLinear, CropOriginal } from '@material-ui/icons'
import Checkbox from '@material-ui/core/Checkbox'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Slider from '@material-ui/core/Slider'
import Typography from '@material-ui/core/Typography'
import styles from '../UserMenu.module.scss'
import { EngineRenderer } from '@xrengine/engine/src/renderer/WebGLRendererSystem'
import { EngineEvents } from '@xrengine/engine/src/ecs/classes/EngineEvents'
import { useTranslation } from 'react-i18next'

const SettingMenu = (props: any): JSX.Element => {
  const { t } = useTranslation()
  return (
    <div className={styles.menuPanel}>
      <div className={styles.settingPanel}>
        <section className={styles.settingSection}>
          <Typography variant="h2" className={styles.settingHeader}>
            {t('user:usermenu.setting.audio')}
          </Typography>
          <div className={styles.row}>
            <span className={styles.materialIconBlock}>
              <VolumeUp color="primary" />
            </span>
            <span className={styles.settingLabel}>{t('user:usermenu.setting.lbl-volume')}</span>
            <Slider
              value={props.setting?.audio == null ? 100 : props.setting?.audio}
              onChange={(_, value) => {
                props.setUserSettings({ audio: value })
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
              value={props.setting?.microphone == null ? 100 : props.setting?.microphone}
              onChange={(_, value) => {
                props.setUserSettings({ microphone: value })
              }}
              className={styles.slider}
              max={100}
              min={0}
            />
          </div>
        </section>
        <section className={styles.settingSection}>
          <Typography variant="h2" className={styles.settingHeader}>
            {t('user:usermenu.setting.graphics')}
          </Typography>
          <div className={styles.row}>
            <span className={styles.materialIconBlock}>
              <BlurLinear color="primary" />
            </span>
            <span className={styles.settingLabel}>{t('user:usermenu.setting.lbl-resolution')}</span>
            <Slider
              value={props.graphics.resolution}
              onChange={(_, value) => {
                props.setGraphicsSettings({
                  resolution: value,
                  automatic: false
                })
                EngineEvents.instance.dispatchEvent({ type: EngineRenderer.EVENTS.SET_RESOLUTION, payload: value })
                EngineEvents.instance.dispatchEvent({
                  type: EngineRenderer.EVENTS.SET_USE_AUTOMATIC,
                  payload: false
                })
              }}
              className={styles.slider}
              min={0.25}
              max={1}
              step={0.125}
            />
          </div>
          <div className={`${styles.row} ${styles.flexWrap}`}>
            <FormControlLabel
              className={styles.checkboxBlock}
              control={<Checkbox checked={props.graphics.postProcessing} size="small" />}
              label={t('user:usermenu.setting.lbl-pp')}
              onChange={(_, value) => {
                props.setGraphicsSettings({
                  postProcessing: value,
                  automatic: false
                })
                EngineEvents.instance.dispatchEvent({
                  type: EngineRenderer.EVENTS.SET_POST_PROCESSING,
                  payload: value
                })
                EngineEvents.instance.dispatchEvent({
                  type: EngineRenderer.EVENTS.SET_USE_AUTOMATIC,
                  payload: false
                })
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
              control={<Checkbox checked={props.graphics.pbr} size="small" />}
              label={t('user:usermenu.setting.lbl-shadow')}
              onChange={(_, value) => {
                props.setGraphicsSettings({
                  pbr: value
                })
                EngineEvents.instance.dispatchEvent({
                  type: EngineRenderer.EVENTS.USE_SHADOWS,
                  payload: value
                })
              }}
            />
          </div>
          <div className={`${styles.row} ${styles.automatic}`}>
            <FormControlLabel
              className={styles.checkboxBlock}
              control={<Checkbox checked={props.graphics.automatic} size="small" />}
              label={t('user:usermenu.setting.lbl-automatic')}
              labelPlacement="start"
              onChange={(_, value) => {
                props.setGraphicsSettings({
                  automatic: value
                })
                EngineEvents.instance.dispatchEvent({
                  type: EngineRenderer.EVENTS.SET_USE_AUTOMATIC,
                  payload: value
                })
              }}
            />
          </div>
        </section>
      </div>
    </div>
  )
}

export default SettingMenu
