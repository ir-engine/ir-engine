import React from 'react'
import InputBase from '@material-ui/core/InputBase'
import Button from '@material-ui/core/Button'
import IconButton from '@material-ui/core/IconButton'
import DeleteIcon from '@material-ui/icons/Delete'
import List from '@material-ui/core/List'
import { Dispatch, bindActionCreators } from 'redux'
import ListItem from '@material-ui/core/ListItem'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import ListItemText from '@material-ui/core/ListItemText'
import { useStylesForBots as useStyles, useStyle } from './styles'
import CardContent from '@material-ui/core/CardContent'
import Grid from '@material-ui/core/Grid'
import Card from '@material-ui/core/Card'
import Typography from '@material-ui/core/Typography'
import Paper from '@material-ui/core/Paper'
import { Autorenew, Face, Save } from '@material-ui/icons'
import MenuItem from '@material-ui/core/MenuItem'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'
import { selectAdminInstanceState } from '../../reducers/admin/instance/selector'
import { fetchAdminInstances } from '../../reducers/admin/instance/service'
import { fetchAdminLocations } from '../../reducers/admin/location/service'
import { connect } from 'react-redux'
import { selectAuthState } from '../../../user/reducers/auth/selector'
import MuiAlert from '@material-ui/lab/Alert'
import Snackbar from '@material-ui/core/Snackbar'
import { createBotAsAdmin } from '../../reducers/admin/bots/service'
import { selectAdminLocationState } from '../../reducers/admin/location/selector'
import { validateForm } from './validation'

interface Props {
  fetchAdminInstances?: any
  adminInstanceState?: any
  authState?: any
  createBotAsAdmin?: any
  adminLocationState?: any
  fetchAdminLocations?: any
}

const mapStateToProps = (state: any): any => {
  return {
    adminInstanceState: selectAdminInstanceState(state),
    authState: selectAuthState(state),
    adminLocationState: selectAdminLocationState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  fetchAdminInstances: bindActionCreators(fetchAdminInstances, dispatch),
  createBotAsAdmin: bindActionCreators(createBotAsAdmin, dispatch),
  fetchAdminLocations: bindActionCreators(fetchAdminLocations, dispatch)
})

const Alert = (props) => {
  return <MuiAlert elevation={6} variant="filled" {...props} />
}

const CreateBot = (props: Props) => {
  const {
    adminInstanceState,
    authState,
    fetchAdminInstances,
    createBotAsAdmin,
    fetchAdminLocations,
    adminLocationState
  } = props
  const [command, setCommand] = React.useState({
    name: '',
    description: ''
  })
  const [commandData, setCommandData] = React.useState([])
  const [open, setOpen] = React.useState(false)
  const [error, setError] = React.useState('')
  const [formErrors, setFormErrors] = React.useState({
    name: '',
    description: '',
    location: ''
  })
  const [currentInstance, setCurrentIntance] = React.useState([])
  const [state, setState] = React.useState({
    name: '',
    description: '',
    instance: '',
    location: ''
  })
  const classes = useStyles()
  const classx = useStyle()
  const user = authState.get('user')
  const adminInstances = adminInstanceState.get('instances')
  const instanceData = adminInstances.get('instances')
  const adminLocation = adminLocationState.get('locations')
  const locationData = adminLocation.get('locations')
  React.useEffect(() => {
    if (user.id && adminInstances.get('updateNeeded')) {
      fetchAdminInstances()
    }
    if (user?.id != null && adminLocation.get('updateNeeded') === true) {
      fetchAdminLocations()
    }
  }, [user, adminInstanceState])

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }
    setOpen(false)
  }

  const data = []
  instanceData.forEach((element) => {
    data.push(element)
  })

  React.useEffect(() => {
    const instanceFilter = data.filter((el) => el.location.id === state.location)
    if (instanceFilter.length > 0) {
      setState({ ...state, instance: '' })
      setCurrentIntance(instanceFilter)
    }
  }, [state.location, adminInstanceState])

  const temp = []
  locationData.forEach((el) => {
    temp.push(el)
  })

  const handleSubmit = () => {
    const data = {
      name: state.name,
      instanceId: state.instance || null,
      userId: user.id,
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
      createBotAsAdmin(data)
      setState({ name: '', description: '', instance: '', location: '' })
      setCommandData([])
      setCurrentIntance([])
    } else {
      setError('Please fill all required field')
      setOpen(true)
    }
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
          <Face style={{ paddingTop: '5px' }} /> <span style={{ marginLeft: '10px' }}> Create new bot </span>
        </Typography>

        <Button variant="contained" disableElevation type="submit" className={classes.saveBtn} onClick={handleSubmit}>
          <Save style={{ marginRight: '10px' }} /> save
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
                <IconButton onClick={() => fetchAdminLocations()}>
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
                <IconButton onClick={() => fetchAdminInstances()}>
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
            fullWidth={true}
            style={{ color: '#fff', background: '#3a4149', marginBottom: '20px' }}
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
                      <IconButton edge="end" aria-label="delete">
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

export default connect(mapStateToProps, mapDispatchToProps)(CreateBot)
