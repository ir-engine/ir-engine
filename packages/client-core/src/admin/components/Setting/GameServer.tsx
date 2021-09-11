import React from 'react'
import { useStyles } from './styles'
import Switch from '@material-ui/core/Switch'
import { Grid, Paper, Button, Typography } from '@material-ui/core'
import InputBase from '@material-ui/core/InputBase'

const GameServer = () => {
  const classes = useStyles()

  const [enabled, setEnabled] = React.useState({
    checkedA: true,
    checkedB: true
  })
  const [local, setLocal] = React.useState({
    checkedA: true,
    checkedB: true
  })
  const handleLocal = (event) => {
    setLocal({ ...local, [event.target.name]: event.target.checked })
  }

  const handleEnable = (event) => {
    setEnabled({ ...enabled, [event.target.name]: event.target.checked })
  }

  return (
    <div>
      <form>
        <Typography component="h1" className={classes.settingsHeading}>
          GAME SERVER
        </Typography>
        <div className={classes.root}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <label> Client Host</label>
              <Paper component="div" className={classes.createInput}>
                <InputBase name="mode" className={classes.input} disabled style={{ color: '#fff' }} />
              </Paper>
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
              <label>rtc_start_port</label>
              <Paper component="div" className={classes.createInput}>
                <InputBase name="rtc_start_port" className={classes.input} disabled style={{ color: '#fff' }} />
              </Paper>
              <label>rtc_end_port</label>
              <Paper component="div" className={classes.createInput}>
                <InputBase name="rtc_end_port" className={classes.input} disabled style={{ color: '#fff' }} />
              </Paper>
              <label>rtc_port_block_size</label>
              <Paper component="div" className={classes.createInput}>
                <InputBase name="rtc_port_block_size" className={classes.input} disabled style={{ color: '#fff' }} />
              </Paper>
              <label>Identifier Digits </label>
              <Paper component="div" className={classes.createInput}>
                <InputBase
                  disabled
                  name="rtc_port_block_size"
                  className={classes.input}
                  defaultValue="5"
                  style={{ color: '#fff' }}
                />
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6}>
              <label> Local </label>
              <Paper component="div" className={classes.createInput}>
                <Switch
                  disabled
                  checked={local.checkedB}
                  onChange={handleLocal}
                  color="primary"
                  name="checkedB"
                  inputProps={{ 'aria-label': 'primary checkbox' }}
                />
              </Paper>
              <label> Domain </label>
              <Paper component="div" className={classes.createInput}>
                <InputBase name="domain" className={classes.input} disabled style={{ color: '#fff' }} />
              </Paper>
              <label> Release Name </label>
              <Paper component="div" className={classes.createInput}>
                <InputBase name="releaseName" className={classes.input} disabled style={{ color: '#fff' }} />
              </Paper>
              <label> Port </label>
              <Paper component="div" className={classes.createInput}>
                <InputBase name="port" className={classes.input} disabled style={{ color: '#fff' }} />
              </Paper>
              <label> Mode </label>
              <Paper component="div" className={classes.createInput}>
                <InputBase name="mode" className={classes.input} disabled style={{ color: '#fff' }} />
              </Paper>
              <label> Location Name </label>
              <Paper component="div" className={classes.createInput}>
                <InputBase name="locationName" className={classes.input} disabled style={{ color: '#fff' }} />
              </Paper>
            </Grid>
          </Grid>
        </div>
      </form>
    </div>
  )
}

export default GameServer
