import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { LocationFetched } from '@xrengine/common/src/interfaces/Location'

import { Save } from '@mui/icons-material'
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
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'

import { useAuthState } from '../../../user/services/AuthService'
import AlertMessage from '../../common/AlertMessage'
import { validateForm } from '../../common/validation/formValidation'
import { LocationService, useLocationState } from '../../services/LocationService'
import { useSceneState } from '../../services/SceneService'
import styles from '../../styles/admin.module.scss'
import { useStyles } from '../../styles/ui'

interface Props {
  openView: boolean
  closeViewModel: (open: boolean) => void
  locationAdmin?: LocationFetched
}

const ViewLocation = (props: Props) => {
  const { openView, closeViewModel, locationAdmin } = props
  const classes = useStyles()
  const [editMode, setEditMode] = useState(false)
  const [state, setState] = useState({
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
  const [location, setLocation] = useState<any>('')
  const [error, setError] = useState('')
  const [openWarning, setOpenWarning] = useState(false)
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

  useEffect(() => {
    if (locationAdmin) {
      setLocation(locationAdmin)
      setState({
        ...state,
        name: locationAdmin.name,
        maxUsers: locationAdmin.maxUsersPerInstance,
        scene: locationAdmin.sceneId,
        type: locationAdmin?.location_setting?.locationType,
        videoEnabled: locationAdmin?.location_setting?.videoEnabled,
        audioEnabled: locationAdmin?.location_setting?.audioEnabled,
        screenSharingEnabled: locationAdmin?.location_setting?.screenSharingEnabled,
        faceStreamingEnabled: locationAdmin?.location_setting?.faceStreamingEnabled,
        globalMediaEnabled: locationAdmin?.location_setting?.instanceMediaChatEnabled,
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
        temp.name = value.length < 2 ? t('admin:components.locationModel.nameRequired') : ''
        break
      case 'maxUsers':
        temp.maxUsers = value.length < 2 ? t('admin:components.locationModel.maxUsersRequired') : ''
        break
      case 'scene':
        temp.scene = value.length < 2 ? t('admin:components.locationModel.sceneRequired') : ''
        break
      case 'type':
        temp.type = value.length < 2 ? t('admin:components.locationModel.privateRoleRequired') : ''
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

    let temp = state.formErrors
    if (!state.name) {
      temp.name = t('admin:components.locationModel.nameCantEmpty')
    }
    if (!state.maxUsers) {
      temp.maxUsers = t('admin:components.locationModel.maxUserCantEmpty')
    }
    if (!state.scene) {
      temp.scene = t('admin:components.locationModel.sceneCantEmpty')
    }
    if (!state.type) {
      temp.type = t('admin:components.locationModel.typeCantEmpty')
    }
    setState({ ...state, formErrors: temp })
    if (validateForm(state, state.formErrors)) {
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
      setError(t('admin:components.locationModel.fillRequiredFields'))
      setOpenWarning(true)
    }
  }

  const handleCloseWarning = (event?: React.SyntheticEvent | Event, reason?: string) => {
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
      <Drawer anchor="right" open={openView} onClose={() => handleCloseDrawe()} classes={{ paper: styles.paperDrawer }}>
        <Paper elevation={0} className={classes.rootPaper}>
          {location && (
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
          )}
        </Paper>

        {editMode ? (
          <Container maxWidth="sm">
            <div className={classes.mt10}>
              <Typography variant="h4" component="h4" className={`${classes.mb10} ${classes.headingFont}`}>
                {t('admin:components.locationModel.updateLocationInfo')}{' '}
              </Typography>
              <label>{t('admin:components.locationModel.lbl-name')}</label>
              <Paper
                component="div"
                className={state.formErrors.name.length > 0 ? classes.redBorder : classes.createInput}
              >
                <InputBase
                  className={classes.input}
                  name="name"
                  placeholder={t('admin:components.locationModel.enterName')}
                  style={{ color: '#fff' }}
                  autoComplete="off"
                  value={state.name}
                  onChange={handleInputChange}
                />
              </Paper>
              <label>{t('admin:components.locationModel.lbl-maxuser')}</label>
              <Paper
                component="div"
                className={state.formErrors.maxUsers.length > 0 ? classes.redBorder : classes.createInput}
              >
                <InputBase
                  className={classes.input}
                  name="maxUsers"
                  placeholder={t('admin:components.locationModel.enterMaxUsers')}
                  style={{ color: '#fff' }}
                  autoComplete="off"
                  type="number"
                  value={state.maxUsers}
                  onChange={handleInputChange}
                />
              </Paper>
              <label>{t('admin:components.locationModel.lbl-scene')}</label>
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
                    MenuProps={{ classes: { paper: classes.selectPaper } }}
                  >
                    <MenuItem value="" disabled>
                      <em>{t('admin:components.locationModel.selectScene')}</em>
                    </MenuItem>
                    {adminScenes.value.map((el, index) => (
                      <MenuItem value={`${el.project}/${el.name}`} key={index}>{`${el.name} (${el.project})`}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Paper>
              <label>{t('admin:components.locationModel.type')}</label>
              <Paper
                component="div"
                className={state.formErrors.type.length > 0 ? classes.redBorder : classes.createInput}
              >
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
                    MenuProps={{ classes: { paper: classes.selectPaper } }}
                  >
                    <MenuItem value="" disabled>
                      <em>{t('admin:components.locationModel.selectType')}</em>
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
            </div>
          </Container>
        ) : (
          <React.Fragment>
            {' '}
            <Paper elevation={3} className={classes.middlePaper}>
              <Grid container spacing={2} className={classes.pdl}>
                <Grid item xs={5} className={classes.typo}>
                  <Typography variant="h5" component="h5" className={`${classes.locationOtherInfo} ${classes.mb}`}>
                    {t('admin:components.locationModel.lbl-maxuser')}
                  </Typography>
                  <Typography variant="h5" component="h5" className={`${classes.locationOtherInfo} ${classes.mb}`}>
                    {t('admin:components.locationModel.lbl-sceneId')}
                  </Typography>
                  <Typography variant="h5" component="h5" className={classes.locationOtherInfo}>
                    {t('admin:components.locationModel.slugyName')}
                  </Typography>
                </Grid>
                <Grid item xs={7} className={classes.typo}>
                  <Typography variant="h5" component="h5" className={`${classes.locationOtherInfo} ${classes.mb}`}>
                    {(location as any)?.maxUsersPerInstance || (
                      <span className={classes.spanNone}>{t('admin:components.locationModel.none')}</span>
                    )}
                  </Typography>
                  <Typography variant="h5" component="h5" className={`${classes.locationOtherInfo} ${classes.mb}`}>
                    {location?.sceneId || (
                      <span className={classes.spanNone}>{t('admin:components.locationModel.none')}</span>
                    )}
                  </Typography>
                  <Typography variant="h5" component="h5" className={`${classes.locationOtherInfo}`}>
                    {location?.slugifiedName || (
                      <span className={classes.spanNone}>{t('admin:components.locationModel.none')}</span>
                    )}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
            <Typography
              variant="h4"
              component="h4"
              className={`${classes.mb20px} ${classes.spacing} ${classes.typoFont}`}
            >
              {t('admin:components.locationModel.locationSettings')}{' '}
            </Typography>
            <Grid container spacing={2} className={classes.pdlarge}>
              <Grid item xs={6}>
                <Typography variant="h6" component="h6" className={classes.mb10}>
                  {t('admin:components.locationModel.locationType')}:
                </Typography>
                {/* <Typography variant="h6" component="h6" className={classes.mb10}>Updated At:</Typography> */}
                <Typography variant="h6" component="h6" className={classes.mb10}>
                  {t('admin:components.locationModel.videoEnabled')}:
                </Typography>
                <Typography variant="h6" component="h6" className={classes.mb10}>
                  {t('admin:components.locationModel.audioEnabled')}:
                </Typography>
                <Typography variant="h6" component="h6" className={classes.mb10}>
                  {t('admin:components.locationModel.faceStreamingEnabled')}:
                </Typography>
                <Typography variant="h6" component="h6" className={classes.mb10}>
                  {t('admin:components.locationModel.screenSharingEnabled')}:
                </Typography>
                <Typography variant="h6" component="h6" className={classes.mb10}>
                  {t('admin:components.locationModel.mediaChatEnabled')}:
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="h6" component="h6" className={classes.mb10}>
                  {location?.location_setting?.locationType || (
                    <span className={classes.spanNone}>{t('admin:components.locationModel.none')}</span>
                  )}
                </Typography>
                {/* <Typography variant="h6" component="h6" className={classes.mb10}>{location?.location_setting?.updatedAt.slice(0,10) || <span className={classes.spanNone}>None</span>}</Typography> */}
                <Typography variant="h5" component="h5" className={classes.mb10}>
                  <span className={classes.spanNone}>
                    {location?.location_setting?.videoEnabled
                      ? t('admin:components.index.yes')
                      : t('admin:components.index.no')}
                  </span>
                </Typography>
                <Typography variant="h5" component="h5" className={classes.mb10}>
                  <span className={classes.spanNone}>
                    {location?.location_setting?.audioEnabled
                      ? t('admin:components.index.yes')
                      : t('admin:components.index.no')}
                  </span>
                </Typography>
                <Typography variant="h5" component="h5" className={classes.mb10}>
                  <span className={classes.spanNone}>
                    {location?.location_setting?.faceStreamingEnabled
                      ? t('admin:components.index.yes')
                      : t('admin:components.index.no')}
                  </span>
                </Typography>
                <Typography variant="h5" component="h5" className={classes.mb10}>
                  <span className={classes.spanNone}>
                    {location?.location_setting?.screenSharingEnabled
                      ? t('admin:components.index.yes')
                      : t('admin:components.index.no')}
                  </span>
                </Typography>
                <Typography variant="h5" component="h5" className={classes.mb10}>
                  <span className={classes.spanNone}>
                    {location?.location_setting?.instanceMediaChatEnabled
                      ? t('admin:components.index.yes')
                      : t('admin:components.index.no')}
                  </span>
                </Typography>
              </Grid>
            </Grid>
          </React.Fragment>
        )}
        <DialogActions className={classes.mb10}>
          {editMode ? (
            <DialogActions>
              <Button onClick={handleSubmit} className={styles.submitButton}>
                <span style={{ marginRight: '15px' }}>
                  <Save />
                </span>{' '}
                {t('admin:components.locationModel.submit')}
              </Button>
              <Button
                className={styles.cancelButton}
                onClick={() => {
                  setEditMode(false)
                }}
              >
                {t('admin:components.locationModel.lbl-cancel')}
              </Button>
            </DialogActions>
          ) : (
            <DialogActions>
              <Button
                disabled={!isLocationWrite}
                className={styles.submitButton}
                onClick={() => {
                  setEditMode(true)
                }}
              >
                {t('admin:components.locationModel.lbl-edit')}
              </Button>
              <Button onClick={() => handleCloseDrawe()} className={styles.cancelButton}>
                {t('admin:components.locationModel.lbl-cancel')}
              </Button>
            </DialogActions>
          )}
        </DialogActions>
      </Drawer>
      <AlertMessage open={openWarning} handleClose={handleCloseWarning} severity="warning" message={error} />
    </React.Fragment>
  )
}

export default ViewLocation
