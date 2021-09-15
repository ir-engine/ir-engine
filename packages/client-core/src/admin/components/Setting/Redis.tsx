import React from 'react'
import { Paper, Button, Typography } from '@material-ui/core'
import InputBase from '@material-ui/core/InputBase'
import { useStyles } from './styles'
import Switch from '@material-ui/core/Switch'
const Redis = () => {
  const classes = useStyles()
  const [enabled, setEnabled] = React.useState({
    checkedA: true,
    checkedB: true
  })

  const handleEnable = (event) => {
    setEnabled({ ...enabled, [event.target.name]: event.target.checked })
  }

  return (
    <div>
      <form>
        <Typography component="h1" className={classes.settingsHeading}>
          REDIS
        </Typography>
        <label>Enabled</label>
        <Paper component="div" className={classes.createInput}>
          <Switch
            disabled
            checked={enabled.checkedB}
            onChange={handleEnable}
            color="primary"
            name="checkedB"
            inputProps={{ 'aria-label': 'primary checkbox' }}
          />
        </Paper>
        <br />
        <Paper component="div" className={classes.createInput}>
          <label>Address:</label>
          <InputBase name="address" className={classes.input} disabled style={{ color: '#fff' }} />
        </Paper>
        <Paper component="div" className={classes.createInput}>
          <label>Port:</label>
          <InputBase name="port" className={classes.input} disabled style={{ color: '#fff' }} />
        </Paper>
        <Paper component="div" className={classes.createInput}>
          <label>Password:</label>
          <InputBase name="password" className={classes.input} disabled style={{ color: '#fff' }} />
        </Paper>
      </form>
    </div>
  )
}

export default Redis
