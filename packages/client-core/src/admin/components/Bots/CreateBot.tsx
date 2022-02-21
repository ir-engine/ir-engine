import { Autorenew, Face, Save } from '@mui/icons-material'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import { CreateBotAsAdmin } from '@xrengine/common/src/interfaces/AdminBot'
import { Instance } from '@xrengine/common/src/interfaces/Instance'
import _ from 'lodash'
import React, { useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { useDispatch } from '../../../store'
import { useAuthState } from '../../../user/services/AuthService'
import AddCommand from '../../common/AddCommand'
import AlertMessage from '../../common/AlertMessage'
import { useFetchAdminInstance } from '../../common/hooks/Instance.hooks'
import { useFetchAdminLocations } from '../../common/hooks/Location.hooks'
import InputSelect from '../../common/InputSelect'
import InputText from '../../common/InputText'
import { validateForm } from '../../common/validation/formValidation'
import { BotService } from '../../services/BotsService'
import { InstanceService, useInstanceState } from '../../services/InstanceService'
import { LocationService, useLocationState } from '../../services/LocationService'
import { useStyles } from '../../styles/ui'

interface Menu {
  value: string
  label: string
}

const CreateBot = () => {
  const [command, setCommand] = useState({
    id: '',
    name: '',
    description: ''
  })
  const [commandData, setCommandData] = useState<{ id: string; name: string; description: string }[]>([])
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')

  const [formErrors, setFormErrors] = useState({
    name: '',
    description: '',
    location: ''
  })
  const [currentInstance, setCurrentIntance] = useState<Instance[]>([])
  const [state, setState] = useState({
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

  //Call custom hooks
  useFetchAdminInstance(user, adminInstanceState, InstanceService)
  useFetchAdminLocations(user, adminLocationState, LocationService)

  const handleChangeCommand = (e) => {
    const { name, value } = e.target
    setCommand({ ...command, id: uuidv4(), [name]: value })
  }

  const addCommandData = (command) => {
    if (command.name) {
      const found = commandData.find((el) => el.name === command.name)
      if (found) {
        setError('Command should be unique')
        setOpen(true)
      } else {
        setCommandData([...commandData, command])
        setCommand({ id: '', name: '', description: '' })
      }
    } else {
      setError('Fill in command is required!')
      setOpen(true)
    }
  }

  const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return
    }
    setOpen(false)
  }

  const data: Instance[] = instanceData.value.map((element) => {
    return element
  })

  useEffect(() => {
    const instanceFilter = data.filter((el) => el.locationId === state.location)
    if (instanceFilter.length > 0) {
      setState({ ...state, instance: '' })
      setCurrentIntance(instanceFilter)
    } else {
      setCurrentIntance([])
    }
  }, [state.location, adminInstanceState.instances.value.length])

  const handleSubmit = () => {
    const data: CreateBotAsAdmin = {
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

  const removeCommand = (id) => {
    const data = commandData.filter((el) => el.id !== id)
    setCommandData(data)
  }

  const handleInputChange = (e) => {
    const names = e.target.name
    const value = e.target.value
    let temp = formErrors
    temp[names] = value.length < 2 ? `${_.upperFirst(names)} is required` : ''
    setFormErrors(temp)
    setState({ ...state, [names]: value })
  }

  const locationMenu: Menu[] = locationData.value.map((el) => {
    return {
      value: el.id,
      label: el.name
    }
  })

  const instanceMenu: Menu[] = currentInstance.map((el) => {
    return {
      value: el.id,
      label: el.ipAddress
    }
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
            removeCommand={removeCommand}
          />
        </form>
      </CardContent>
      <AlertMessage open={open} handleClose={handleClose} severity="warning" message={error} />
    </Card>
  )
}

export default CreateBot
