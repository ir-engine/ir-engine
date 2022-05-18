import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import Slider from '@mui/material/Slider'
import Typography from '@mui/material/Typography'
import { Image, Mic, SurroundSound, VolumeUp } from '@mui/icons-material'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
// import { PositionalAudioSystem } from '@xrengine/engine/src/audio/systems/PositionalAudioSystem'
import React, { ChangeEvent, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from '../../../store'
import { AuthService } from '../../services/AuthService'
import { useAuthState } from '../../services/AuthService'
import styles from './Profile.module.scss'

interface Props {}

const UserSettings = (props: Props): JSX.Element => {
  const { t } = useTranslation()
  const selfUser = useAuthState().user.value
  const [volume, setvolume] = useState<number>(
    selfUser?.user_setting?.volume != null ? selfUser.user_setting.volume : 30
  )
  const [audio, setAudio] = useState<number>(
    selfUser?.user_setting?.microphone != null ? selfUser.user_setting.microphone : 30
  )
  const [radiovalue, setradiovalue] = useState('high')
  const [useSpatialAudio, setUseSpatialAudio] = useState(
    selfUser?.user_setting?.spatialAudioEnabled != null ? selfUser.user_setting.spatialAudioEnabled : true
  )
  // const [state, setState] = useState({
  //   checkedA: true,
  //   checkedB: true
  // });
  const handleVolume = (event: any, newValue: number | number[]): void => {
    setvolume(newValue as number)
  }

  const handleAudio = (event: any, newValue: number | number[]): void => {
    setAudio(newValue as number)
  }
  const handleRadioValue = (event: ChangeEvent<HTMLInputElement>): void => {
    setradiovalue((event.target as HTMLInputElement).value)
  }
  // const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
  //   setState({ ...state, [event.target.name]: event.target.checked });
  // };
  const handleSpatialAudioChange = (event: any, newValue: boolean): void => {
    setUseSpatialAudio(newValue)
    AuthService.updateUserSettings(selfUser?.user_setting?.id, {
      spatialAudioEnabled: newValue
    })
    // if (Engine.spatialAudio) {
    // TODO
    // if (newValue === true) PositionalAudioSystem.instance.resume()
    // else if (newValue === false) PositionalAudioSystem.instance.suspend()
    // }
  }

  return (
    <div className={styles.root}>
      <section className={styles.settingRow}>
        <Typography variant="h2" className={styles.settingLabel}>
          <VolumeUp color="primary" /> {t('user:profile.userSettings.volume')}
        </Typography>
        <span className={styles.settingValue}>
          <Slider value={volume} onChange={handleVolume} aria-labelledby="continuous-slider" />
        </span>
      </section>
      <section className={styles.settingRow}>
        <Typography variant="h2" className={styles.settingLabel}>
          <Mic color="primary" /> {t('user:profile.userSettings.microphone')}
        </Typography>
        <span className={styles.settingValue}>
          <Slider value={audio} onChange={handleAudio} aria-labelledby="continuous-slider" />
        </span>
      </section>
      <section className={styles.settingRow}>
        <Typography variant="h2" className={styles.settingLabel}>
          <Image color="primary" /> {t('user:profile.userSettings.resolution')}
        </Typography>
        <span className={styles.settingValue}>
          <RadioGroup aria-label="videoQuality" name="videoQuality" value={radiovalue} onChange={handleRadioValue}>
            <FormControlLabel
              className={styles.controlsSvg}
              value="high"
              control={<Radio color="primary" />}
              label={t('user:profile.userSettings.high') as string}
            />
            <FormControlLabel
              className={styles.controlsSvg}
              value="low"
              control={<Radio color="primary" />}
              label={t('user:profile.userSettings.low') as string}
            />
          </RadioGroup>
        </span>
      </section>
      <section className={styles.settingRow}>
        <SurroundSound color="primary" />
        <FormControlLabel
          control={<Checkbox checked={true} onChange={handleSpatialAudioChange} />}
          label={t('user:profile.userSettings.spatialAudio') as string}
        />
      </section>
      {/* <section className={styles.settingRow}>
      <Typography variant="h2" color="primary" className={styles.settingLabel}>{t('user:profile.userSettings.enterMuted')}</Typography>
      <span className={styles.settingValue}>
        <Switch
              checked={state.checkedB}
              onChange={handleChange}
              name="checkedB"
              color="primary"
            />
        </span>
      </section>       */}
    </div>
  )
}

export default UserSettings
