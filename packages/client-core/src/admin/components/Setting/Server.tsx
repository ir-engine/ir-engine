import React from 'react'
import { useStyles } from './styles'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import Collapse from '@material-ui/core/Collapse'
import ExpandLess from '@material-ui/icons/ExpandLess'
import ExpandMore from '@material-ui/icons/ExpandMore'
import Switch from '@material-ui/core/Switch'
import { Grid, Paper, Button, Typography } from '@material-ui/core'
import InputBase from '@material-ui/core/InputBase'
import IconButton from '@material-ui/core/IconButton'
import { Icon } from '@iconify/react'

const Server = () => {
  const classes = useStyles()
  const [open, setOpen] = React.useState(false)
  const [openPaginate, setOpenPginate] = React.useState(false)
  const [load, setLoad] = React.useState(false)
  const [server, setServer] = React.useState({
    enabled: '',
    mode: '',
    hostname: '',
    port: '',
    clientHost: '',
    nodeModule: '',
    rootDir: '',
    publicDir: ''
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

  return (
    <form onSubmit={handleSave}>
      <Typography component="h1" className={classes.settingsHeading}>
        SERVER
      </Typography>
      <Grid container spacing={3}>
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
            <InputBase name="mode" className={classes.input} disabled style={{ color: '#fff' }} />
          </Paper>
          <label> Host Name</label>
          <Paper component="div" className={classes.createInput}>
            <InputBase name="hostname" className={classes.input} disabled style={{ color: '#fff' }} />
          </Paper>
          <label>Port</label>
          <Paper component="div" className={classes.createInput}>
            <InputBase name="port" className={classes.input} disabled style={{ color: '#fff' }} />
          </Paper>
          <label> Client Host</label>
          <Paper component="div" className={classes.createInput}>
            <InputBase name="clienthost" className={classes.input} disabled style={{ color: '#fff' }} />
          </Paper>
          <label>Root Directory</label>
          <Paper component="div" className={classes.createInput}>
            <InputBase name="rootDir" className={classes.input} disabled style={{ color: '#fff' }} />
          </Paper>
          <label>Public Directory</label>
          <Paper component="div" className={classes.createInput}>
            <InputBase name="publicDir" className={classes.input} disabled style={{ color: '#fff' }} />
          </Paper>
          <label>Node Modules Directory</label>
          <Paper component="div" className={classes.createInput}>
            <InputBase name="nodeModule" className={classes.input} disabled style={{ color: '#fff' }} />
          </Paper>{' '}
          <label>Local StorageProvider </label>
          <Paper component="div" className={classes.createInput}>
            <InputBase name="localStorageProvider" className={classes.input} disabled style={{ color: '#fff' }} />
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
            <InputBase name="StorageProvider" className={classes.input} disabled style={{ color: '#fff' }} />
          </Paper>
          <label>Google Analytics Tracking ID </label>
          <Paper component="div" className={classes.createInput}>
            <IconButton>
              <Icon icon="emojione:key" />
            </IconButton>
            <InputBase name="StorageProvider" className={classes.input} style={{ color: '#fff' }} />
          </Paper>
          <ListItem button onClick={handleClick}>
            <ListItemText primary="Hub" />
            {open ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItem button className={classes.nested}>
                <Paper component="div" className={classes.createInput}>
                  <InputBase name="url" className={classes.input} style={{ color: '#fff' }} />
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
                <ListItemText primary="max:100" />
              </ListItem>
            </List>
          </Collapse>
          <label>URL</label>
          <Paper component="div" className={classes.createInput}>
            <InputBase name="url" className={classes.input} disabled style={{ color: '#fff' }} />
          </Paper>
          <label> CertPath </label>
          <Paper component="div" className={classes.createInput}>
            <InputBase name="certPath" className={classes.input} disabled style={{ color: '#fff' }} />
          </Paper>
          <label> KeyPath </label>
          <Paper component="div" className={classes.createInput}>
            <InputBase name="keyPath" className={classes.input} disabled style={{ color: '#fff' }} />
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
            <InputBase name="releaseName" className={classes.input} disabled style={{ color: '#fff' }} />
          </Paper>
          <label> Default Content Pack URL </label>
          <Paper component="div" className={classes.createInput}>
            <InputBase name="defaultContentPackURL" className={classes.input} disabled style={{ color: '#fff' }} />
          </Paper>
        </Grid>
      </Grid>
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
