import React from 'react'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import { useStyle, useStylesForBots as useStyles } from './styles'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import Paper from '@material-ui/core/Paper'
import FormControl from '@material-ui/core/FormControl'
import InputBase from '@material-ui/core/InputBase'
import { Save, Autorenew } from '@material-ui/icons'
import { useLocationState } from '../../state/LocationState'
import { useInstanceState } from '../../state/InstanceState'
import { useDispatch } from '../../../store'
import { validateForm } from './validation'
import MuiAlert from '@material-ui/lab/Alert'
import Snackbar from '@material-ui/core/Snackbar'
import { BotService } from '../../state/BotsService'
import { useAuthState } from '../../../user/state/AuthState'
import Grid from '@material-ui/core/Grid'
import IconButton from '@material-ui/core/IconButton'
import { InstanceService } from '../../state/InstanceService'
import { LocationService } from '../../state/LocationService'

import { Instance } from '@standardcreative/common/src/interfaces/Instance'

interface Props {
  open: boolean
  handleClose: () => void
  bot: any
}

const Alert = (props) => {
  return <MuiAlert elevation={6} variant="filled" {...props} />
}

const UpdateBot = (props: Props) => {
  const { open, handleClose, bot } = props
  const adminInstanceState = useInstanceState()
  const dispatch = useDispatch()
  const classx = useStyle()
  const classes = useStyles()
  const [state, setState] = React.useState({
    name: '',
    description: '',
    instance: '',
    location: ''
  })
  const [formErrors, setFormErrors] = React.useState({
    name: '',
    description: '',
    location: ''
  })
  const [currentInstance, setCurrentIntance] = React.useState<Instance[]>([])
  const [openAlter, setOpenAlter] = React.useState(false)
  const [error, setError] = React.useState('')
  const adminLocation = useLocationState().locations
  const locationData = adminLocation.locations
  const adminInstances = adminInstanceState.instances
  const instanceData = adminInstances.instances
  const user = useAuthState().user

  React.useEffect(() => {
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

  React.useEffect(() => {
    if (bot) {
      const instanceFilter = data.filter((el) => el.locationId === state.location)
      if (instanceFilter.length > 0) {
        setState({ ...state, instance: state.instance || '' })
        setCurrentIntance(instanceFilter)
      }
    }
  }, [state.location, bot, adminInstanceState.instances.instances.value])

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

  const handleCloseAlter = (event, reason) => {
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
        classes={{ paper: classx.dialoPaper }}
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
                    MenuProps={{ classes: { paper: classx.selectPaper } }}
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
                <IconButton onClick={fetchAdminLocations}>
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
                <IconButton onClick={fetchAdminInstances}>
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
      <Snackbar
        open={openAlter}
        autoHideDuration={6000}
        onClose={handleCloseAlter}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseAlter} severity="warning">
          {' '}
          {error}{' '}
        </Alert>
      </Snackbar>
    </div>
  )
}

export default UpdateBot
