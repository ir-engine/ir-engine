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

const SettingMenu = (props: any): JSX.Element => {
  const [ pbr, setPBR ] = useState(true);
  const [ postProcessing, setPostProcessing ] = useState(true);
  const [ automatic, setAutomatic ] = useState(true);

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
              value={props.setting.resolustion}
              onChange={(_, value) => { console.log("changing resolustion =>", value) }}
              className={styles.slider}
            />
          </div>
          <div className={styles.row}>
            <span className={styles.materialIconBlock}><CropOriginal color="primary"/></span>
            <span className={styles.settingLabel}>Shadows</span>
            <Slider
              value={props.setting.shadows}
              onChange={(_, value) => { console.log("changing shadows =>", value) }}
              className={styles.slider}
            />
          </div>
          <div className={`${styles.row} ${styles.flexWrap}`}>
            <FormControlLabel
              className={styles.checkboxBlock}
              control={<Checkbox checked={postProcessing} size="small" />}
              label="Post Processing"
              onChange={() => { console.log("Changing Post Processing"); setPostProcessing(!postProcessing); }}
            />
            <FormControlLabel
              className={styles.checkboxBlock}
              control={<Checkbox checked={pbr} size="small" />}
              label="Full PBR"
              onChange={() => { console.log("Changing PBR"); setPBR(!pbr); }}
            />
          </div>
          <div className={`${styles.row} ${styles.automatic}`}>
            <FormControlLabel
              className={styles.checkboxBlock}
              control={<Checkbox checked={automatic} size="small" />}
              label="Automatic"
              labelPlacement="start"
              onChange={() => { console.log("Changing Automatic"); setAutomatic(!automatic); }}
            />
          </div>
        </section>
      </div>
    </div>
  );
};

export default SettingMenu;
