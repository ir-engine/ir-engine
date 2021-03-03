import React from 'react';
import {
    Mic,
    VolumeUp,
    BlurLinear,
    CropOriginal,
} from '@material-ui/icons';
import {
    Checkbox,
    FormControlLabel,
    Slider,
    Typography
} from '@material-ui/core';
import styles from '../style.module.scss';
import { WebGLRendererSystem } from '@xr3ngine/engine/src/renderer/WebGLRendererSystem';
import { EngineEvents } from '@xr3ngine/engine/src/worker/EngineEvents';

const SettingMenu = (props: any): JSX.Element => {
  return (
    <div className={styles.menuPanel}>
      <div className={styles.settingPanel}>
        <section className={styles.settingSection}>
          <Typography variant="h2" className={styles.settingHeader}>Audio</Typography>
          <div className={styles.row}>
            <span className={styles.materialIconBlock}><VolumeUp color="primary"/></span>
            <span className={styles.settingLabel}>Volume</span>
            <Slider
              value={props.setting.audio}
              onChange={(_, value) => { props.setUserSettings({ audio: value }) }}
              className={styles.slider}
            />
          </div>
          <div className={styles.row}>
            <span className={styles.materialIconBlock}><Mic color="primary"/></span>
            <span className={styles.settingLabel}>Microphone</span>
            <Slider
              value={props.setting.microphone}
              onChange={(_, value) => { props.setUserSettings({ microphone: value }) }}
              className={styles.slider}
            />
          </div>
        </section>
        <section className={styles.settingSection}>
          <Typography variant="h2" className={styles.settingHeader}>Graphics</Typography>
          <div className={styles.row}>
            <span className={styles.materialIconBlock}><BlurLinear color="primary"/></span>
            <span className={styles.settingLabel}>Resolution</span>
            <Slider
              value={props.graphics.resolution}
              onChange={(_, value) => { 
                props.setGraphicsSettings({
                  resolution: value,
                  automatic: false
                })
                EngineEvents.instance.dispatchEvent({ type: WebGLRendererSystem.EVENTS.SET_RESOLUTION, payload: value });
                EngineEvents.instance.dispatchEvent({ type: WebGLRendererSystem.EVENTS.SET_USE_AUTOMATIC, payload: false });
              }}
              className={styles.slider}
              min={0.25}
              max={1}
              step={0.125}
            />
          </div>
          <div className={styles.row}>
            <span className={styles.materialIconBlock}><CropOriginal color="primary"/></span>
            <span className={styles.settingLabel}>Shadows</span>
            <Slider
              value={props.graphics.shadows}
              onChange={(_, value) => { 
                props.setGraphicsSettings({
                  shadows: value,
                  automatic: false
                })
                EngineEvents.instance.dispatchEvent({ type: WebGLRendererSystem.EVENTS.SET_SHADOW_QUALITY, payload: value });
                EngineEvents.instance.dispatchEvent({ type: WebGLRendererSystem.EVENTS.SET_USE_AUTOMATIC, payload: false });
              }}
              className={styles.slider}
              min={2}
              max={5}
              step={1}
            />
          </div>
          <div className={`${styles.row} ${styles.flexWrap}`}>
            <FormControlLabel
              className={styles.checkboxBlock}
              control={<Checkbox checked={props.graphics.postProcessing} size="small" />}
              label="Post Processing"
              onChange={(_, value) => { 
                props.setGraphicsSettings({
                  postProcessing: value,
                  automatic: false
                })
                EngineEvents.instance.dispatchEvent({ type: WebGLRendererSystem.EVENTS.SET_POST_PROCESSING, payload: value });
                EngineEvents.instance.dispatchEvent({ type: WebGLRendererSystem.EVENTS.SET_USE_AUTOMATIC, payload: false });
              }}
            />
            <FormControlLabel
              className={styles.checkboxBlock}
              control={<Checkbox checked={props.graphics.pbr} size="small" />}
              label="Full PBR"
              onChange={(_, value) => { 
                props.setGraphicsSettings({
                  pbr: value
                })
              }}
            />
          </div>
          <div className={`${styles.row} ${styles.automatic}`}>
            <FormControlLabel
              className={styles.checkboxBlock}
              control={<Checkbox checked={props.graphics.automatic} size="small" />}
              label="Automatic"
              labelPlacement="start"
              onChange={(_, value) => { 
                props.setGraphicsSettings({
                  automatic: value
                })
                EngineEvents.instance.dispatchEvent({ type: WebGLRendererSystem.EVENTS.SET_USE_AUTOMATIC, payload: value });
              }}
            />
          </div>
        </section>
      </div>
    </div>
  );
};

export default SettingMenu;
