/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import InputText from '@etherealengine/client-core/src/common/components/InputText'
import { LocationData, LocationID, LocationType, locationPath } from '@etherealengine/common/src/schema.type.module'
import { NO_PROXY, getMutableState, useHookstate } from '@etherealengine/hyperflux'
import Button from '@etherealengine/ui/src/primitives/mui/Button'
import Container from '@etherealengine/ui/src/primitives/mui/Container'
import DialogActions from '@etherealengine/ui/src/primitives/mui/DialogActions'
import DialogTitle from '@etherealengine/ui/src/primitives/mui/DialogTitle'

import { useMutation } from '@etherealengine/spatial/src/common/functions/FeathersHooks'
import { NotificationService } from '../../../common/services/NotificationService'
import { AuthState } from '../../../user/services/AuthService'
import styles from '../../old-styles/admin.module.scss'
import DrawerView from '../DrawerView'
import { validateForm } from '../validation/formValidation'

export enum LocationDrawerMode {
  Create,
  ViewEdit
}

interface Props {
  open: boolean
  mode: LocationDrawerMode
  selectedLocation?: LocationType
  onClose: () => void
  selectedScene?: string | null
}

const defaultState = {
  name: '',
  maxUsers: 20,
  scene: '',
  type: 'public',
  videoEnabled: true,
  audioEnabled: true,
  screenSharingEnabled: true,
  formErrors: {
    name: '',
    maxUsers: '',
    scene: '',
    type: ''
  }
}

const LocationDrawer = ({ open, mode, selectedLocation, selectedScene, onClose }: Props) => {
  const { t } = useTranslation()
  const editMode = useHookstate(false)
  const state = useHookstate({ ...defaultState })
  const user = useHookstate(getMutableState(AuthState).user)
  const locationMutation = useMutation(locationPath)
  const hasWriteAccess = user.scopes.get(NO_PROXY)?.find((item) => item?.type === 'location:write')
  const viewMode = mode === LocationDrawerMode.ViewEdit && !editMode.value

  useEffect(() => {
    if (selectedScene) state.scene.set(selectedScene)
  }, [selectedScene])

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
        type: selectedLocation.locationSetting?.locationType,
        videoEnabled: selectedLocation.locationSetting?.videoEnabled,
        audioEnabled: selectedLocation.locationSetting?.audioEnabled,
        screenSharingEnabled: selectedLocation.locationSetting?.screenSharingEnabled
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

  const handleSubmit = async () => {
    state.formErrors.merge({
      name: state.name.value ? '' : t('admin:components.location.nameCantEmpty'),
      maxUsers: state.maxUsers.value ? '' : t('admin:components.location.maxUserCantEmpty'),
      scene: state.scene.value ? '' : t('admin:components.location.sceneCantEmpty'),
      type: state.type.value ? '' : t('admin:components.location.typeCantEmpty')
    })

    if (!validateForm(state.value, state.formErrors.value)) {
      NotificationService.dispatchNotify(t('admin:components.common.fillRequiredFields'), { variant: 'error' })
      return
    }

    // TODO: new checkbox
    const isBaked = true

    // TODO: Present blocking modal to user "Are you sure you want to Publish?"

    await publishScene(isBaked)

    // TODO: After publish succeeds or fails, restore original scene and close blocking modal

    handleClose()
  }

  const publishScene = async (bake: boolean) => {
    // TODO: Save current scene in place, and create new version to publish
    // TODO: In duplicated scene, perform mesh baking to de-reference all models in the scene (saving scene as GLTF & fuse/compress scenes)
    // TODO: Publish the duplicated scene

    const locationData: LocationData = {
      name: state.name.value,
      slugifiedName: '',
      sceneId: state.scene.value,
      maxUsersPerInstance: state.maxUsers.value,
      locationSetting: {
        id: '',
        locationId: '' as LocationID,
        locationType: state.type.value as 'private' | 'public' | 'showroom',
        audioEnabled: state.audioEnabled.value,
        screenSharingEnabled: state.screenSharingEnabled.value,
        faceStreamingEnabled: false,
        videoEnabled: state.videoEnabled.value,
        createdAt: '',
        updatedAt: ''
      },
      isLobby: false,
      isFeatured: false
    }

    const onError = (error) => NotificationService.dispatchNotify(error.message, { variant: 'error' })

    if (mode === LocationDrawerMode.Create) {
      await locationMutation.create(locationData).catch(onError)
    } else if (selectedLocation) {
      await locationMutation.patch(selectedLocation.id, locationData).catch(onError)
      editMode.set(false)
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
          onChange={({ name, value }) => {
            state.formErrors.merge({ name: value.length < 2 ? t('admin:components.location.nameRequired') : '' })
            state.merge({ [name]: value })
          }}
        />

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
