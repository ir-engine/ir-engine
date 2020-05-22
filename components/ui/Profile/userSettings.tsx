import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Radio from '@material-ui/core/Radio'
import RadioGroup from '@material-ui/core/RadioGroup'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import FormControl from '@material-ui/core/FormControl'
import FormLabel from '@material-ui/core/FormLabel'
import Typography from '@material-ui/core/Typography'
import VolumeDown from '@material-ui/icons/VolumeDown'
import VolumeUp from '@material-ui/icons/VolumeUp'
import MicIcon from '@material-ui/icons/Mic'
import MicOffIcon from '@material-ui/icons/MicOff'
import Slider from '@material-ui/core/Slider'
import Switch from '@material-ui/core/Switch'
// import {updateUserSettings} from '../../../redux/auth/service'

const useStyles = makeStyles({
  root: {
    width: 300,
    padding: 20
  }
})

const UserSettings: React.FC = () => {
  const classes = useStyles()
  const [volume, setvolume] = React.useState<number>(30)
  const [audio, setAudio] = React.useState<number>(30)
  const [radiovalue, setradiovalue] = React.useState('high')
  const [state, setState] = React.useState({
    checkedA: true,
    checkedB: true
  })
  const handleVolume = (event: any, newValue: number | number[]) => {
    console.log(event)
    setvolume(newValue as number)
  }

  const handleAudio = (event: any, newValue: number | number[]) => {
    console.log(event)
    setAudio(newValue as number)
  }
  const handleRadioValue = (event: React.ChangeEvent<HTMLInputElement>) => {
    setradiovalue((event.target as HTMLInputElement).value)
  }
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setState({ ...state, [event.target.name]: event.target.checked })
  }

  // const handleSubmit = () => {

  // }
  return (
    <div className={classes.root}>
      <Typography id="continuous-slider" gutterBottom style={{ padding: 10 }}>
        Microphone volume
      </Typography>
      <Grid container spacing={2}>
        <Grid item>
          <MicOffIcon />
        </Grid>
        <Grid item xs>
          <Slider
            value={volume}
            onChange={handleVolume}
            aria-labelledby="continuous-slider"
          />
        </Grid>
        <Grid item>
          <MicIcon />
        </Grid>
      </Grid>
      <Typography id="continuous-slider" gutterBottom style={{ padding: 10 }}>
        Audio playback volume
      </Typography>
      <Grid container spacing={2}>
        <Grid item>
          <VolumeDown />
        </Grid>
        <Grid item xs>
          <Slider
            value={audio}
            onChange={handleAudio}
            aria-labelledby="continuous-slider"
          />
        </Grid>
        <Grid item>
          <VolumeUp />
        </Grid>
      </Grid>
      <FormControl component="fieldset" style={{ margin: 10 }}>
        <FormLabel component="legend">Video Quality</FormLabel>
        <RadioGroup
          aria-label="gender"
          name="gender1"
          value={radiovalue}
          onChange={handleRadioValue}
        >
          <FormControlLabel value="high" control={<Radio />} label="High" />
          <FormControlLabel value="low" control={<Radio />} label="Low" />
        </RadioGroup>
      </FormControl>
      <FormControlLabel
        control={
          <Switch
            checked={state.checkedB}
            onChange={handleChange}
            name="checkedB"
            color="primary"
          />
        }
        label="Enter room muted"
      />
    </div>
  )
}

export default UserSettings
