import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { LocationFetched } from '@xrengine/common/src/interfaces/Location'

import { Save } from '@mui/icons-material'
import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Container from '@mui/material/Container'
import DialogActions from '@mui/material/DialogActions'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'

import { NotificationService } from '../../../common/services/NotificationService'
import { useAuthState } from '../../../user/services/AuthService'
import DrawerView from '../../common/DrawerView'
import InputSelect, { InputMenuItem } from '../../common/InputSelect'
import InputSwitch from '../../common/InputSwitch'
import InputText from '../../common/InputText'
import { validateForm } from '../../common/validation/formValidation'
import { AdminLocationService, useAdminLocationState } from '../../services/LocationService'
import { AdminSceneService, useAdminSceneState } from '../../services/SceneService'
import styles from '../../styles/admin.module.scss'

interface Props {
  open: boolean
  locationAdmin?: LocationFetched
  onClose: () => void
}

const ViewLocation = ({ open, locationAdmin, onClose }: Props) => {
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
  const { t } = useTranslation()
  const adminScenes = useAdminSceneState().scenes
  const locationTypes = useAdminLocationState().locationTypes
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
    AdminSceneService.fetchAdminScenes()
    AdminLocationService.fetchLocationTypes()
  }, [])

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
        temp.name = value.length < 2 ? t('admin:components.locationModal.nameRequired') : ''
        break
      case 'maxUsers':
        temp.maxUsers = value.length < 2 ? t('admin:components.locationModal.maxUsersRequired') : ''
        break
      case 'scene':
        temp.scene = value.length < 2 ? t('admin:components.locationModal.sceneRequired') : ''
        break
      case 'type':
        temp.type = value.length < 2 ? t('admin:components.locationModal.privateRoleRequired') : ''
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
      temp.name = t('admin:components.locationModal.nameCantEmpty')
    }
    if (!state.maxUsers) {
      temp.maxUsers = t('admin:components.locationModal.maxUserCantEmpty')
    }
    if (!state.scene) {
      temp.scene = t('admin:components.locationModal.sceneCantEmpty')
    }
    if (!state.type) {
      temp.type = t('admin:components.locationModal.typeCantEmpty')
    }
    setState({ ...state, formErrors: temp })
    if (validateForm(state, state.formErrors)) {
      AdminLocationService.patchLocation(location.id, locationData)
      setState({
        ...state,
        name: '',
        maxUsers: 10,
        type: '',
        scene: ''
      })
      setEditMode(false)
      onClose()
    } else {
      NotificationService.dispatchNotify(t('admin:components.locationModal.fillRequiredFields'), { variant: 'error' })
    }
  }

  const handleCloseDrawer = () => {
    setState({ ...state, formErrors: { ...state.formErrors, name: '', maxUsers: '', scene: '', type: '' } })
    onClose()
  }

  const sceneMenu: InputMenuItem[] = adminScenes.value.map((el) => {
    return {
      value: `${el.project}/${el.name}`,
      label: `${el.name} (${el.project})`
    }
  })

  const locationMenu: InputMenuItem[] = locationTypes.value.map((el) => {
    return {
      value: el.type,
      label: el.type
    }
  })

  return (
    <DrawerView open={open} onClose={() => handleCloseDrawer()}>
      <Paper elevation={0} className={styles.rootPaper}>
        {location && (
          <Container maxWidth="sm">
            <div className={styles.locationTitle}>
              <Typography variant="h4" component="span">
                {location?.name}
              </Typography>
            </div>
            <div className={styles.locationSubTitle}>
              {location.isFeatured && (
                <Chip
                  style={{ marginLeft: '5px' }}
                  avatar={<Avatar>F</Avatar>}
                  label={t('admin:components.index.featured')}
                />
              )}
              {location.isLobby && <Chip avatar={<Avatar>L</Avatar>} label={t('admin:components.index.lobby')} />}
            </div>
          </Container>
        )}
      </Paper>

      {editMode ? (
        <Container maxWidth="sm">
          <div className={styles.mt10}>
            <Typography variant="h4" component="h4" className={`${styles.mb10} ${styles.headingFont}`}>
              {t('admin:components.locationModal.updateLocationInfo')}
            </Typography>

            <InputText
              name="name"
              label={t('admin:components.locationModal.lbl-name')}
              placeholder={t('admin:components.locationModal.enterName')}
              value={state.name}
              error={state.formErrors.name}
              onChange={handleInputChange}
            />

            <InputText
              name="maxUsers"
              label={t('admin:components.locationModal.lbl-maxuser')}
              placeholder={t('admin:components.locationModal.enterMaxUsers')}
              value={state.maxUsers}
              error={state.formErrors.maxUsers}
              type="number"
              onChange={handleInputChange}
            />

            <InputSelect
              name="scene"
              label={t('admin:components.locationModal.lbl-scene')}
              value={state.scene}
              error={state.formErrors.scene}
              menu={sceneMenu}
              onChange={handleInputChange}
            />

            <InputSelect
              name="type"
              label={t('admin:components.locationModal.type')}
              value={state.type}
              menu={locationMenu}
              onChange={handleInputChange}
            />

            <Grid container spacing={5} className={styles.mb15}>
              <Grid item xs={6}>
                <InputSwitch
                  name="videoEnabled"
                  label={t('admin:components.locationModal.lbl-ve')}
                  checked={state.videoEnabled}
                  onChange={(e) => setState({ ...state, videoEnabled: e.target.checked })}
                />

                <InputSwitch
                  name="audioEnabled"
                  label={t('admin:components.locationModal.lbl-ae')}
                  checked={state.audioEnabled}
                  onChange={(e) => setState({ ...state, audioEnabled: e.target.checked })}
                />

                <InputSwitch
                  name="globalMediaEnabled"
                  label={t('admin:components.locationModal.lbl-gme')}
                  checked={state.globalMediaEnabled}
                  onChange={(e) => setState({ ...state, globalMediaEnabled: e.target.checked })}
                />

                <InputSwitch
                  name="screenSharingEnabled"
                  label={t('admin:components.locationModal.lbl-se')}
                  checked={state.screenSharingEnabled}
                  onChange={(e) => setState({ ...state, screenSharingEnabled: e.target.checked })}
                />
              </Grid>
              <Grid item xs={6}>
                <div style={{ marginLeft: 'auto' }}>
                  <InputSwitch
                    name="faceStreamingEnabled"
                    label={t('admin:components.locationModal.lbl-fe')}
                    checked={state.faceStreamingEnabled}
                    onChange={(e) => setState({ ...state, faceStreamingEnabled: e.target.checked })}
                  />

                  <InputSwitch
                    name="isLobby"
                    label={t('admin:components.locationModal.lbl-lobby')}
                    checked={state.isLobby}
                    onChange={(e) => setState({ ...state, isLobby: e.target.checked })}
                  />

                  <InputSwitch
                    name="isFeatured"
                    label={t('admin:components.locationModal.lbl-featured')}
                    checked={state.isFeatured}
                    onChange={(e) => setState({ ...state, isFeatured: e.target.checked })}
                  />
                </div>
              </Grid>
            </Grid>
          </div>
        </Container>
      ) : (
        <React.Fragment>
          <Paper elevation={3} className={styles.middlePaper}>
            <Grid container spacing={2} className={styles.pdl}>
              <Grid item xs={5} className={styles.typo}>
                <Typography variant="h5" component="h5" className={`${styles.locationOtherInfo} ${styles.mb}`}>
                  {t('admin:components.locationModal.lbl-maxuser')}
                </Typography>
                <Typography variant="h5" component="h5" className={`${styles.locationOtherInfo} ${styles.mb}`}>
                  {t('admin:components.locationModal.lbl-sceneId')}
                </Typography>
                <Typography variant="h5" component="h5" className={styles.locationOtherInfo}>
                  {t('admin:components.locationModal.slugyName')}
                </Typography>
              </Grid>
              <Grid item xs={7} className={styles.typo}>
                <Typography variant="h5" component="h5" className={`${styles.locationOtherInfo} ${styles.mb}`}>
                  {(location as any)?.maxUsersPerInstance || (
                    <span className={styles.spanNone}>{t('admin:components.locationModal.none')}</span>
                  )}
                </Typography>
                <Typography variant="h5" component="h5" className={`${styles.locationOtherInfo} ${styles.mb}`}>
                  {location?.sceneId || (
                    <span className={styles.spanNone}>{t('admin:components.locationModal.none')}</span>
                  )}
                </Typography>
                <Typography variant="h5" component="h5" className={`${styles.locationOtherInfo}`}>
                  {location?.slugifiedName || (
                    <span className={styles.spanNone}>{t('admin:components.locationModal.none')}</span>
                  )}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
          <Typography variant="h4" component="h4" className={`${styles.mb20px} ${styles.spacing} ${styles.typoFont}`}>
            {t('admin:components.locationModal.locationSettings')}
          </Typography>
          <Grid container spacing={2} className={styles.pdlarge}>
            <Grid item xs={6}>
              <Typography variant="h6" component="h6" className={styles.mb10}>
                {t('admin:components.locationModal.locationType')}:
              </Typography>
              {/* <Typography variant="h6" component="h6" className={styles.mb10}>Updated At:</Typography> */}
              <Typography variant="h6" component="h6" className={styles.mb10}>
                {t('admin:components.locationModal.videoEnabled')}:
              </Typography>
              <Typography variant="h6" component="h6" className={styles.mb10}>
                {t('admin:components.locationModal.audioEnabled')}:
              </Typography>
              <Typography variant="h6" component="h6" className={styles.mb10}>
                {t('admin:components.locationModal.faceStreamingEnabled')}:
              </Typography>
              <Typography variant="h6" component="h6" className={styles.mb10}>
                {t('admin:components.locationModal.screenSharingEnabled')}:
              </Typography>
              <Typography variant="h6" component="h6" className={styles.mb10}>
                {t('admin:components.locationModal.mediaChatEnabled')}:
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="h6" component="h6" className={styles.mb10}>
                {location?.location_setting?.locationType || (
                  <span className={styles.spanNone}>{t('admin:components.locationModal.none')}</span>
                )}
              </Typography>
              {/* <Typography variant="h6" component="h6" className={styles.mb10}>{location?.location_setting?.updatedAt.slice(0,10) || <span className={styles.spanNone}>None</span>}</Typography> */}
              <Typography variant="h5" component="h5" className={styles.mb10}>
                <span className={styles.spanNone}>
                  {location?.location_setting?.videoEnabled
                    ? t('admin:components.index.yes')
                    : t('admin:components.index.no')}
                </span>
              </Typography>
              <Typography variant="h5" component="h5" className={styles.mb10}>
                <span className={styles.spanNone}>
                  {location?.location_setting?.audioEnabled
                    ? t('admin:components.index.yes')
                    : t('admin:components.index.no')}
                </span>
              </Typography>
              <Typography variant="h5" component="h5" className={styles.mb10}>
                <span className={styles.spanNone}>
                  {location?.location_setting?.faceStreamingEnabled
                    ? t('admin:components.index.yes')
                    : t('admin:components.index.no')}
                </span>
              </Typography>
              <Typography variant="h5" component="h5" className={styles.mb10}>
                <span className={styles.spanNone}>
                  {location?.location_setting?.screenSharingEnabled
                    ? t('admin:components.index.yes')
                    : t('admin:components.index.no')}
                </span>
              </Typography>
              <Typography variant="h5" component="h5" className={styles.mb10}>
                <span className={styles.spanNone}>
                  {location?.location_setting?.instanceMediaChatEnabled
                    ? t('admin:components.index.yes')
                    : t('admin:components.index.no')}
                </span>
              </Typography>
            </Grid>
          </Grid>
        </React.Fragment>
      )}
      <DialogActions className={styles.mb10}>
        {editMode ? (
          <DialogActions>
            <Button onClick={handleSubmit} className={styles.submitButton}>
              <span style={{ marginRight: '15px' }}>
                <Save />
              </span>{' '}
              {t('admin:components.locationModal.submit')}
            </Button>
            <Button
              className={styles.cancelButton}
              onClick={() => {
                setEditMode(false)
              }}
            >
              {t('admin:components.locationModal.lbl-cancel')}
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
              {t('admin:components.locationModal.lbl-edit')}
            </Button>
            <Button onClick={handleCloseDrawer} className={styles.cancelButton}>
              {t('admin:components.locationModal.lbl-cancel')}
            </Button>
          </DialogActions>
        )}
      </DialogActions>
    </DrawerView>
  )
}

export default ViewLocation
