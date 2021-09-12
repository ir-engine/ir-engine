import React from 'react'
import { useStyles } from './styles'
import { Paper, Button, Typography } from '@material-ui/core'
import Switch from '@material-ui/core/Switch'
import InputBase from '@material-ui/core/InputBase'

const Client = () => {
  const classes = useStyles()
  const [enabled, setEnabled] = React.useState({
    checkedA: true,
    checkedB: true
  })

  const handleEnable = (event) => {
    setEnabled({ ...enabled, [event.target.name]: event.target.checked })
  }

  const handleSave = (e) => {
    e.preventDefault()
  }

  return (
    <div className={classes.clientSettingsContainer}>
      <form onSubmit={handleSave}>
        <Typography component="h1" className={classes.settingsHeading}>
          CLIENT
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
        <label>Logo</label>
        <Paper component="div" className={classes.createInput}>
          <InputBase name="logo" className={classes.input} style={{ color: '#fff' }} />
        </Paper>
        <label>Title</label>
        <Paper component="div" className={classes.createInput}>
          <InputBase name="title" className={classes.input} style={{ color: '#fff' }} />
        </Paper>
        <label>URL</label>
        <Paper component="div" className={classes.createInput}>
          <InputBase name="url" className={classes.input} disabled style={{ color: '#fff' }} />
        </Paper>
        <label>Release Name</label>
        <Paper component="div" className={classes.createInput}>
          <InputBase name="releaseName" className={classes.input} disabled style={{ color: '#fff' }} />
        </Paper>
        <Button variant="outlined" style={{ color: '#fff' }}>
          Cancel
        </Button>
        &nbsp;&nbsp;
        <Button variant="contained" type="submit">
          Save
        </Button>
      </form>
    </div>
  )
}

export default Client
