import React from 'react'
import { useTranslation } from 'react-i18next'

import { Edit, Save } from '@mui/icons-material'
import MuiAlert from '@mui/material/Alert'
import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Container from '@mui/material/Container'
import DialogActions from '@mui/material/DialogActions'
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
import Typography from '@mui/material/Typography'

import { useDispatch } from '../../../store'
import { useAuthState } from '../../../user/services/AuthService'
import { useLocationState } from '../../services/LocationService'
import { LocationService } from '../../services/LocationService'
import { useSceneState } from '../../services/SceneService'
import { validateUserForm } from '../Users/validation'
import { useLocationStyle, useLocationStyles } from './styles'

interface Props {
  openView: any
  closeViewModel: any
  locationAdmin: any

  authState?: any
}

const Alert = (props) => {
  return <MuiAlert elevation={6} variant="filled" {...props} />
}

const ViewLocation = (props: Props) => {
  const { openView, closeViewModel, locationAdmin } = props
  const dispatch = useDispatch()
  const classex = useLocationStyle()
  const classes = useLocationStyles()
  const [editMode, setEditMode] = React.useState(false)
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
  const [location, setLocation] = React.useState<any>('')
  const [error, setError] = React.useState('')
  const [openWarning, setOpenWarning] = React.useState(false)
  const { t } = useTranslation()
  const adminScenes = useSceneState().scenes
  const locationTypes = useLocationState().locationTypes
  const user = useAuthState().user // user initialized by getting value from authState object.
  const scopes = user?.scopes?.value || []
  let isLocationWrite = false

  for (const scope of scopes) {
    if (scope.type.split(':')[0] === 'location' && scope.type.split(':')[1] === 'write') {
      isLocationWrite = true
      break
    }
  }

  React.useEffect(() => {
    if (locationAdmin) {
      setLocation(locationAdmin)
      setState({
        ...state,
        name: locationAdmin.name,
        maxUsers: locationAdmin.maxUsersPerInstance,
        scene: locationAdmin.sceneId,
        type: locationAdmin.location_setting.locationType,
        videoEnabled: locationAdmin.location_setting.videoEnabled,
        audioEnabled: locationAdmin.location_setting.audioEnabled,
        screenSharingEnabled: locationAdmin.location_setting.screenSharingEnabled,
        faceStreamingEnabled: locationAdmin.location_setting.faceStreamingEnabled,
        globalMediaEnabled: locationAdmin.location_setting.instanceMediaChatEnabled,
        isLobby: locationAdmin.isLobby,
        isFeatured: locationAdmin.isFeatured
      })
    }
  }, [locationAdmin])

  const handleInputChange = (e) => {
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
    const locationData = {
      name: state.name,
      maxUsersPerInstance: state.maxUsers,
      sceneId: state.scene,
      location_setting: {
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

    let temp = state.formErrors
    if (!state.name) {
      temp.name = "Name can't be empty"
    }
    if (!state.maxUsers) {
      temp.maxUsers = "Maximum users can't be empty"
    }
    if (!state.scene) {
      temp.scene = "Scene can't be empty"
    }
    if (!state.type) {
      temp.scene = "Type can't be empty"
    }
    setState({ ...state, formErrors: temp })
    if (validateUserForm(state, state.formErrors)) {
      LocationService.patchLocation(location.id, locationData)
      setState({
        ...state,
        name: '',
        maxUsers: 10,
        type: '',
        scene: ''
      })
      setEditMode(false)
      closeViewModel(false)
    } else {
      setError('Please fill all required field')
      setOpenWarning(true)
    }
  }

  const handleCloseWarning = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }
    setOpenWarning(false)
  }

  const handleCloseDrawe = () => {
    setError('')
    setOpenWarning(false)
    closeViewModel(false)
    setState({ ...state, formErrors: { ...state.formErrors, name: '', maxUsers: '', scene: '', type: '' } })
  }

  return (
    <React.Fragment>
      <Drawer anchor="right" open={openView} onClose={() => handleCloseDrawe()} classes={{ paper: classex.paper }}>
        <Paper elevation={0} className={classes.rootPaper}>
          <Container maxWidth="sm">
            <div className={classes.locationTitle}>
              <Typography variant="h4" component="span">
                {location?.name}
              </Typography>
            </div>
            <div className={classes.locationSubTitle}>
              {location.isFeatured && (
                <Chip
                  style={{ marginLeft: '5px' }}
                  avatar={<Avatar>F</Avatar>}
                  label={t('admin:components.index.featured')}
                  //  onClick={handleClick}
                />
              )}
              {location.isLobby && <Chip avatar={<Avatar>L</Avatar>} label={t('admin:components.index.lobby')} />}
              {/* <Paper className={classes.smpd} elevation={0}>
                        <Typography variant="h6" component="span" >{location.createdAt ? `Created At: ${location.createdAt.slice(0, 10)}`:""}</Typography>
                        </Paper> */}
            </div>
          </Container>
        </Paper>

        {editMode ? (
          <Container maxWidth="sm">
            <div className={classes.mt10}>
              <Typography variant="h4" component="h4" className={`${classes.mb10} ${classes.headingFont}`}>
                {' '}
                Update location Information{' '}
              </Typography>
              <label>Name</label>
              <Paper
                component="div"
                className={state.formErrors.name.length > 0 ? classes.redBorder : classes.createInput}
              >
                <InputBase
                  className={classes.input}
                  name="name"
                  placeholder="Enter name"
                  style={{ color: '#fff' }}
                  autoComplete="off"
                  value={state.name}
                  onChange={handleInputChange}
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
                  onChange={handleInputChange}
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
                    onChange={handleInputChange}
                    className={classes.select}
                    name="scene"
                    MenuProps={{ classes: { paper: classex.selectPaper } }}
                  >
                    <MenuItem value="" disabled>
                      <em>Select scene</em>
                    </MenuItem>
                    {adminScenes.value.map((el, index) => (
                      <MenuItem value={`${el.project}/${el.name}`} key={index}>{`${el.name} (${el.project})`}</MenuItem>
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
                    onChange={handleInputChange}
                    className={classes.select}
                    name="type"
                    MenuProps={{ classes: { paper: classex.selectPaper } }}
                  >
                    <MenuItem value="" disabled>
                      <em>Select type</em>
                    </MenuItem>
                    {locationTypes.value.map((el, index) => (
                      <MenuItem value={el.type} key={index}>
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
                <Grid item xs={6}>
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
            </div>
          </Container>
        ) : (
          <React.Fragment>
            {' '}
            <Paper elevation={3} className={classes.middlePaper}>
              <Grid container spacing={2} className={classes.pdl}>
                <Grid item xs={5} className={classes.typo}>
                  <Typography variant="h5" component="h5" className={`${classes.locationOtherInfo} ${classes.mb}`}>
                    Max Users
                  </Typography>
                  <Typography variant="h5" component="h5" className={`${classes.locationOtherInfo} ${classes.mb}`}>
                    Scene ID
                  </Typography>
                  <Typography variant="h5" component="h5" className={classes.locationOtherInfo}>
                    Slugy Name
                  </Typography>
                </Grid>
                <Grid item xs={7} className={classes.typo}>
                  <Typography variant="h5" component="h5" className={`${classes.locationOtherInfo} ${classes.mb}`}>
                    {(location as any)?.maxUsersPerInstance || <span className={classes.spanNone}>None</span>}
                  </Typography>
                  <Typography variant="h5" component="h5" className={`${classes.locationOtherInfo} ${classes.mb}`}>
                    {location?.sceneId || <span className={classes.spanNone}>None</span>}
                  </Typography>
                  <Typography variant="h5" component="h5" className={`${classes.locationOtherInfo}`}>
                    {location?.slugifiedName || <span className={classes.spanNone}>None</span>}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
            <Typography
              variant="h4"
              component="h4"
              className={`${classes.mb20px} ${classes.spacing} ${classes.typoFont}`}
            >
              Location Settings{' '}
            </Typography>
            <Grid container spacing={2} className={classes.pdlarge}>
              <Grid item xs={6}>
                <Typography variant="h6" component="h6" className={classes.mb10}>
                  Location Type:
                </Typography>
                {/* <Typography variant="h6" component="h6" className={classes.mb10}>Updated At:</Typography> */}
                <Typography variant="h6" component="h6" className={classes.mb10}>
                  Video Enabled:
                </Typography>
                <Typography variant="h6" component="h6" className={classes.mb10}>
                  Audio Enabled:
                </Typography>
                <Typography variant="h6" component="h6" className={classes.mb10}>
                  Face Streaming Enabled:
                </Typography>
                <Typography variant="h6" component="h6" className={classes.mb10}>
                  Screen Sharing Enabled:
                </Typography>
                <Typography variant="h6" component="h6" className={classes.mb10}>
                  Media Chat Enabled:
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="h6" component="h6" className={classes.mb10}>
                  {location?.location_setting?.locationType || <span className={classes.spanNone}>None</span>}
                </Typography>
                {/* <Typography variant="h6" component="h6" className={classes.mb10}>{location?.location_setting?.updatedAt.slice(0,10) || <span className={classes.spanNone}>None</span>}</Typography> */}
                <Typography variant="h5" component="h5" className={classes.mb10}>
                  <span className={classes.spanNone}>{location?.location_setting?.videoEnabled ? 'Yes' : 'No'}</span>
                </Typography>
                <Typography variant="h5" component="h5" className={classes.mb10}>
                  <span className={classes.spanNone}>{location?.location_setting?.audioEnabled ? 'Yes' : 'No'}</span>
                </Typography>
                <Typography variant="h5" component="h5" className={classes.mb10}>
                  <span className={classes.spanNone}>
                    {location?.location_setting?.faceStreamingEnabled ? 'Yes' : 'No'}
                  </span>
                </Typography>
                <Typography variant="h5" component="h5" className={classes.mb10}>
                  <span className={classes.spanNone}>
                    {location?.location_setting?.screenSharingEnabled ? 'Yes' : 'No'}
                  </span>
                </Typography>
                <Typography variant="h5" component="h5" className={classes.mb10}>
                  <span className={classes.spanNone}>
                    {location?.location_setting?.instanceMediaChatEnabled ? 'Yes' : 'No'}
                  </span>
                </Typography>
              </Grid>
            </Grid>
          </React.Fragment>
        )}
        <DialogActions className={classes.mb10}>
          {editMode ? (
            <div className={classes.marginTpM}>
              <Button onClick={handleSubmit} className={classes.saveBtn}>
                <span style={{ marginRight: '15px' }}>
                  <Save />
                </span>{' '}
                Submit
              </Button>
              <Button
                className={classes.saveBtn}
                onClick={() => {
                  setEditMode(false)
                }}
              >
                CANCEL
              </Button>
            </div>
          ) : (
            <div className={classes.marginTpM}>
              <Button
                disabled={!isLocationWrite}
                className={classes.saveBtn}
                onClick={() => {
                  setEditMode(true)
                }}
              >
                EDIT
              </Button>
              <Button onClick={() => handleCloseDrawe()} className={classes.saveBtn}>
                CANCEL
              </Button>
            </div>
          )}
        </DialogActions>
        <Snackbar
          open={openWarning}
          autoHideDuration={6000}
          onClose={handleCloseWarning}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseWarning} severity="warning">
            {' '}
            {error}{' '}
          </Alert>
        </Snackbar>
      </Drawer>
    </React.Fragment>
  )
}

export default ViewLocation
