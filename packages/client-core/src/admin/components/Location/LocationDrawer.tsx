import _ from 'lodash'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { LocationFetched } from '@xrengine/common/src/interfaces/Location'

import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import DialogActions from '@mui/material/DialogActions'
import DialogTitle from '@mui/material/DialogTitle'
import Grid from '@mui/material/Grid'

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

export enum LocationDrawerMode {
  Create,
  ViewEdit
}

interface Props {
  open: boolean
  mode: LocationDrawerMode
  location?: LocationFetched
  onClose: () => void
}

const defaultState = {
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
}

const LocationDrawer = ({ open, mode, location, onClose }: Props) => {
  const { t } = useTranslation()
  const [editMode, setEditMode] = useState(false)
  const [state, setState] = useState({ ...defaultState })

  const { scenes } = useAdminSceneState().value
  const { locationTypes } = useAdminLocationState().value
  const { user } = useAuthState().value // user initialized by getting value from authState object.

  const haslocationWriteAccess = user?.scopes && user?.scopes.find((item) => item.type === 'location:write')
  const viewMode = mode === LocationDrawerMode.ViewEdit && editMode === false

  const sceneMenu: InputMenuItem[] = scenes.map((el) => {
    return {
      value: `${el.project}/${el.name}`,
      label: `${el.name} (${el.project})`
    }
  })

  const locationMenu: InputMenuItem[] = locationTypes.map((el) => {
    return {
      value: el.type,
      label: el.type
    }
  })

  useEffect(() => {
    AdminSceneService.fetchAdminScenes()
    AdminLocationService.fetchLocationTypes()
  }, [])

  useEffect(() => {
    loadLocation()
  }, [location])

  const loadLocation = () => {
    if (location) {
      setState({
        ...defaultState,
        name: location.name,
        maxUsers: location.maxUsersPerInstance,
        scene: location.sceneId,
        type: location.location_setting?.locationType,
        videoEnabled: location.location_setting?.videoEnabled,
        audioEnabled: location.location_setting?.audioEnabled,
        screenSharingEnabled: location.location_setting?.screenSharingEnabled,
        faceStreamingEnabled: location.location_setting?.faceStreamingEnabled,
        globalMediaEnabled: location.location_setting?.instanceMediaChatEnabled,
        isLobby: location.isLobby,
        isFeatured: location.isFeatured
      })
    }
  }

  const handleClose = () => {
    setState({ ...defaultState })
    onClose()
  }

  const handleChange = (e) => {
    const { name, value } = e.target

    let temp = { ...state.formErrors }

    switch (name) {
      case 'name':
        temp.name = value.length < 2 ? t('admin:components.locationModal.nameRequired') : ''
        break
      case 'maxUsers':
        temp.maxUsers = value.length < 1 ? t('admin:components.locationModal.maxUsersRequired') : ''
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

    let tempErrors = {
      ...state.formErrors,
      name: state.name ? '' : t('admin:components.locationModal.nameCantEmpty'),
      maxUsers: state.maxUsers ? '' : t('admin:components.locationModal.maxUserCantEmpty'),
      scene: state.scene ? '' : t('admin:components.locationModal.sceneCantEmpty'),
      type: state.type ? '' : t('admin:components.locationModal.typeCantEmpty')
    }

    setState({ ...state, formErrors: tempErrors })

    if (validateForm(state, tempErrors)) {
      if (mode === LocationDrawerMode.Create) {
        AdminLocationService.createLocation(locationData)
      } else if (location) {
        AdminLocationService.patchLocation(location.id, locationData)
        setEditMode(false)
      }

      handleClose()
    } else {
      NotificationService.dispatchNotify(t('admin:components.locationModal.fillRequiredFields'), { variant: 'error' })
    }
  }

  return (
    <DrawerView open={open} onClose={onClose}>
      <Container maxWidth="sm" className={styles.mt20}>
        <DialogTitle id="form-dialog-title" className={styles.textAlign}>
          {mode === LocationDrawerMode.Create && t('admin:components.locationModal.createLocation')}
          {mode === LocationDrawerMode.ViewEdit &&
            editMode &&
            `${t('admin:components.locationModal.update')} ${location?.name}`}
          {mode === LocationDrawerMode.ViewEdit && !editMode && location?.name}
        </DialogTitle>

        <InputText
          name="name"
          label={t('admin:components.locationModal.lbl-name')}
          placeholder={t('admin:components.locationModal.enterName')}
          value={state.name ?? ''}
          error={state.formErrors.name}
          disabled={viewMode}
          onChange={handleChange}
        />

        <InputText
          name="maxUsers"
          label={t('admin:components.locationModal.lbl-maxuser')}
          placeholder={t('admin:components.group.enterMaxUsers')}
          value={state.maxUsers}
          error={state.formErrors.maxUsers}
          type="number"
          disabled={viewMode}
          onChange={handleChange}
        />

        <InputSelect
          name="scene"
          label={t('admin:components.locationModal.lbl-scene')}
          value={state.scene}
          error={state.formErrors.scene}
          menu={sceneMenu}
          disabled={viewMode}
          onChange={handleChange}
        />

        <InputSelect
          name="type"
          label={t('admin:components.locationModal.type')}
          value={state.type}
          menu={locationMenu}
          disabled={viewMode}
          onChange={handleChange}
        />

        <Grid container spacing={5} className={styles.mb15}>
          <Grid item xs={6}>
            <InputSwitch
              name="videoEnabled"
              label={t('admin:components.locationModal.lbl-ve')}
              checked={state.videoEnabled}
              disabled={viewMode}
              onChange={(e) => setState({ ...state, videoEnabled: e.target.checked })}
            />

            <InputSwitch
              name="audioEnabled"
              label={t('admin:components.locationModal.lbl-ae')}
              checked={state.audioEnabled}
              disabled={viewMode}
              onChange={(e) => setState({ ...state, audioEnabled: e.target.checked })}
            />

            <InputSwitch
              name="globalMediaEnabled"
              label={t('admin:components.locationModal.lbl-gme')}
              checked={state.globalMediaEnabled}
              disabled={viewMode}
              onChange={(e) => setState({ ...state, globalMediaEnabled: e.target.checked })}
            />

            <InputSwitch
              name="screenSharingEnabled"
              label={t('admin:components.locationModal.lbl-se')}
              checked={state.screenSharingEnabled}
              disabled={viewMode}
              onChange={(e) => setState({ ...state, screenSharingEnabled: e.target.checked })}
            />
          </Grid>
          <Grid item xs={6} style={{ display: 'flex' }}>
            <div style={{ marginLeft: 'auto' }}>
              <InputSwitch
                name="faceStreamingEnabled"
                label={t('admin:components.locationModal.lbl-fe')}
                checked={state.faceStreamingEnabled}
                disabled={viewMode}
                onChange={(e) => setState({ ...state, faceStreamingEnabled: e.target.checked })}
              />

              <InputSwitch
                name="isLobby"
                label={t('admin:components.locationModal.lbl-lobby')}
                checked={state.isLobby}
                disabled={viewMode}
                onChange={(e) => setState({ ...state, isLobby: e.target.checked })}
              />

              <InputSwitch
                name="isFeatured"
                label={t('admin:components.locationModal.lbl-featured')}
                checked={state.isFeatured}
                disabled={viewMode}
                onChange={(e) => setState({ ...state, isFeatured: e.target.checked })}
              />
            </div>
          </Grid>
        </Grid>
        <DialogActions>
          {(mode === LocationDrawerMode.Create || editMode) && (
            <Button className={styles.submitButton} onClick={handleSubmit}>
              {t('admin:components.locationModal.submit')}
            </Button>
          )}
          {mode === LocationDrawerMode.ViewEdit && editMode === false && (
            <Button
              className={styles.submitButton}
              disabled={haslocationWriteAccess ? false : true}
              onClick={() => setEditMode(true)}
            >
              {t('admin:components.locationModal.lbl-edit')}
            </Button>
          )}
          <Button
            className={styles.cancelButton}
            onClick={() => {
              if (editMode) {
                loadLocation()
                setEditMode(false)
              } else handleClose()
            }}
          >
            {t('admin:components.locationModal.lbl-cancel')}
          </Button>
        </DialogActions>
      </Container>
    </DrawerView>
  )
}

export default LocationDrawer
