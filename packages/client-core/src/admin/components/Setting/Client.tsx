import { Button, Paper, Typography } from '@mui/material'
import InputBase from '@mui/material/InputBase'
import Switch from '@mui/material/Switch'
import React, { useEffect, useState } from 'react'
import { useAuthState } from '../../../user/services/AuthService'
import { ClientSettingService, useClientSettingState } from '../../services/Setting/ClientSettingService'
import { useStyles } from './styles'

interface clientProps {}

const Client = (props: clientProps) => {
  const classes = useStyles()
  const clientSettingState = useClientSettingState()
  const [clientSetting] = clientSettingState?.client?.value || []
  const id = clientSetting?.id
  const [logo, setLogo] = useState(clientSetting?.logo)
  const [title, setTitle] = useState(clientSetting?.title)
  const [icon192px, setIcon192px] = useState(clientSetting?.icon192px)
  const [icon512px, setIcon512px] = useState(clientSetting?.icon512px)
  const [favicon16px, setFavicon16px] = useState(clientSetting?.favicon16px)
  const [favicon32px, setFavicon32px] = useState(clientSetting?.favicon32px)
  const [siteDescription, setSiteDescription] = useState(clientSetting?.siteDescription)

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
      ClientSettingService.fetchClientSettings()
    }
  }, [authState?.user?.id?.value, clientSettingState?.updateNeeded?.value])

  useEffect(() => {
    if (clientSetting) {
      setLogo(clientSetting?.logo)
      setTitle(clientSetting?.title)
      setIcon192px(clientSetting?.icon192px)
      setIcon512px(clientSetting?.icon512px)
      setFavicon16px(clientSetting?.favicon16px)
      setFavicon32px(clientSetting?.favicon32px)
      setSiteDescription(clientSetting?.siteDescription)
    }
  }, [clientSettingState?.updateNeeded?.value])

  const handleSubmit = (event) => {
    event.preventDefault()

    ClientSettingService.patchClientSetting(
      {
        logo: logo,
        title: title,
        icon192px: icon192px,
        icon512px: icon512px,
        favicon16px: favicon16px,
        favicon32px: favicon32px,
        siteDescription: siteDescription
      },
      id
    )
  }

  const handleCancel = () => {
    setLogo(clientSetting?.logo)
    setTitle(clientSetting?.title)
    setIcon192px(clientSetting?.icon192px)
    setIcon512px(clientSetting?.icon512px)
    setFavicon16px(clientSetting?.favicon16px)
    setFavicon32px(clientSetting?.favicon32px)
    setSiteDescription(clientSetting?.siteDescription)
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
        <label>Description</label>
        <Paper component="div" className={classes.createInput}>
          <InputBase
            name="title"
            className={classes.input}
            style={{ color: '#fff' }}
            value={siteDescription || ''}
            onChange={(e) => setSiteDescription(e.target.value)}
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
        <label>Icon 192px</label>
        <Paper component="div" className={classes.createInput}>
          <InputBase
            name="logo"
            className={classes.input}
            style={{ color: '#fff' }}
            value={icon192px || ''}
            onChange={(e) => setIcon192px(e.target.value)}
          />
        </Paper>
        <label>Icon 512px</label>
        <Paper component="div" className={classes.createInput}>
          <InputBase
            name="logo"
            className={classes.input}
            style={{ color: '#fff' }}
            value={icon512px || ''}
            onChange={(e) => setIcon512px(e.target.value)}
          />
        </Paper>
        <label>FavIcon 16px</label>
        <Paper component="div" className={classes.createInput}>
          <InputBase
            name="logo"
            className={classes.input}
            style={{ color: '#fff' }}
            value={favicon16px || ''}
            onChange={(e) => setFavicon16px(e.target.value)}
          />
        </Paper>
        <label>FavIcon 32px</label>
        <Paper component="div" className={classes.createInput}>
          <InputBase
            name="logo"
            className={classes.input}
            style={{ color: '#fff' }}
            value={favicon32px || ''}
            onChange={(e) => setFavicon32px(e.target.value)}
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
        <Button sx={{ maxWidth: '100%' }} variant="outlined" style={{ color: '#fff' }} onClick={handleCancel}>
          Cancel
        </Button>
        &nbsp;&nbsp;
        <Button sx={{ maxWidth: '100%' }} variant="contained" type="submit" onClick={handleSubmit}>
          Save
        </Button>
      </form>
    </div>
  )
}

export default Client
