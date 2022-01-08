import React from 'react'
import { useTranslation } from 'react-i18next'

import MuiAlert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import DialogActions from '@mui/material/DialogActions'
import DialogTitle from '@mui/material/DialogTitle'
import Drawer from '@mui/material/Drawer'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormGroup from '@mui/material/FormGroup'
import Grid from '@mui/material/Grid'
import InputBase from '@mui/material/InputBase'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Select from '@mui/material/Select'
import Snackbar from '@mui/material/Snackbar'
import Switch from '@mui/material/Switch'

import { useAlertState } from '../../../common/services/AlertService'
import { useDispatch } from '../../../store'
import { useLocationState } from '../../services/LocationService'
import { LocationService } from '../../services/LocationService'
import { useSceneState } from '../../services/SceneService'
import { validateUserForm } from '../Users/validation'
import { useLocationStyle, useLocationStyles } from './styles'

const Alert = (props) => {
  return <MuiAlert elevation={6} variant="filled" {...props} />
}

interface Props {
  open: boolean
  handleClose: any
  closeViewModel?: any
}

const CreateLocation = (props: Props) => {
  const { open, handleClose, closeViewModel } = props
  const classesx = useLocationStyle()
  const classes = useLocationStyles()
  const [openWarning, setOpenWarning] = React.useState(false)
  const [error, setError] = React.useState('')
  const [state, setState] = React.useState({
    name: '',
    maxUsers: 10,
    scene: '',
    type: 'private',
    videoEnabled: false,
    audioEnabled: false,
    screenSharingEnabled: false,
    faceStreamingEnabled: false,
    globalMediaEnabled: false,
    isLobby: false,
    isFeatured: false,
    formErrors: {
      name: '',
      maxUsers: '',
      scene: '',
      type: ''
    }
  })

  const dispatch = useDispatch()
  const { t } = useTranslation()
  const adminLocationState = useLocationState()
  const locationTypes = adminLocationState.locationTypes
  const location = adminLocationState
  const adminScenes = useSceneState().scenes
  const alertState = useAlertState()
  const errorType = alertState.type
  const errorMessage = alertState.message

  React.useEffect(() => {
    if (location.created.value) {
      closeViewModel(false)
      setState({
        ...state,
        name: '',
        maxUsers: 10,
        scene: '',
        type: 'private',
        videoEnabled: false,
        audioEnabled: false,
        screenSharingEnabled: false,
        faceStreamingEnabled: false,
        globalMediaEnabled: false,
        isLobby: false,
        isFeatured: false
      })
    }
  }, [location.created.value])

  React.useEffect(() => {
    if (errorType.value === 'error') {
      setError(errorMessage.value)
      setOpenWarning(true)
      setTimeout(() => {
        setOpenWarning(false)
      }, 5000)
    }
  }, [errorType.value, errorMessage.value])

  const handleCloseWarning = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }
    setOpenWarning(false)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    let temp = state.formErrors
    switch (name) {
      case 'name':
        temp.name = value.length < 2 ? 'Name is required!' : ''
        break
      case 'maxUsers':
        temp.maxUsers = value.length < 2 ? 'Max users is required!' : ''
        break
      case 'scene':
        temp.scene = value.length < 2 ? 'Scene is required!' : ''
        break
      case 'private':
        temp.type = value.length < 2 ? 'Private role is required!' : ''
        break
      default:
        break
    }
    setState({ ...state, [name]: value, formErrors: temp })
  }

  const handleSubmit = () => {
    const data = {
      name: state.name,
      sceneId: state.scene,
      maxUsersPerInstance: state.maxUsers,
      location_settings: {
        locationType: state.type,
        instanceMediaChatEnabled: state.globalMediaEnabled,
        audioEnabled: state.audioEnabled,
        screenSharingEnabled: state.screenSharingEnabled,
        faceStreamingEnabled: state.faceStreamingEnabled,
        videoEnabled: state.videoEnabled
      },
      isLobby: state.isLobby,
      isFeatured: state.isFeatured
    }
    const temp = state.formErrors
    if (!state.name) {
      temp.name = "Name can't be empty"
    }
    if (!state.maxUsers) {
      temp.maxUsers = "Max user can't be empty"
    }
    if (!state.scene) {
      temp.scene = "Scene can't be empty"
    }
    console.log(state, temp, { ...state, formErrors: temp })
    setState({ ...state, formErrors: temp })
    if (validateUserForm(state, state.formErrors)) {
      LocationService.createLocation(data)
      closeViewModel(false)
    } else {
      setError('Please fill all required field')
      setOpenWarning(true)
    }
  }

  return (
    <React.Fragment>
      <Drawer anchor="right" classes={{ paper: classesx.paper }} open={open} onClose={handleClose(false)}>
        <Container maxWidth="sm" className={classes.marginTp}>
          <DialogTitle id="form-dialog-title" className={classes.texAlign}>
            Create New Location
          </DialogTitle>
          <label>Name</label>
          <Paper component="div" className={state.formErrors.name.length > 0 ? classes.redBorder : classes.createInput}>
            <InputBase
              className={classes.input}
              name="name"
              placeholder="Enter name"
              style={{ color: '#fff' }}
              autoComplete="off"
              value={state.name}
              onChange={handleChange}
            />
          </Paper>
          <label>Max Users</label>
          <Paper
            component="div"
            className={state.formErrors.maxUsers.length > 0 ? classes.redBorder : classes.createInput}
          >
            <InputBase
              className={classes.input}
              name="maxUsers"
              placeholder="Enter max users"
              style={{ color: '#fff' }}
              autoComplete="off"
              type="number"
              value={state.maxUsers}
              onChange={handleChange}
            />
          </Paper>
          <label>Scene</label>
          <Paper
            component="div"
            className={state.formErrors.scene.length > 0 ? classes.redBorder : classes.createInput}
          >
            <FormControl fullWidth>
              <Select
                labelId="demo-controlled-open-select-label"
                id="demo-controlled-open-select"
                value={state.scene}
                fullWidth
                displayEmpty
                onChange={handleChange}
                className={classes.select}
                name="scene"
                MenuProps={{ classes: { paper: classesx.selectPaper } }}
              >
                <MenuItem value="" disabled>
                  <em>Select scene</em>
                </MenuItem>
                {adminScenes.value.map((el, i) => (
                  <MenuItem value={`${el.project}/${el.name}`} key={i}>
                    {el.name} ({el.project})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Paper>
          <label>Private</label>
          <Paper component="div" className={classes.createInput}>
            <FormControl fullWidth>
              <Select
                labelId="demo-controlled-open-select-label"
                id="demo-controlled-open-select"
                value={state.type}
                fullWidth
                displayEmpty
                onChange={handleChange}
                className={classes.select}
                name="type"
                MenuProps={{ classes: { paper: classesx.selectPaper } }}
              >
                <MenuItem value="" disabled>
                  <em>Select type</em>
                </MenuItem>
                {locationTypes.value.map((el) => (
                  <MenuItem value={el.type} key={el.type}>
                    {el.type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Paper>
          <Grid container spacing={5} className={classes.marginBottm}>
            <Grid item xs={6}>
              <FormGroup>
                <FormControl>
                  <FormControlLabel
                    color="primary"
                    control={
                      <Switch
                        checked={state.videoEnabled}
                        onChange={(e) => setState({ ...state, videoEnabled: e.target.checked })}
                        name="videoEnabled"
                      />
                    }
                    label={t('admin:components.locationModel.lbl-ve')}
                  />
                </FormControl>
              </FormGroup>
              <FormGroup>
                <FormControl>
                  <FormControlLabel
                    color="primary"
                    control={
                      <Switch
                        checked={state.audioEnabled}
                        onChange={(e) => setState({ ...state, audioEnabled: e.target.checked })}
                        name="audioEnabled"
                      />
                    }
                    label={t('admin:components.locationModel.lbl-ae')}
                  />
                </FormControl>
              </FormGroup>
              <FormGroup>
                <FormControl>
                  <FormControlLabel
                    color="primary"
                    control={
                      <Switch
                        checked={state.globalMediaEnabled}
                        onChange={(e) => setState({ ...state, globalMediaEnabled: e.target.checked })}
                        name="globalMediaEnabled"
                      />
                    }
                    label={t('admin:components.locationModel.lbl-gme')}
                  />
                </FormControl>
              </FormGroup>
              <FormGroup>
                <FormControl>
                  <FormControlLabel
                    color="primary"
                    control={
                      <Switch
                        checked={state.screenSharingEnabled}
                        onChange={(e) => setState({ ...state, screenSharingEnabled: e.target.checked })}
                        name="screenSharingEnabled"
                      />
                    }
                    label={t('admin:components.locationModel.lbl-se')}
                  />
                </FormControl>
              </FormGroup>
            </Grid>
            <Grid item xs={6} style={{ display: 'flex' }}>
              <div style={{ marginLeft: 'auto' }}>
                <FormGroup>
                  <FormControl>
                    <FormControlLabel
                      color="primary"
                      control={
                        <Switch
                          checked={state.faceStreamingEnabled}
                          onChange={(e) => setState({ ...state, faceStreamingEnabled: e.target.checked })}
                          name="faceStreamingEnabled"
                        />
                      }
                      label={t('admin:components.locationModel.lbl-fe')}
                    />
                  </FormControl>
                </FormGroup>
                <FormGroup>
                  <FormControl>
                    <FormControlLabel
                      color="primary"
                      control={
                        <Switch
                          checked={state.isLobby}
                          onChange={(e) => setState({ ...state, isLobby: e.target.checked })}
                          name="isLobby"
                        />
                      }
                      label={t('admin:components.locationModel.lbl-lobby')}
                    />
                  </FormControl>
                </FormGroup>
                <FormGroup>
                  <FormControl>
                    <FormControlLabel
                      color="primary"
                      control={
                        <Switch
                          checked={state.isFeatured}
                          onChange={(e) => setState({ ...state, isFeatured: e.target.checked })}
                          name="isFeatured"
                        />
                      }
                      label={t('admin:components.locationModel.lbl-featured')}
                    />
                  </FormControl>
                </FormGroup>
              </div>
            </Grid>
          </Grid>
          <DialogActions>
            <Button className={classes.saveBtn} onClick={handleSubmit}>
              Submit
            </Button>
            <Button onClick={handleClose(false)} className={classes.saveBtn}>
              Cancel
            </Button>
          </DialogActions>
          <Snackbar
            open={openWarning}
            autoHideDuration={6000}
            onClose={handleClose}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          >
            <Alert onClose={handleCloseWarning} severity="warning">
              {' '}
              {error}{' '}
            </Alert>
          </Snackbar>
        </Container>
      </Drawer>
    </React.Fragment>
  )
}

export default CreateLocation
