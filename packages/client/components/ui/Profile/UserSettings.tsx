import React, { ChangeEvent, useState } from 'react';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Typography from '@material-ui/core/Typography';
import Slider from '@material-ui/core/Slider';
import Switch from '@material-ui/core/Switch';
import styles from './Profile.module.scss';

import VolumeUpIcon from '@material-ui/icons/VolumeUp';
import ImageIcon from '@material-ui/icons/Image';
import { Mic } from '@material-ui/icons';

const UserSettings = (): any => {
  const [volume, setvolume] = useState<number>(30);
  const [audio, setAudio] = useState<number>(30);
  const [radiovalue, setradiovalue] = useState('high');
  const [state, setState] = useState({
    checkedA: true,
    checkedB: true
  });
  const handleVolume = (event: any, newValue: number | number[]): void => {
    setvolume(newValue as number);
  };

  const handleAudio = (event: any, newValue: number | number[]): void => {
    setAudio(newValue as number);
  };
  const handleRadioValue = (event: ChangeEvent<HTMLInputElement>): void => {
    setradiovalue((event.target as HTMLInputElement).value);
  };
  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setState({ ...state, [event.target.name]: event.target.checked });
  };

  return (
    <div className={styles.root}>
      <section className={styles.settingRow}>
        <Typography variant="h2" className={styles.settingLabel}><VolumeUpIcon color="primary" /> Volume</Typography>
        <span className={styles.settingValue}><Slider
            value={volume}
            onChange={handleVolume}
            aria-labelledby="continuous-slider"
          /></span>
      </section>
      <section className={styles.settingRow}>
      <Typography variant="h2" className={styles.settingLabel}><Mic color="primary" /> Microphone</Typography>
        <span className={styles.settingValue}><Slider
              value={audio}
              onChange={handleAudio}
              aria-labelledby="continuous-slider"
            /></span>
      </section>
      <section className={styles.settingRow}>
      <Typography variant="h2" className={styles.settingLabel}><ImageIcon color="primary" /> Resolution</Typography>
        <span className={styles.settingValue}>
          <RadioGroup
              aria-label="videoQuality"
              name="videoQuality"
              value={radiovalue}
              onChange={handleRadioValue}
            >
              <FormControlLabel className={styles.controlsSvg} value="high" control={<Radio color="primary" />} label="High" />
              <FormControlLabel className={styles.controlsSvg} value="low" control={<Radio color="primary" />} label="Low" />
            </RadioGroup>
        </span>
      </section>
      <section className={styles.settingRow}>
      <Typography variant="h2" color="primary" className={styles.settingLabel}>Enter room muted</Typography>
      <span className={styles.settingValue}>
        <Switch
              checked={state.checkedB}
              onChange={handleChange}
              name="checkedB"
              color="primary"
            />
        </span>
      </section>      
    </div>
  );
};

export default UserSettings;
