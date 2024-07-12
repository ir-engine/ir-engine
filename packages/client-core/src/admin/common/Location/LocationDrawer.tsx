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

import InputSelect, { InputMenuItem } from '@etherealengine/client-core/src/common/components/InputSelect'
import InputSwitch from '@etherealengine/client-core/src/common/components/InputSwitch'
import InputText from '@etherealengine/client-core/src/common/components/InputText'
import {
  LocationData,
  LocationID,
  locationPath,
  LocationType,
  staticResourcePath
} from '@etherealengine/common/src/schema.type.module'
import { getState, useHookstate } from '@etherealengine/hyperflux'
import { useFind, useGet, useMutation } from '@etherealengine/spatial/src/common/functions/FeathersHooks'
import Button from '@etherealengine/ui/src/primitives/mui/Button'
import Container from '@etherealengine/ui/src/primitives/mui/Container'
import DialogActions from '@etherealengine/ui/src/primitives/mui/DialogActions'
import DialogTitle from '@etherealengine/ui/src/primitives/mui/DialogTitle'
import Grid from '@etherealengine/ui/src/primitives/mui/Grid'

import { EditorState } from '@etherealengine/editor/src/services/EditorServices'
import { NotificationService } from '../../../common/services/NotificationService'
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
  // faceStreamingEnabled: false,
  // isLobby: false,
  // isFeatured: false,
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

  const scenes = useFind(staticResourcePath, { query: { type: 'scene' } })
  // const locationTypes = useFind(locationTypePath).data

  const locationMutation = useMutation(locationPath)

  const viewMode = mode === LocationDrawerMode.ViewEdit && !editMode.value

  const selectedSceneData = useGet(staticResourcePath, selectedScene!)

  const editorState = getState(EditorState)

  useEffect(() => {
    if (selectedScene) state.scene.set(selectedScene)
  }, [selectedScene])

  const sceneMenu: InputMenuItem[] = selectedSceneData.data
    ? [
        {
          value: selectedSceneData.data.id,
          label: selectedSceneData.data.key
        }
      ]
    : scenes.data.map((el) => {
        return {
          value: el.id,
          label: el.key
        }
      })

  // const locationTypesMenu: InputMenuItem[] = locationTypes.map((el) => {
  //   return {
  //     value: el.type,
  //     label: el.type
  //   }
  // })

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
        // faceStreamingEnabled: selectedLocation.locationSetting?.faceStreamingEnabled,
        // isLobby: selectedLocation.isLobby,
        // isFeatured: selectedLocation.isFeatured
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
    const data: LocationData = {
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
        faceStreamingEnabled: false, //state.faceStreamingEnabled.value,
        videoEnabled: state.videoEnabled.value,
        createdAt: '',
        updatedAt: ''
      },
      isLobby: false, //state.isLobby.value,
      isFeatured: false //state.isFeatured.value
    }

    state.formErrors.merge({
      name: state.name.value ? '' : t('admin:components.location.nameCantEmpty'),
      maxUsers: state.maxUsers.value ? '' : t('admin:components.location.maxUserCantEmpty'),
      scene: state.scene.value ? '' : t('admin:components.location.sceneCantEmpty'),
      type: state.type.value ? '' : t('admin:components.location.typeCantEmpty')
    })

    if (validateForm(state.value, state.formErrors.value)) {
      if (mode === LocationDrawerMode.Create) {
        locationMutation.create(data).catch((error) => {
          NotificationService.dispatchNotify(error.message, { variant: 'error' })
        })
      } else if (selectedLocation) {
        locationMutation.patch(selectedLocation.id, data).catch((error) => {
          NotificationService.dispatchNotify(error.message, { variant: 'error' })
        })
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
          disabled={viewMode || selectedScene !== undefined}
          onChange={handleChange}
        />

        {/* <InputSelect
          name="type"
          label={t('admin:components.location.type')}
          value={state?.value?.type}
          menu={locationTypesMenu}
          disabled={viewMode}
          onChange={handleChange}
        /> */}

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
            <Button className={styles.gradientButton} onClick={() => editMode.set(true)}>
              {t('admin:components.common.edit')}
            </Button>
          )}
        </DialogActions>
      </Container>
    </DrawerView>
  )
}

export default LocationDrawer
