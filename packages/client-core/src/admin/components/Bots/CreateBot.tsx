import React from 'react'
import InputBase from '@mui/material/InputBase'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import DeleteIcon from '@mui/icons-material/Delete'
import List from '@mui/material/List'

import ListItem from '@mui/material/ListItem'
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction'
import ListItemText from '@mui/material/ListItemText'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import { Autorenew, Face, Save } from '@mui/icons-material'
import { useStyles } from '../../styles/ui'

import { InstanceService } from '../../services/InstanceService'
import { useInstanceState } from '../../services/InstanceService'
import { LocationService } from '../../services/LocationService'
import { useDispatch } from '../../../store'
import { useAuthState } from '../../../user/services/AuthService'
import { BotService } from '../../services/BotsService'
import { useLocationState } from '../../services/LocationService'
import { validateForm } from './validation'
import { Location } from '@xrengine/common/src/interfaces/Location'
import { Instance } from '@xrengine/common/src/interfaces/Instance'
import AlertMessage from '../../common/AlertMessage'
import AddCommand from '../../common/AddCommand'
import InputText from '../../common/InputText'
import InputSelect from '../../common/InputSelect'

interface Props {}
interface Menu {
  value: string
  label: string
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
  const authState = useAuthState()
  const user = authState.user
  const adminInstances = adminInstanceState
  const instanceData = adminInstances.instances
  const adminLocationState = useLocationState()
  const adminLocation = adminLocationState
  const locationData = adminLocation.locations

  const handleChangeCommand = (e) => {
    const { name, value } = e.target
    setCommand({ ...command, [name]: value })
  }

  const addCommandData = (command) => {
    if (command.name) {
      setCommandData([...commandData, command])
      setCommand({ name: '', description: '' })
    } else {
      setError('Fill in command is required!')
      setOpen(true)
    }
  }

  React.useEffect(() => {
    if (user.id.value && adminInstances.updateNeeded.value) {
      InstanceService.fetchAdminInstances()
    }
    if (user?.id.value != null && adminLocation.updateNeeded.value === true) {
      LocationService.fetchAdminLocations()
    }
  }, [user.id.value, adminInstanceState.updateNeeded.value])

  const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
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
    } else {
      setCurrentIntance([])
    }
  }, [state.location, adminInstanceState.instances.value.length])

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

  const locationMenu: Menu[] = []
  locationData.value.forEach((el) => {
    locationMenu.push({
      value: el.id,
      label: el.name
    })
  })

  const instanceMenu: Menu[] = []
  currentInstance.forEach((el) => {
    instanceMenu.push({
      value: el.id,
      label: el.ipAddress
    })
  })

  return (
    <Card className={classes.botRootLeft}>
      <Paper className={classes.botHeader} style={{ display: 'flex' }}>
        <Typography className={classes.botTitle}>
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
          <InputText
            name="name"
            handleInputChange={handleInputChange}
            value={state.name}
            formErrors={formErrors.name}
          />

          <InputText
            name="description"
            handleInputChange={handleInputChange}
            value={state.description}
            formErrors={formErrors.description}
          />

          <label>Location</label>
          <Grid container spacing={1}>
            <Grid item xs={10}>
              <InputSelect
                formErrors={formErrors.location}
                value={state.location}
                handleInputChange={handleInputChange}
                name="location"
                menu={locationMenu}
              />
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
              <InputSelect
                formErrors={formErrors.location}
                value={state.instance}
                handleInputChange={handleInputChange}
                name="instance"
                menu={instanceMenu}
              />
            </Grid>
            <Grid item xs={2} style={{ display: 'flex' }}>
              <div style={{ marginLeft: 'auto' }}>
                <IconButton onClick={fetchAdminInstances} size="large">
                  <Autorenew style={{ color: '#fff' }} />
                </IconButton>
              </div>
            </Grid>
          </Grid>

          <AddCommand
            command={command}
            handleChangeCommand={handleChangeCommand}
            addCommandData={addCommandData}
            commandData={commandData}
          />
        </form>
      </CardContent>
      <AlertMessage open={open} handleClose={handleClose} severity="warning" message={error} />
    </Card>
  )
}

export default CreateBot
