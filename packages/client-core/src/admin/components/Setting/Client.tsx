import React, { useState, useEffect } from 'react'
import { useStyles } from './styles'
import { Paper, Button, Typography } from '@mui/material'
import Switch from '@mui/material/Switch'
import InputBase from '@mui/material/InputBase'
import { useClientSettingState } from '../../services/Setting/ClientSettingService'
import { ClientSettingService } from '../../services/Setting/ClientSettingService'
import { useAuthState } from '../../../user/services/AuthService'

interface clientProps {}

const Client = (props: clientProps) => {
  const classes = useStyles()
  const clientSettingState = useClientSettingState()
  const [clientSetting] = clientSettingState?.client?.value || []
  const id = clientSetting?.id
  const [logo, setLogo] = useState(clientSetting?.logo)
  const [title, setTitle] = useState(clientSetting?.title)

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
    if (user?.id?.value != null && clientSettingState?.updateNeeded?.value === true) {
      ClientSettingService.fetchedClientSettings()
    }
  }, [authState])

  useEffect(() => {
    if (clientSetting) {
      setLogo(clientSetting?.logo)
      setTitle(clientSetting?.title)
    }
  }, [clientSettingState?.updateNeeded?.value])

  const handleSubmit = (event) => {
    event.preventDefault()

    ClientSettingService.pathClientSetting({ logo: logo, title: title }, id)
  }

  const handleCancel = () => {
    setLogo(clientSetting?.logo)
    setTitle(clientSetting?.title)
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
          <InputBase
            name="logo"
            className={classes.input}
            style={{ color: '#fff' }}
            value={logo || ''}
            onChange={(e) => setLogo(e.target.value)}
          />
        </Paper>
        <label>Title</label>
        <Paper component="div" className={classes.createInput}>
          <InputBase
            name="title"
            className={classes.input}
            style={{ color: '#fff' }}
            value={title || ''}
            onChange={(e) => setTitle(e.target.value)}
          />
        </Paper>
        <label>URL</label>
        <Paper component="div" className={classes.createInput}>
          <InputBase
            name="url"
            className={classes.input}
            disabled
            style={{ color: '#fff' }}
            value={clientSetting?.url || ''}
          />
        </Paper>
        <label>Release Name</label>
        <Paper component="div" className={classes.createInput}>
          <InputBase
            name="releaseName"
            className={classes.input}
            disabled
            style={{ color: '#fff' }}
            value={clientSetting?.releaseName || ''}
          />
        </Paper>
        <Button variant="outlined" style={{ color: '#fff' }} onClick={handleCancel}>
          Cancel
        </Button>
        &nbsp;&nbsp;
        <Button variant="contained" type="submit" onClick={handleSubmit}>
          Save
        </Button>
      </form>
    </div>
  )
}

export default Client
