import React, { useState } from 'react';
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

const SettingMenu = (props: any): JSX.Element => {
  // const [ pbr, setPBR ] = useState(props.graphics.pbr || true);
  // const [ postProcessing, setPostProcessing ] = useState(props.graphics.postProcessing || true);
  // const [ automatic, setAutomatic ] = useState(props.graphics.automatic || true);
  // const [ shadows, setShadows ] = useState(props.graphics.shadows || 5);
  // const [ resolution, setResolution ] = useState(props.graphics.resolution || 1);

  // useEffect(() => {
  //   Engine.qualityLevelChangeListeners.push(thing);
  //   return function cleanup() {
  //       Engine.qualityLevelChangeListeners.remove(thing);
  //   };
  // }, [])

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
                // if(props.graphics.automatic) { setAutomatic(false); }
                props.setGraphicsSettings({
                  resolution: value
                })
                // setResolution(value);
                // WebGLRendererSystem.instance.setResolution(resolution);
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
                  shadows: value
                })
                // if(props.graphics.automatic) { setAutomatic(false); }
                // setShadows(value);
                // WebGLRendererSystem.instance.setShadowQuality(props.graphics.shadows);
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
              onChange={() => { 
                props.setGraphicsSettings({
                  postProcessing: !props.graphics.postProcessing
                })
                // if(props.graphics.automatic) { setAutomatic(false); }
                // setPostProcessing(!props.graphics.postProcessing);
                // WebGLRendererSystem.instance.setUsePostProcessing(props.graphics.postProcessing);
              }}
            />
            <FormControlLabel
              className={styles.checkboxBlock}
              control={<Checkbox checked={props.graphics.pbr} size="small" />}
              label="Full PBR"
              onChange={() => { 
                // setPBR(!pbr); 
              }}
            />
          </div>
          <div className={`${styles.row} ${styles.automatic}`}>
            <FormControlLabel
              className={styles.checkboxBlock}
              control={<Checkbox checked={props.graphics.automatic} size="small" />}
              label="Automatic"
              labelPlacement="start"
              onChange={() => { 
                props.setGraphicsSettings({
                  automatic: !props.graphics.automatic
                })
                // setAutomatic(!automatic);
                // console.log(!automatic)
                // if(!automatic) {

                //   WebGLRendererSystem.instance.setUseAutomatic(!automatic);
                //   WebGLRendererSystem.instance.setResolution(resolution);
                //   WebGLRendererSystem.instance.setShadowQuality(shadows);
                //   WebGLRendererSystem.instance.setUsePostProcessing(postProcessing);
                // } else {
                // }

                // setResolution(WebGLRendererSystem.instance.scaleFactor)
                // setShadows(WebGLRendererSystem.instance.shadowQuality)
                // setPostProcessing(WebGLRendererSystem.instance.usePostProcessing)
              }}
            />
          </div>
        </section>
      </div>
    </div>
  );
};

export default SettingMenu;
