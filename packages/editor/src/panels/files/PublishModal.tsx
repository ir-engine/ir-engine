/*
CPAL-1.0 License
The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.
Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.
The Original Code is Infinite Reality Engine.
The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.
All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import React, { lazy, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { NotificationService } from '@ir-engine/client-core/src/common/services/NotificationService'
import { PopoverState } from '@ir-engine/client-core/src/common/services/PopoverState'
import { useFind, useMutation } from '@ir-engine/common'
import {
  LocationData,
  LocationID,
  LocationPatch,
  LocationType,
  fileBrowserPath,
  locationPath,
  staticResourcePath
} from '@ir-engine/common/src/schema.type.module'
import { Entity, createEntity, hasComponent, setComponent } from '@ir-engine/ecs'
import { CurrentFilesQueryProvider, useCurrentFiles } from '@ir-engine/editor/src/panels/files/helpers'
import { EditorState } from '@ir-engine/editor/src/services/EditorServices'
import { FilesState } from '@ir-engine/editor/src/services/FilesState'
import { GLTFComponent } from '@ir-engine/engine/src/gltf/GLTFComponent'
import { getState, useHookstate, useMutableState } from '@ir-engine/hyperflux'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { ColliderComponent } from '@ir-engine/spatial/src/physics/components/ColliderComponent'
import { addObjectToGroup } from '@ir-engine/spatial/src/renderer/components/GroupComponent'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { proxifyParentChildRelationships } from '@ir-engine/spatial/src/renderer/functions/proxifyParentChildRelationships'
import { EntityTreeComponent, iterateEntityNode } from '@ir-engine/spatial/src/transform/components/EntityTree'
import { Button, Input, Select } from '@ir-engine/ui'
import ErrorDialog from '@ir-engine/ui/src/components/tailwind/ErrorDialog'
import LoadingView from '@ir-engine/ui/src/primitives/tailwind/LoadingView'
import { ModalHeader } from '@ir-engine/ui/src/primitives/tailwind/Modal'
import Toggle from '@ir-engine/ui/src/primitives/tailwind/Toggle'
import { HiLink } from 'react-icons/hi2'
import { Scene } from 'three'
import { saveSceneGLTF } from '../../functions/sceneFunctions'
const getDefaultErrors = () => ({
  name: '',
  maxUsers: '',
  scene: '',
  serverError: ''
})

const StudioSections = lazy(
  () => import('@ir-engine/ui/src/components/editor/Modal/AddEditLocationModalStudioSections')
)

const locationTypeOptions = [
  { label: 'Private', value: 'private' },
  { label: 'Public', value: 'public' },
  { label: 'Showroom', value: 'showroom' }
]
export const PublishModalWithProvider = (props) => (
  <CurrentFilesQueryProvider>
    <PublishModal {...props} />
  </CurrentFilesQueryProvider>
)
export default function PublishModal(props: {
  action: string
  location?: LocationType
  sceneID?: string | null
  sceneModified?: boolean
  inStudio?: boolean

  onPublish?: () => Promise<void>
}) {
  const { t } = useTranslation()

  const locationID = useHookstate(props.location?.id || null)

  const params = {
    query: {
      id: locationID.value,
      action: props.action
    }
  }

  const locationQuery = useFind(locationPath, locationID.value ? params : undefined)
  const location = locationID.value ? locationQuery.data[0] : undefined

  const locationMutation = useMutation(locationPath)

  const publishLoading = useHookstate(false)
  const unPublishLoading = useHookstate(false)
  const isLoading = locationQuery.status === 'pending' || publishLoading.value || unPublishLoading.value
  const errors = useHookstate(getDefaultErrors())

  const name = useHookstate(location?.name || '')
  const maxUsers = useHookstate(location?.maxUsersPerInstance || 5)

  const scene = useHookstate((location ? location.sceneId : props.sceneID) || '')
  const videoEnabled = useHookstate<boolean>(location?.locationSetting.videoEnabled || true)
  const audioEnabled = useHookstate<boolean>(location?.locationSetting.audioEnabled || true)
  const screenSharingEnabled = useHookstate<boolean>(location?.locationSetting.screenSharingEnabled || true)
  const locationType = useHookstate(location?.locationSetting.locationType || 'public')
  const filesState = useMutableState(FilesState)
  const fileService = useMutation(fileBrowserPath)
  const { files, createNewFolder, createPublishFolder } = useCurrentFiles()
  useEffect(() => {
    if (location) {
      name.set(location.name)
      maxUsers.set(location.maxUsersPerInstance)
      videoEnabled.set(location.locationSetting.videoEnabled)
      audioEnabled.set(location.locationSetting.audioEnabled)
      screenSharingEnabled.set(location.locationSetting.screenSharingEnabled)
      locationType.set(location.locationSetting.locationType)

      if (!props.sceneID) scene.set(location.sceneId)
    }
  }, [location])

  const scenes = useFind(staticResourcePath, {
    query: {
      paginate: false,
      type: 'scene'
    }
  })

  const handleCreateFolder = async () => {
    if (!createNewFolder) {
      console.error('Cannot create folder because createNewFolder is undefined.')
      return
    }
    //if exist publish folder dont create\

    const ifFolderExist = files.some((file) => file.fullName === 'publish' && file.type === 'folder')
    if (ifFolderExist) {
      console.log('Publish folder already exist')
      //return
    } else {
      //await createNewFolder('publish')
      await createPublishFolder()
    }
    const { projectName, sceneName, rootEntity, sceneAssetID } = getState(EditorState)
    const abortController = new AbortController()
    try {
      if (sceneName && projectName) {
        const saveScenePath = getState(EditorState)
          .scenePath!.split('/')
          .slice(0, -1)
          .join('/')
          .replace('scenes', 'publish')
        await saveSceneGLTF(
          sceneAssetID!,
          projectName,
          sceneName + '-duplicated',
          abortController.signal,
          true,
          saveScenePath
        )
        //add all mesh into one entity
        //get all entities
        const meshParentEntity = createEntity()
        const obj = new Scene()
        addObjectToGroup(meshParentEntity, obj)
        proxifyParentChildRelationships(obj)
        const rootEntity = getState(EditorState).rootEntity
        const meshEntity = [] as Entity[]
        setComponent(meshParentEntity, EntityTreeComponent, { parentEntity: rootEntity })
        setComponent(meshParentEntity, NameComponent, 'combined mesh entity')
        setComponent(meshParentEntity, GLTFComponent)
        iterateEntityNode(rootEntity, (entity) => {
          if (hasComponent(entity, MeshComponent)) {
            if (meshEntity.includes(entity) || hasComponent(entity, ColliderComponent)) return
            meshEntity.push(entity)
            setComponent(entity, EntityTreeComponent, { parentEntity: meshParentEntity })
          }
        })

        //exportRelativeGLTF
        PopoverState.hidePopupover()
      }
    } catch (error) {
      PopoverState.showPopupover(
        <ErrorDialog title={t('editor:savingError')} description={error?.message || t('editor:savingErrorMsg')} />
      )
    }
  }
  const handlePublish = async () => {
    errors.set(getDefaultErrors())

    if (!name.value) {
      errors.name.set(t('admin:components.location.nameCantEmpty'))
    }
    if (!maxUsers.value) {
      errors.maxUsers.set(t('admin:components.location.maxUserCantEmpty'))
    }
    if (maxUsers.value > 5) {
      errors.maxUsers.set(t('admin:components.location.maxUserExceeded'))
    }
    if (!scene.value) {
      errors.scene.set(t('admin:components.location.sceneCantEmpty'))
    }
    if (Object.values(errors.value).some((value) => value.length > 0)) {
      return
    }

    publishLoading.set(true)

    if (props.onPublish) {
      try {
        await props.onPublish()
      } catch (e) {
        errors.serverError.set(e.message)
        publishLoading.set(false)
        return
      }
    }

    const locationData: LocationData = {
      name: name.value,
      sceneId: scene.value,
      maxUsersPerInstance: maxUsers.value,
      locationSetting: {
        locationId: '' as LocationID,
        locationType: locationType.value,
        audioEnabled: Boolean(audioEnabled.value),
        screenSharingEnabled: Boolean(screenSharingEnabled.value),
        faceStreamingEnabled: false,
        videoEnabled: Boolean(videoEnabled.value)
      },
      isLobby: false,
      isFeatured: false
    }

    try {
      if (location?.id) {
        await locationMutation.patch(location.id, locationData as LocationPatch, {
          query: { projectId: location.projectId }
        })
      } else {
        const response = await locationMutation.create(locationData)
        locationID.set(response.id)
      }
      await locationQuery.refetch()
    } catch (err) {
      errors.serverError.set(err.message)
    }
    publishLoading.set(false)
  }

  const unPublishLocation = async () => {
    if (location?.id) {
      unPublishLoading.set(true)
      try {
        await locationMutation.remove(location.id, { query: { projectId: location.projectId } })
        locationID.set(null)
        await locationQuery.refetch()
      } catch (err) {
        errors.serverError.set(err.message)
      }
      unPublishLoading.set(false)
    }
  }

  return (
    <div className="relative z-50 w-[50vw] bg-theme-surface-main">
      <div className="relative rounded-lg shadow">
        <ModalHeader
          onClose={PopoverState.hidePopupover}
          title={location?.id ? t('editor:toolbar.publishLocation.update') : t('editor:toolbar.publishLocation.create')}
        />
        <div className="h-fit max-h-[60vh] w-full overflow-y-auto px-10 py-6">
          <div className="relative grid w-full gap-6">
            {errors.serverError.value && <p className="mb-3 text-red-700">{errors.serverError.value}</p>}
            {location && (
              <button
                className="flex w-full cursor-default items-center justify-center gap-x-1 text-left text-xs font-medium"
                data-testid="publish-panel-copy-link-buttons-group"
              >
                <div
                  className="cursor-pointer text-blue-primary hover:underline"
                  onClick={() => window.open(new URL(location.url))}
                >
                  {location.url}
                </div>
                <HiLink
                  className="z-10 h-4 w-4 cursor-pointer"
                  onClick={() => {
                    navigator.clipboard.writeText(new URL(location.url).href)
                    NotificationService.dispatchNotify(t('editor:toolbar.publishLocation.locationLinkCopied'), {
                      variant: 'success'
                    })
                  }}
                />
              </button>
            )}
            <Input
              labelProps={{ text: t('admin:components.location.lbl-name'), position: 'top' }}
              value={name.value}
              data-testid="publish-panel-location-name"
              onChange={(event) => name.set(event.target.value)}
              state={errors.name.value ? 'error' : undefined}
              helperText={errors.name.value}
              disabled={isLoading}
              fullWidth
              height="xl"
            />
            <Input
              type="number"
              labelProps={{ text: t('admin:components.location.lbl-maxuser'), position: 'top' }}
              value={maxUsers.value}
              data-testid="publish-panel-location-max-users"
              onChange={(event) => maxUsers.set(Math.max(parseInt(event.target.value, 0), 0))}
              state={errors.maxUsers.value ? 'error' : undefined}
              helperText={errors.maxUsers.value}
              disabled={isLoading}
              fullWidth
              height="xl"
            />
            <Select
              labelProps={{
                text: t('admin:components.location.lbl-scene'),
                position: 'top'
              }}
              value={scene.value}
              onChange={(value: string) => scene.set(value)}
              disabled={!!props.sceneID || scenes.status !== 'success' || isLoading}
              options={
                scenes.status === 'pending'
                  ? [{ value: '', label: t('common:select.fetching') }]
                  : [
                      { value: '', label: t('admin:components.location.selectScene'), disabled: true },
                      ...scenes.data.map((scene) => {
                        const project = scene.project
                        const name = scene.key.split('/').pop()!.split('.').at(0)!
                        return {
                          label: `${name} (${project})`,
                          value: scene.id
                        }
                      })
                    ]
              }
              state={errors.scene.value ? 'error' : undefined}
              helperText={errors.scene.value}
              width="full"
              inputHeight="xl"
            />
            {/*<Select
              labelProps={{
                text: t('admin:components.location.type'),
                position: 'top'
              }}
              value={locationType.value}
              onChange={(value) => locationType.set(value as 'private' | 'public' | 'showroom')}
              options={locationTypeOptions}
              disabled={true}
              width="full"
              inputSizeVariant="xl"
            />*/}
            <Toggle
              label={t('admin:components.location.lbl-ve')}
              value={videoEnabled.value}
              onChange={videoEnabled.set}
              disabled={isLoading}
            />
            <Toggle
              label={t('admin:components.location.lbl-ae')}
              value={audioEnabled.value}
              onChange={audioEnabled.set}
              disabled={isLoading}
            />
            <Toggle
              label={t('admin:components.location.lbl-se')}
              value={screenSharingEnabled.value}
              onChange={screenSharingEnabled.set}
              disabled={isLoading}
            />
            {props.inStudio && (
              <React.Suspense fallback={null}>
                <StudioSections />
              </React.Suspense>
            )}
          </div>
        </div>

        <div className="grid grid-flow-col border-t border-t-theme-primary px-6 py-5">
          <Button
            variant="tertiary"
            data-testid="publish-panel-cancel-button"
            onClick={() => PopoverState.hidePopupover()}
          >
            {t('common:components.cancel')}
          </Button>
          <div className="ml-auto flex items-center gap-2">
            {location?.id && (
              <Button
                className="bg-[#162546]"
                data-testid="publish-panel-unpublish-button"
                disabled={isLoading}
                onClick={unPublishLocation}
              >
                {t('editor:toolbar.publishLocation.unpublish')}
                {unPublishLoading.value ? <LoadingView spinnerOnly className="h-6 w-6" /> : undefined}
              </Button>
            )}
            <Button data-testid="publish-panel-publish-or-update-button" disabled={isLoading} onClick={handlePublish}>
              {location?.id
                ? t('common:components.update')
                : props.sceneModified
                ? t('editor:toolbar.publishLocation.saveAndPublish')
                : t('editor:toolbar.publishLocation.title')}
              {publishLoading.value ? <LoadingView spinnerOnly className="h-6 w-6" /> : undefined}
            </Button>
            <Button onClick={handleCreateFolder}>{t('save duplicate scene')}</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
