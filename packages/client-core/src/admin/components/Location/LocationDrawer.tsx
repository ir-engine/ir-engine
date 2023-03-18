import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import InputSelect, { InputMenuItem } from '@etherealengine/client-core/src/common/components/InputSelect'
import InputSwitch from '@etherealengine/client-core/src/common/components/InputSwitch'
import InputText from '@etherealengine/client-core/src/common/components/InputText'
import { LocationFetched } from '@etherealengine/common/src/interfaces/Location'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'
import Button from '@etherealengine/ui/src/Button'
import Container from '@etherealengine/ui/src/Container'
import DialogActions from '@etherealengine/ui/src/DialogActions'
import DialogTitle from '@etherealengine/ui/src/DialogTitle'
import Grid from '@etherealengine/ui/src/Grid'

import { NotificationService } from '../../../common/services/NotificationService'
import { AuthState } from '../../../user/services/AuthService'
import DrawerView from '../../common/DrawerView'
import { validateForm } from '../../common/validation/formValidation'
import { AdminLocationService, AdminLocationState } from '../../services/LocationService'
import { AdminSceneService, AdminSceneState } from '../../services/SceneService'
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
  const editMode = useHookstate(false)
  const state = useHookstate({ ...defaultState })

  const scenes = useHookstate(getMutableState(AdminSceneState).scenes)
  const locationTypes = useHookstate(getMutableState(AdminLocationState).locationTypes)
  const user = useHookstate(getMutableState(AuthState).user)

  const hasWriteAccess = user.scopes.get({ noproxy: true })?.find((item) => item?.type === 'location:write')
  const viewMode = mode === LocationDrawerMode.ViewEdit && !editMode.value

  const sceneMenu: InputMenuItem[] = scenes.get({ noproxy: true }).map((el) => {
    return {
      value: `${el.project}/${el.name}`,
      label: `${el.name} (${el.project})`
    }
  })

  const locationTypesMenu: InputMenuItem[] = locationTypes.get({ noproxy: true }).map((el) => {
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
      state.set({
        ...defaultState,
        name: selectedLocation.name,
        maxUsers: selectedLocation.maxUsersPerInstance,
        scene: selectedLocation.sceneId,
        type: selectedLocation.location_setting?.locationType,
        videoEnabled: selectedLocation.location_setting?.videoEnabled,
        audioEnabled: selectedLocation.location_setting?.audioEnabled,
        screenSharingEnabled: selectedLocation.location_setting?.screenSharingEnabled,
        faceStreamingEnabled: selectedLocation.location_setting?.faceStreamingEnabled,
        isLobby: selectedLocation.isLobby,
        isFeatured: selectedLocation.isFeatured
      })
    }
  }

  const handleCancel = () => {
    if (editMode.value) {
      loadSelectedLocation()
      editMode.set(false)
    } else handleClose()
  }

  const handleClose = () => {
    onClose()
    state.set({ ...defaultState })
  }

  const handleChange = (e) => {
    const { name, value } = e.target

    switch (name) {
      case 'name':
        state.formErrors.merge({ name: value.length < 2 ? t('admin:components.location.nameRequired') : '' })
        break
      case 'maxUsers':
        state.formErrors.merge({ maxUsers: value.length < 1 ? t('admin:components.location.maxUsersRequired') : '' })
        break
      case 'scene':
        state.formErrors.merge({ scene: value.length < 2 ? t('admin:components.location.sceneRequired') : '' })
        break
      case 'type':
        state.formErrors.merge({ type: value.length < 2 ? t('admin:components.location.typeRequired') : '' })
        break
      default:
        break
    }

    state.merge({ [name]: value })
  }

  const handleSubmit = () => {
    const data = {
      name: state.name.value,
      sceneId: state.scene.value,
      maxUsersPerInstance: state.maxUsers.value,
      location_settings: {
        locationType: state.type.value,
        audioEnabled: state.audioEnabled.value,
        screenSharingEnabled: state.screenSharingEnabled.value,
        faceStreamingEnabled: state.faceStreamingEnabled.value,
        videoEnabled: state.videoEnabled.value
      },
      isLobby: state.isLobby.value,
      isFeatured: state.isFeatured.value
    }

    state.formErrors.merge({
      name: state.name.value ? '' : t('admin:components.location.nameCantEmpty'),
      maxUsers: state.maxUsers.value ? '' : t('admin:components.location.maxUserCantEmpty'),
      scene: state.scene.value ? '' : t('admin:components.location.sceneCantEmpty'),
      type: state.type.value ? '' : t('admin:components.location.typeCantEmpty')
    })

    if (validateForm(state.value, state.formErrors.value)) {
      if (mode === LocationDrawerMode.Create) {
        AdminLocationService.createLocation(data)
      } else if (selectedLocation) {
        AdminLocationService.patchLocation(selectedLocation.id, data)
        editMode.set(false)
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
            editMode.value &&
            `${t('admin:components.common.update')} ${selectedLocation?.name}`}
          {mode === LocationDrawerMode.ViewEdit && !editMode.value && selectedLocation?.name}
        </DialogTitle>

        <InputText
          name="name"
          label={t('admin:components.location.lbl-name')}
          value={state?.value?.name || ''}
          error={state?.value?.formErrors?.name}
          disabled={viewMode}
          onChange={handleChange}
        />

        <InputText
          name="maxUsers"
          label={t('admin:components.location.lbl-maxuser')}
          value={state?.value?.maxUsers}
          error={state?.value?.formErrors?.maxUsers}
          type="number"
          disabled={viewMode}
          onChange={handleChange}
        />

        <InputSelect
          name="scene"
          label={t('admin:components.location.lbl-scene')}
          value={state?.value?.scene}
          error={state?.value?.formErrors?.scene}
          menu={sceneMenu}
          disabled={viewMode}
          onChange={handleChange}
        />

        <InputSelect
          name="type"
          label={t('admin:components.location.type')}
          value={state?.value?.type}
          menu={locationTypesMenu}
          disabled={viewMode}
          onChange={handleChange}
        />

        <Grid container spacing={5} className={styles.mb15px}>
          <Grid item xs={6}>
            <InputSwitch
              name="videoEnabled"
              label={t('admin:components.location.lbl-ve')}
              checked={state?.value?.videoEnabled}
              disabled={viewMode}
              onChange={(e) => state.merge({ videoEnabled: e.target.checked })}
            />

            <InputSwitch
              name="audioEnabled"
              label={t('admin:components.location.lbl-ae')}
              checked={state?.value?.audioEnabled}
              disabled={viewMode}
              onChange={(e) => state.merge({ audioEnabled: e.target.checked })}
            />

            <InputSwitch
              name="screenSharingEnabled"
              label={t('admin:components.location.lbl-se')}
              checked={state?.value?.screenSharingEnabled}
              disabled={viewMode}
              onChange={(e) => state.merge({ screenSharingEnabled: e.target.checked })}
            />
          </Grid>
          <Grid item xs={6} style={{ display: 'flex' }}>
            <div style={{ marginLeft: 'auto' }}>
              <InputSwitch
                name="faceStreamingEnabled"
                label={t('admin:components.location.lbl-fe')}
                checked={state?.value?.faceStreamingEnabled}
                disabled={viewMode}
                onChange={(e) => state.merge({ faceStreamingEnabled: e.target.checked })}
              />

              <InputSwitch
                name="isLobby"
                label={t('admin:components.location.lbl-lobby')}
                checked={state?.value?.isLobby}
                disabled={viewMode}
                onChange={(e) => state.merge({ isLobby: e.target.checked })}
              />

              <InputSwitch
                name="isFeatured"
                label={t('admin:components.location.lbl-featured')}
                checked={state?.value?.isFeatured}
                disabled={viewMode}
                onChange={(e) => state.merge({ isFeatured: e.target.checked })}
              />
            </div>
          </Grid>
        </Grid>
        <DialogActions>
          <Button className={styles.outlinedButton} onClick={handleCancel}>
            {t('admin:components.common.cancel')}
          </Button>
          {(mode === LocationDrawerMode.Create || editMode.value) && (
            <Button className={styles.gradientButton} onClick={handleSubmit}>
              {t('admin:components.common.submit')}
            </Button>
          )}
          {mode === LocationDrawerMode.ViewEdit && !editMode.value && (
            <Button className={styles.gradientButton} disabled={!hasWriteAccess} onClick={() => editMode.set(true)}>
              {t('admin:components.common.edit')}
            </Button>
          )}
        </DialogActions>
      </Container>
    </DrawerView>
  )
}

export default LocationDrawer
