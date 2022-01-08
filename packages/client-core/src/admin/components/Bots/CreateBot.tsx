import React from 'react'

import { Instance } from '@xrengine/common/src/interfaces/Instance'
import { Location } from '@xrengine/common/src/interfaces/Location'

import { Autorenew, Face, Save } from '@mui/icons-material'
import DeleteIcon from '@mui/icons-material/Delete'
import MuiAlert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import FormControl from '@mui/material/FormControl'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import InputBase from '@mui/material/InputBase'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction'
import ListItemText from '@mui/material/ListItemText'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Select from '@mui/material/Select'
import Snackbar from '@mui/material/Snackbar'
import Typography from '@mui/material/Typography'

import { useDispatch } from '../../../store'
import { useAuthState } from '../../../user/services/AuthService'
import { BotService } from '../../services/BotsService'
import { InstanceService } from '../../services/InstanceService'
import { useInstanceState } from '../../services/InstanceService'
import { LocationService } from '../../services/LocationService'
import { useLocationState } from '../../services/LocationService'
import { useStyle, useStylesForBots as useStyles } from './styles'
import { validateForm } from './validation'

interface Props {}

const Alert = (props) => {
  return <MuiAlert elevation={6} variant="filled" {...props} />
}

const CreateBot = (props: Props) => {
  const [command, setCommand] = React.useState({
    name: '',
    description: ''
  })
  const [commandData, setCommandData] = React.useState<{ name: string; description: string }[]>([])
  const [open, setOpen] = React.useState(false)
  const [error, setError] = React.useState('')

  const [formErrors, setFormErrors] = React.useState({
    name: '',
    description: '',
    location: ''
  })
  const [currentInstance, setCurrentIntance] = React.useState<Instance[]>([])
  const [state, setState] = React.useState({
    name: '',
    description: '',
    instance: '',
    location: ''
  })
  const adminInstanceState = useInstanceState()
  const dispatch = useDispatch()
  const classes = useStyles()
  const classx = useStyle()
  const authState = useAuthState()
  const user = authState.user
  const adminInstances = adminInstanceState
  const instanceData = adminInstances.instances
  const adminLocationState = useLocationState()
  const adminLocation = adminLocationState
  const locationData = adminLocation.locations
  React.useEffect(() => {
    if (user.id.value && adminInstances.updateNeeded.value) {
      InstanceService.fetchAdminInstances()
    }
    if (user?.id.value != null && adminLocation.updateNeeded.value === true) {
      LocationService.fetchAdminLocations()
    }
  }, [user.id.value, adminInstanceState.updateNeeded.value])

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }
    setOpen(false)
  }

  const data: Instance[] = []
  instanceData.value.forEach((element) => {
    data.push(element)
  })

  React.useEffect(() => {
    const instanceFilter = data.filter((el) => el.locationId === state.location)
    if (instanceFilter.length > 0) {
      setState({ ...state, instance: '' })
      setCurrentIntance(instanceFilter)
    }
  }, [state.location, adminInstanceState.instances.value.length])

  const temp: Location[] = []
  locationData.value.forEach((el) => {
    temp.push(el)
  })

  const handleSubmit = () => {
    const data = {
      name: state.name,
      instanceId: state.instance || null,
      userId: user.id.value,
      command: commandData,
      description: state.description,
      locationId: state.location
    }
    let temp = formErrors
    if (!state.name) {
      temp.name = "Name can't be empty"
    }
    if (!state.description) {
      temp.description = "Description can't be empty"
    }
    if (!state.location) {
      temp.location = "Location can't be empty"
    }

    setFormErrors(temp)
    if (validateForm(state, formErrors)) {
      BotService.createBotAsAdmin(data)
      setState({ name: '', description: '', instance: '', location: '' })
      setCommandData([])
      setCurrentIntance([])
    } else {
      setError('Please fill all required field')
      setOpen(true)
    }
  }

  const fetchAdminInstances = () => {
    InstanceService.fetchAdminInstances()
  }

  const fetchAdminLocations = () => {
    LocationService.fetchAdminLocations()
  }

  const handleInputChange = (e) => {
    const names = e.target.name
    const value = e.target.value
    let temp = formErrors
    switch (names) {
      case 'name':
        temp.name = value.length < 2 ? 'Name is required!' : ''
        break
      case 'description':
        temp.description = value.length < 2 ? 'Description is required!' : ''
        break
      case 'location':
        temp.location = value.length < 2 ? 'Location is required!' : ''
        break
      default:
        break
    }
    setFormErrors(temp)
    setState({ ...state, [names]: value })
  }

  return (
    <Card className={classes.rootLeft}>
      <Paper className={classes.header} style={{ display: 'flex' }}>
        <Typography className={classes.title}>
          <Face />
          <div className={classes.smFont}>Create new bot</div>
        </Typography>

        <Button variant="contained" disableElevation type="submit" className={classes.saveBtn} onClick={handleSubmit}>
          <Save className={classes.saveBtnIcon} /> save
        </Button>
      </Paper>
      <CardContent>
        <Typography className={classes.secondaryHeading} component="h1">
          Add more bots in the system.
        </Typography>
        <form style={{ marginTop: '40px' }}>
          <label>Name</label>
          <Paper component="div" className={formErrors.name.length > 0 ? classes.redBorder : classes.createInput}>
            <InputBase
              name="name"
              className={classes.input}
              placeholder="Enter name"
              style={{ color: '#fff' }}
              value={state.name}
              onChange={handleInputChange}
            />
          </Paper>

          <label>Description</label>
          <Paper
            component="div"
            className={formErrors.description.length > 0 ? classes.redBorder : classes.createInput}
          >
            <InputBase
              className={classes.input}
              name="description"
              placeholder="Enter description"
              style={{ color: '#fff' }}
              value={state.description}
              onChange={handleInputChange}
            />
          </Paper>

          <label>Location</label>
          <Grid container spacing={1}>
            <Grid item xs={10}>
              <Paper
                component="div"
                className={formErrors.location.length > 0 ? classes.redBorder : classes.createInput}
              >
                <FormControl fullWidth>
                  <Select
                    labelId="demo-controlled-open-select-label"
                    id="demo-controlled-open-select"
                    value={state.location}
                    fullWidth
                    onChange={handleInputChange}
                    name="location"
                    displayEmpty
                    className={classes.select}
                    MenuProps={{ classes: { paper: classx.selectPaper } }}
                  >
                    <MenuItem value="" disabled>
                      <em>Select location</em>
                    </MenuItem>
                    {temp.map((el) => (
                      <MenuItem value={el.id} key={el.id}>
                        {el.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Paper>
            </Grid>
            <Grid item xs={2} style={{ display: 'flex' }}>
              <div style={{ marginLeft: 'auto' }}>
                <IconButton onClick={fetchAdminLocations} size="large">
                  <Autorenew style={{ color: '#fff' }} />
                </IconButton>
              </div>
            </Grid>
          </Grid>

          <label>Instance</label>
          <Grid container spacing={1}>
            <Grid item xs={10}>
              <Paper component="div" className={classes.createInput}>
                <FormControl fullWidth disabled={currentInstance.length > 0 ? false : true}>
                  <Select
                    labelId="demo-controlled-open-select-label"
                    id="demo-controlled-open-select"
                    value={state.instance}
                    fullWidth
                    displayEmpty
                    onChange={handleInputChange}
                    className={classes.select}
                    name="instance"
                    MenuProps={{ classes: { paper: classx.selectPaper } }}
                  >
                    <MenuItem value="" disabled>
                      <em>Select instance</em>
                    </MenuItem>
                    {currentInstance.map((el) => (
                      <MenuItem value={el.id} key={el.id}>
                        {el.ipAddress}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Paper>
            </Grid>
            <Grid item xs={2} style={{ display: 'flex' }}>
              <div style={{ marginLeft: 'auto' }}>
                <IconButton onClick={fetchAdminInstances} size="large">
                  <Autorenew style={{ color: '#fff' }} />
                </IconButton>
              </div>
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={4}>
              <label>Command</label>
              <Paper component="div" className={classes.createInput}>
                <InputBase
                  className={classes.input}
                  placeholder="Enter command"
                  style={{ color: '#fff' }}
                  value={command.name}
                  onChange={(e) => setCommand({ ...command, name: e.target.value })}
                />
              </Paper>
            </Grid>
            <Grid item xs={8}>
              <label>Description</label>
              <Paper component="div" className={classes.createInput}>
                <InputBase
                  className={classes.input}
                  placeholder="Enter description"
                  style={{ color: '#fff' }}
                  value={command.description}
                  onChange={(e) => setCommand({ ...command, description: e.target.value })}
                />
              </Paper>
            </Grid>
          </Grid>

          <Button
            variant="contained"
            style={{ color: '#fff', background: '#3a4149', marginBottom: '20px', width: '100%' }}
            onClick={() => {
              if (command.name) {
                setCommandData([...commandData, command])
                setCommand({ name: '', description: '' })
              } else {
                setError('Fill in command is required!')
                setOpen(true)
              }
            }}
          >
            Add command
          </Button>
          <div className={commandData.length > 0 ? classes.alterContainer : classes.createAlterContainer}>
            {commandData.map((el, i) => {
              return (
                <List dense={true} key={i}>
                  <ListItem>
                    <ListItemText primary={`${i + 1}. /${el.name} --> ${el.description} `} />
                    <ListItemSecondaryAction>
                      <IconButton edge="end" aria-label="delete" size="large">
                        <DeleteIcon style={{ color: '#fff' }} />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
              )
            })}
          </div>
        </form>
      </CardContent>
      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleClose} severity="warning">
          {' '}
          {error}{' '}
        </Alert>
      </Snackbar>
    </Card>
  )
}

export default CreateBot
