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
  selectedLocation?: LocationFetched
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

const LocationDrawer = ({ open, mode, selectedLocation, onClose }: Props) => {
  const { t } = useTranslation()
  const [editMode, setEditMode] = useState(false)
  const [state, setState] = useState({ ...defaultState })

  const { scenes } = useAdminSceneState().value
  const { locationTypes } = useAdminLocationState().value
  const { user } = useAuthState().value // user initialized by getting value from authState object.

  const hasWriteAccess = user.scopes && user.scopes.find((item) => item.type === 'location:write')
  const viewMode = mode === LocationDrawerMode.ViewEdit && editMode === false

  const sceneMenu: InputMenuItem[] = scenes.map((el) => {
    return {
      value: `${el.project}/${el.name}`,
      label: `${el.name} (${el.project})`
    }
  })

  const locationTypesMenu: InputMenuItem[] = locationTypes.map((el) => {
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
    loadSelectedLocation()
  }, [selectedLocation])

  const loadSelectedLocation = () => {
    if (selectedLocation) {
      setState({
        ...defaultState,
        name: selectedLocation.name,
        maxUsers: selectedLocation.maxUsersPerInstance,
        scene: selectedLocation.sceneId,
        type: selectedLocation.location_setting?.locationType,
        videoEnabled: selectedLocation.location_setting?.videoEnabled,
        audioEnabled: selectedLocation.location_setting?.audioEnabled,
        screenSharingEnabled: selectedLocation.location_setting?.screenSharingEnabled,
        faceStreamingEnabled: selectedLocation.location_setting?.faceStreamingEnabled,
        globalMediaEnabled: selectedLocation.location_setting?.instanceMediaChatEnabled,
        isLobby: selectedLocation.isLobby,
        isFeatured: selectedLocation.isFeatured
      })
    }
  }

  const handleCancel = () => {
    if (editMode) {
      loadSelectedLocation()
      setEditMode(false)
    } else handleClose()
  }

  const handleClose = () => {
    onClose()
    setState({ ...defaultState })
  }

  const handleChange = (e) => {
    const { name, value } = e.target

    let tempErrors = { ...state.formErrors }

    switch (name) {
      case 'name':
        tempErrors.name = value.length < 2 ? t('admin:components.location.nameRequired') : ''
        break
      case 'maxUsers':
        tempErrors.maxUsers = value.length < 1 ? t('admin:components.location.maxUsersRequired') : ''
        break
      case 'scene':
        tempErrors.scene = value.length < 2 ? t('admin:components.location.sceneRequired') : ''
        break
      case 'type':
        tempErrors.type = value.length < 2 ? t('admin:components.location.typeRequired') : ''
        break
      default:
        break
    }

    setState({ ...state, [name]: value, formErrors: tempErrors })
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

    let tempErrors = {
      ...state.formErrors,
      name: state.name ? '' : t('admin:components.location.nameCantEmpty'),
      maxUsers: state.maxUsers ? '' : t('admin:components.location.maxUserCantEmpty'),
      scene: state.scene ? '' : t('admin:components.location.sceneCantEmpty'),
      type: state.type ? '' : t('admin:components.location.typeCantEmpty')
    }

    setState({ ...state, formErrors: tempErrors })

    if (validateForm(state, tempErrors)) {
      if (mode === LocationDrawerMode.Create) {
        AdminLocationService.createLocation(data)
      } else if (selectedLocation) {
        AdminLocationService.patchLocation(selectedLocation.id, data)
        setEditMode(false)
      }

      handleClose()
    } else {
      NotificationService.dispatchNotify(t('admin:components.common.fillRequiredFields'), { variant: 'error' })
    }
  }

  return (
    <DrawerView open={open} onClose={onClose}>
      <Container maxWidth="sm" className={styles.mt20}>
        <DialogTitle className={styles.textAlign}>
          {mode === LocationDrawerMode.Create && t('admin:components.location.createLocation')}
          {mode === LocationDrawerMode.ViewEdit &&
            editMode &&
            `${t('admin:components.common.update')} ${selectedLocation?.name}`}
          {mode === LocationDrawerMode.ViewEdit && !editMode && selectedLocation?.name}
        </DialogTitle>

        <InputText
          name="name"
          label={t('admin:components.location.lbl-name')}
          value={state.name ?? ''}
          error={state.formErrors.name}
          disabled={viewMode}
          onChange={handleChange}
        />

        <InputText
          name="maxUsers"
          label={t('admin:components.location.lbl-maxuser')}
          value={state.maxUsers}
          error={state.formErrors.maxUsers}
          type="number"
          disabled={viewMode}
          onChange={handleChange}
        />

        <InputSelect
          name="scene"
          label={t('admin:components.location.lbl-scene')}
          value={state.scene}
          error={state.formErrors.scene}
          menu={sceneMenu}
          disabled={viewMode}
          onChange={handleChange}
        />

        <InputSelect
          name="type"
          label={t('admin:components.location.type')}
          value={state.type}
          menu={locationTypesMenu}
          disabled={viewMode}
          onChange={handleChange}
        />

        <Grid container spacing={5} className={styles.mb15px}>
          <Grid item xs={6}>
            <InputSwitch
              name="videoEnabled"
              label={t('admin:components.location.lbl-ve')}
              checked={state.videoEnabled}
              disabled={viewMode}
              onChange={(e) => setState({ ...state, videoEnabled: e.target.checked })}
            />

            <InputSwitch
              name="audioEnabled"
              label={t('admin:components.location.lbl-ae')}
              checked={state.audioEnabled}
              disabled={viewMode}
              onChange={(e) => setState({ ...state, audioEnabled: e.target.checked })}
            />

            <InputSwitch
              name="globalMediaEnabled"
              label={t('admin:components.location.lbl-gme')}
              checked={state.globalMediaEnabled}
              disabled={viewMode}
              onChange={(e) => setState({ ...state, globalMediaEnabled: e.target.checked })}
            />

            <InputSwitch
              name="screenSharingEnabled"
              label={t('admin:components.location.lbl-se')}
              checked={state.screenSharingEnabled}
              disabled={viewMode}
              onChange={(e) => setState({ ...state, screenSharingEnabled: e.target.checked })}
            />
          </Grid>
          <Grid item xs={6} style={{ display: 'flex' }}>
            <div style={{ marginLeft: 'auto' }}>
              <InputSwitch
                name="faceStreamingEnabled"
                label={t('admin:components.location.lbl-fe')}
                checked={state.faceStreamingEnabled}
                disabled={viewMode}
                onChange={(e) => setState({ ...state, faceStreamingEnabled: e.target.checked })}
              />

              <InputSwitch
                name="isLobby"
                label={t('admin:components.location.lbl-lobby')}
                checked={state.isLobby}
                disabled={viewMode}
                onChange={(e) => setState({ ...state, isLobby: e.target.checked })}
              />

              <InputSwitch
                name="isFeatured"
                label={t('admin:components.location.lbl-featured')}
                checked={state.isFeatured}
                disabled={viewMode}
                onChange={(e) => setState({ ...state, isFeatured: e.target.checked })}
              />
            </div>
          </Grid>
        </Grid>
        <DialogActions>
          <Button className={styles.outlinedButton} onClick={handleCancel}>
            {t('admin:components.common.cancel')}
          </Button>
          {(mode === LocationDrawerMode.Create || editMode) && (
            <Button className={styles.gradientButton} onClick={handleSubmit}>
              {t('admin:components.common.submit')}
            </Button>
          )}
          {mode === LocationDrawerMode.ViewEdit && !editMode && (
            <Button className={styles.gradientButton} disabled={!hasWriteAccess} onClick={() => setEditMode(true)}>
              {t('admin:components.common.edit')}
            </Button>
          )}
        </DialogActions>
      </Container>
    </DrawerView>
  )
}

export default LocationDrawer
