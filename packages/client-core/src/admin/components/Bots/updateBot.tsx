import React, { useEffect, useState } from 'react'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import FormControl from '@mui/material/FormControl'
import InputBase from '@mui/material/InputBase'
import { Save, Autorenew } from '@mui/icons-material'
import { useLocationState } from '../../services/LocationService'
import { useInstanceState } from '../../services/InstanceService'
import { useDispatch } from '../../../store'
import { validateForm } from './validation'
import MuiAlert from '@mui/material/Alert'
import Snackbar from '@mui/material/Snackbar'
import { BotService } from '../../services/BotsService'
import { useAuthState } from '../../../user/services/AuthService'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import { InstanceService } from '../../services/InstanceService'
import { LocationService } from '../../services/LocationService'
import { useStyles } from '../../styles/ui'
import AlertMessage from '../../common/AlertMessage'

import { Instance } from '@xrengine/common/src/interfaces/Instance'

interface Props {
  open: boolean
  handleClose: () => void
  bot: any
}

const UpdateBot = (props: Props) => {
  const { open, handleClose, bot } = props
  const adminInstanceState = useInstanceState()
  const dispatch = useDispatch()
  const classes = useStyles()
  const [state, setState] = useState({
    name: '',
    description: '',
    instance: '',
    location: ''
  })
  const [formErrors, setFormErrors] = useState({
    name: '',
    description: '',
    location: ''
  })
  const [currentInstance, setCurrentIntance] = useState<Instance[]>([])
  const [openAlter, setOpenAlter] = useState(false)
  const [error, setError] = useState('')
  const adminLocation = useLocationState()
  const locationData = adminLocation.locations
  const adminInstances = adminInstanceState
  const instanceData = adminInstances.instances
  const user = useAuthState().user

  useEffect(() => {
    if (bot) {
      setState({
        name: bot?.name,
        description: bot?.description,
        instance: bot?.instance?.id || '',
        location: bot?.location?.id
      })
    }
  }, [bot])

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

  const data: Instance[] = []
  instanceData.value.forEach((element) => {
    data.push(element)
  })

  useEffect(() => {
    const instanceFilter = data.filter((el) => el.locationId === state.location)
    if (instanceFilter.length > 0) {
      setState({ ...state, instance: state.instance || '' })
      setCurrentIntance(instanceFilter)
    } else {
      setCurrentIntance([])
      setState({ ...state, instance: '' })
    }
  }, [state.location, adminInstanceState.instances.value.length])

  const handleUpdate = () => {
    const data = {
      name: state.name,
      instanceId: state.instance || null,
      userId: user.id.value,
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
      BotService.updateBotAsAdmin(bot.id, data)
      setState({ name: '', description: '', instance: '', location: '' })
      setCurrentIntance([])
      handleClose()
    } else {
      setError('Please fill all required field!')
      setOpenAlter(true)
    }
  }

  const fetchAdminInstances = () => {
    InstanceService.fetchAdminInstances()
  }

  const handleCloseAlter = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return
    }
    setOpenAlter(false)
  }

  const fetchAdminLocations = () => {
    LocationService.fetchAdminLocations()
  }

  return (
    <div>
      <Dialog
        open={open}
        aria-labelledby="form-dialog-title"
        classes={{ paper: classes.paperDialog }}
        onClose={handleClose}
      >
        <DialogTitle id="form-dialog-title">UPDATE BOT</DialogTitle>
        <DialogContent>
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
                <FormControl className={classes.createInput} fullWidth>
                  <Select
                    labelId="demo-controlled-open-select-label"
                    id="demo-controlled-open-select"
                    value={state.location}
                    fullWidth
                    onChange={handleInputChange}
                    name="location"
                    displayEmpty
                    className={classes.select}
                    MenuProps={{ classes: { paper: classes.selectPaper } }}
                  >
                    <MenuItem value="" disabled>
                      <em>Select location</em>
                    </MenuItem>
                    {locationData.value.map((el) => (
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
                <FormControl
                  className={classes.createInput}
                  fullWidth
                  disabled={currentInstance.length > 0 ? false : true}
                >
                  <Select
                    labelId="demo-controlled-open-select-label"
                    id="demo-controlled-open-select"
                    value={state.instance}
                    fullWidth
                    displayEmpty
                    onChange={handleInputChange}
                    className={classes.select}
                    name="instance"
                    MenuProps={{ classes: { paper: classes.selectPaper } }}
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
        </DialogContent>
        <DialogActions style={{ marginRight: '15px' }}>
          <Button
            variant="contained"
            disableElevation
            type="submit"
            className={classes.saveBtn}
            onClick={() => {
              setState({ name: '', description: '', instance: '', location: '' })
              setFormErrors({ name: '', description: '', location: '' })
              handleClose()
            }}
          >
            CANCEL
          </Button>
          <Button variant="contained" disableElevation type="submit" className={classes.saveBtn} onClick={handleUpdate}>
            <Save style={{ marginRight: '10px' }} /> save
          </Button>
        </DialogActions>
      </Dialog>

      <AlertMessage open={openAlter} handleClose={handleCloseAlter} severity="warning" message={error} />
    </div>
  )
}

export default UpdateBot
