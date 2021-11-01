import React, { useEffect } from 'react'
import { useStyles } from './styles'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Collapse from '@mui/material/Collapse'
import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'
import Switch from '@mui/material/Switch'
import { Grid, Paper, Button, Typography } from '@mui/material'
import InputBase from '@mui/material/InputBase'
import IconButton from '@mui/material/IconButton'
import { Icon } from '@iconify/react'
import { useDispatch } from '../../../store'
import { useServerSettingState } from '../../services/Setting/ServerSettingService'
import { ServerSettingService } from '../../services/Setting/ServerSettingService'
import { useAuthState } from '../../../user/services/AuthService'

interface serverProps {
  fetchServerSettings?: any
}

const Server = (props: serverProps) => {
  const classes = useStyles()
  const [open, setOpen] = React.useState(false)
  const [openPaginate, setOpenPginate] = React.useState(false)
  const [load, setLoad] = React.useState(false)
  const dispatch = useDispatch()
  const serverSettingState = useServerSettingState()
  const serverSettings = serverSettingState?.Server?.server?.value || []

  const [server, setServer] = React.useState({
    enabled: '',
    mode: '',
    hostname: '',
    port: '',
    clientHost: '',
    nodeModule: '',
    rootDir: '',
    publicDir: '',
    localStorageProvider: '',
    performDryRun: '',
    storageProvider: '',
    TrackingId: '',
    hubEndpoint: '',
    paginate: '',
    url: '',
    certPath: '',
    keyPath: '',
    local: '',
    releaseName: ''
  })

  const [enabled, setEnabled] = React.useState({
    checkedA: true,
    checkedB: true
  })
  const [dryRun, setDryRun] = React.useState({
    checkedA: true,
    checkedB: true
  })
  const [local, setLocal] = React.useState({
    checkedA: true,
    checkedB: true
  })

  const authState = useAuthState()
  const user = authState.user
  const handleClick = () => {
    setOpen(!open)
  }
  const handleClickPaginate = () => {
    setOpenPginate(!openPaginate)
  }

  const handleEnable = (event) => {
    setEnabled({ ...enabled, [event.target.name]: event.target.checked })
  }

  const handleDryRun = (event) => {
    setDryRun({ ...dryRun, [event.target.name]: event.target.checked })
  }

  const handleLocal = (event) => {
    setLocal({ ...local, [event.target.name]: event.target.checked })
  }

  const handleSave = (event) => {
    event.preventDefault()
  }
  const handleLoad = () => {
    setLoad(true)
  }

  useEffect(() => {
    if (user?.id?.value != null && serverSettingState?.Server?.updateNeeded?.value === true) {
      ServerSettingService.fetchServerSettings()
    }
  }, [authState])

  return (
    <form onSubmit={handleSave}>
      <Typography component="h1" className={classes.settingsHeading}>
        SERVER
      </Typography>
      {serverSettings.map((el) => (
        <Grid container spacing={3} key={el?.id || ''}>
          <Grid item xs={12} sm={6}>
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
            <label>Mode</label>
            <Paper component="div" className={classes.createInput}>
              <InputBase
                name="mode"
                className={classes.input}
                disabled
                style={{ color: '#fff' }}
                value={el.serverMode ? el.serverMode : 'test'}
              />
            </Paper>
            <label> Host Name</label>
            <Paper component="div" className={classes.createInput}>
              <InputBase
                name="hostname"
                className={classes.input}
                disabled
                style={{ color: '#fff' }}
                value={el.hostName ? el.hostName : 'test'}
              />
            </Paper>
            <label>Port</label>
            <Paper component="div" className={classes.createInput}>
              <InputBase
                name="port"
                className={classes.input}
                value={el?.port || ''}
                disabled
                style={{ color: '#fff' }}
              />
            </Paper>
            <label> Client Host</label>
            <Paper component="div" className={classes.createInput}>
              <InputBase
                name="clienthost"
                className={classes.input}
                disabled
                style={{ color: '#fff' }}
                value={el?.clientHost || ''}
              />
            </Paper>
            <label>Root Directory</label>
            <Paper component="div" className={classes.createInput}>
              <InputBase
                name="rootDir"
                className={classes.input}
                disabled
                style={{ color: '#fff' }}
                value={el?.rootDirectory || ''}
              />
            </Paper>
            <label>Public Directory</label>
            <Paper component="div" className={classes.createInput}>
              <InputBase
                name="publicDir"
                className={classes.input}
                disabled
                style={{ color: '#fff' }}
                value={el?.publicDirectory || ''}
              />
            </Paper>
            <label>Node Modules Directory</label>
            <Paper component="div" className={classes.createInput}>
              <InputBase
                name="nodeModule"
                className={classes.input}
                disabled
                style={{ color: '#fff' }}
                value={el?.nodeModulesDirectory || ''}
              />
            </Paper>{' '}
            <label>Local StorageProvider </label>
            <Paper component="div" className={classes.createInput}>
              <InputBase
                name="localStorageProvider"
                className={classes.input}
                disabled
                style={{ color: '#fff' }}
                value={el?.localStorageProvider || ''}
              />
            </Paper>
            <label> Perform Dry Run</label>
            <Paper component="div" className={classes.createInput}>
              <Switch
                disabled
                checked={dryRun.checkedB}
                onChange={handleDryRun}
                color="primary"
                name="checkedB"
                inputProps={{ 'aria-label': 'primary checkbox' }}
              />
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6}>
            <label>Storage Provider </label>
            <Paper component="div" className={classes.createInput}>
              <InputBase
                name="StorageProvider"
                className={classes.input}
                disabled
                style={{ color: '#fff' }}
                value={el?.storageProvider || ''}
              />
            </Paper>
            <label>Google Analytics Tracking ID </label>
            <Paper component="div" className={classes.createInput}>
              <IconButton size="large">
                <Icon icon="emojione:key" />
              </IconButton>
              <InputBase
                name="googleTrackingid"
                className={classes.input}
                style={{ color: '#fff' }}
                value={el?.gaTrackingId || ''}
              />
            </Paper>
            <ListItem button onClick={handleClick}>
              <ListItemText primary="Hub" />
              {open ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItem button className={classes.nested}>
                  <Paper component="div" className={classes.createInput}>
                    <InputBase
                      name="hub"
                      className={classes.input}
                      style={{ color: '#fff' }}
                      value={el.hub?.endpoint}
                    />
                  </Paper>
                </ListItem>
              </List>
            </Collapse>
            <ListItem button onClick={handleClickPaginate}>
              <ListItemText primary="Paginate" />
              {openPaginate ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
            <Collapse in={openPaginate} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItem button className={classes.nested}>
                  <ListItemText primary="Default:10" />
                  <ListItemText primary={`Max: ${el?.paginate || ''}`} />
                </ListItem>
              </List>
            </Collapse>
            <label>URL</label>
            <Paper component="div" className={classes.createInput}>
              <InputBase name="url" className={classes.input} disabled style={{ color: '#fff' }} value={el.url} />
            </Paper>
            <label> CertPath </label>
            <Paper component="div" className={classes.createInput}>
              <InputBase
                name="certPath"
                className={classes.input}
                disabled
                style={{ color: '#fff' }}
                value={el?.certPath || ''}
              />
            </Paper>
            <label> KeyPath </label>
            <Paper component="div" className={classes.createInput}>
              <InputBase
                name="keyPath"
                className={classes.input}
                disabled
                style={{ color: '#fff' }}
                value={el?.keyPath || ''}
              />
            </Paper>
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
            <label> Release Name </label>
            <Paper component="div" className={classes.createInput}>
              <InputBase
                name="releaseName"
                className={classes.input}
                disabled
                style={{ color: '#fff' }}
                value={el?.releaseName || ''}
              />
            </Paper>
          </Grid>
        </Grid>
      ))}
      <Button variant="outlined" style={{ color: '#fff' }}>
        Cancel
      </Button>
      &nbsp; &nbsp;
      <Button variant="contained" type="submit">
        Save
      </Button>
    </form>
  )
}

export default Server
