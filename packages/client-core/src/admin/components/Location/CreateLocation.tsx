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
import Switch from '@mui/material/Switch'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useAlertState } from '../../../common/services/AlertService'
import AlertMessage from '../../common/AlertMessage'
import { validateForm } from '../../common/validation/formValidation'
import { LocationService, useLocationState } from '../../services/LocationService'
import { useSceneState } from '../../services/SceneService'
import { useStyles } from '../../styles/ui'
import _ from 'lodash'

interface Props {
  open: boolean
  handleClose: any
  closeViewModel?: any
}

const CreateLocation = (props: Props) => {
  const { open, handleClose, closeViewModel } = props
  const classes = useStyles()
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

  const { t } = useTranslation()
  const adminLocationState = useLocationState()
  const locationTypes = adminLocationState.locationTypes
  const location = adminLocationState
  const adminScenes = useSceneState().scenes
  const alertState = useAlertState()
  const errorType = alertState.type
  const errorMessage = alertState.message

  const clearState = () => {
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

  React.useEffect(() => {
    if (location.created.value) {
      closeViewModel(false)
      clearState()
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

  const handleCloseWarning = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return
    }
    setOpenWarning(false)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    let temp = state.formErrors
    temp[name] = value.length < 2 ? `${_.upperFirst(name)} is required!` : ''
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
    setState({ ...state, formErrors: temp })
    if (validateForm(state, state.formErrors)) {
      LocationService.createLocation(data)
      clearState()
      closeViewModel(false)
    } else {
      setError('Please fill all required field')
      setOpenWarning(true)
    }
  }

  return (
    <React.Fragment>
      <Drawer anchor="right" classes={{ paper: classes.paperDrawer }} open={open} onClose={handleClose(false)}>
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
                MenuProps={{ classes: { paper: classes.selectPaper } }}
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
                MenuProps={{ classes: { paper: classes.selectPaper } }}
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
                    label={t('admin:components.locationModel.lbl-ve') as string}
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
                    label={t('admin:components.locationModel.lbl-ae') as string}
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
                    label={t('admin:components.locationModel.lbl-gme') as string}
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
                    label={t('admin:components.locationModel.lbl-se') as string}
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
                      label={t('admin:components.locationModel.lbl-fe') as string}
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
                      label={t('admin:components.locationModel.lbl-lobby') as string}
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
                      label={t('admin:components.locationModel.lbl-featured') as string}
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
            <Button
              onClick={() => {
                clearState()
                closeViewModel(false)
              }}
              className={classes.saveBtn}
            >
              Cancel
            </Button>
          </DialogActions>
          <AlertMessage open={openWarning} handleClose={handleCloseWarning} severity="warning" message={error} />
        </Container>
      </Drawer>
    </React.Fragment>
  )
}

export default CreateLocation
