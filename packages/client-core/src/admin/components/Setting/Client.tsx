import React, { useEffect } from 'react'
import { useStyles } from './styles'
import { Paper, Button, Typography } from '@material-ui/core'
import Switch from '@material-ui/core/Switch'
import InputBase from '@material-ui/core/InputBase'
import { useDispatch } from '../../../store'
import { useClientSettingState } from '../../state/Setting/ClientSettingState'
import { ClientSettingService } from '../../state/Setting/ClientSettingServices'
import { useAuthState } from '../../../user/state/AuthState'

interface clientProps {}

const Client = (props: clientProps) => {
  const classes = useStyles()
  const clientSettingState = useClientSettingState()
  const dispatch = useDispatch()
  const clientSettings = clientSettingState?.Client?.client?.value || []

  const [enabled, setEnabled] = React.useState({
    checkedA: true,
    checkedB: true
  })

  const authState = useAuthState()
  const user = authState.user
  const handleEnable = (event) => {
    setEnabled({ ...enabled, [event.target.name]: event.target.checked })
  }

  const handleSave = (e) => {
    e.preventDefault()
  }

  useEffect(() => {
    if (user?.id?.value != null && clientSettingState?.Client?.updateNeeded?.value === true) {
      ClientSettingService.fetchedClientSettings()
    }
  }, [authState])

  return (
    <div className={classes.clientSettingsContainer}>
      <form onSubmit={handleSave}>
        <Typography component="h1" className={classes.settingsHeading}>
          CLIENT
        </Typography>
        <label>Enabled</label>
        {clientSettings.map((el) => (
          <div key={el?.id || ''}>
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
              <InputBase name="logo" className={classes.input} style={{ color: '#fff' }} value={el?.logo || ''} />
            </Paper>
            <label>Title</label>
            <Paper component="div" className={classes.createInput}>
              <InputBase name="title" className={classes.input} style={{ color: '#fff' }} value={el?.title || ''} />
            </Paper>
            <label>URL</label>
            <Paper component="div" className={classes.createInput}>
              <InputBase
                name="url"
                className={classes.input}
                disabled
                style={{ color: '#fff' }}
                value={el?.url || ''}
              />
            </Paper>
            <label>Release Name</label>
            <Paper component="div" className={classes.createInput}>
              <InputBase
                name="releaseName"
                className={classes.input}
                disabled
                style={{ color: '#fff' }}
                value={el?.releaseName || ''}
              />
            </Paper>
          </div>
        ))}
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
