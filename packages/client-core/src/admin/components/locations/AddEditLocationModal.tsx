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
import { config } from '@ir-engine/common/src/config'
import { ModelTransformStatus, transformModel } from '@ir-engine/common/src/model/ModelTransformFunctions'
import {
  LocationData,
  LocationID,
  LocationPatch,
  LocationType,
  locationPath,
  staticResourcePath
} from '@ir-engine/common/src/schema.type.module'
import {
  Entity,
  EntityTreeComponent,
  Layers,
  UUIDComponent,
  createEntity,
  getComponent,
  hasComponent,
  iterateEntityNode,
  setComponent
} from '@ir-engine/ecs'
import { LODVariantDescriptor, defaultLODs } from '@ir-engine/editor/src/constants/GLTFPresets'
import { EditorControlFunctions } from '@ir-engine/editor/src/functions/EditorControlFunctions'
import exportGLTF, { exportRelativeGLTF } from '@ir-engine/editor/src/functions/exportGLTF'
import { saveSceneGLTF } from '@ir-engine/editor/src/functions/sceneFunctions'
import { EditorState } from '@ir-engine/editor/src/services/EditorServices'
import { ModelTransformParameters } from '@ir-engine/engine/src/assets/classes/ModelTransform'
import { pathJoin } from '@ir-engine/engine/src/assets/functions/miscUtils'
import { GLTFComponent } from '@ir-engine/engine/src/gltf/GLTFComponent'
import { SourceComponent } from '@ir-engine/engine/src/scene/components/SourceComponent'
import { Heuristic, VariantComponent } from '@ir-engine/engine/src/scene/components/VariantComponent'
import { createSceneEntity } from '@ir-engine/engine/src/scene/functions/createSceneEntity'
import { getState, useHookstate } from '@ir-engine/hyperflux'
import { TransformComponent } from '@ir-engine/spatial'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { ColliderComponent } from '@ir-engine/spatial/src/physics/components/ColliderComponent'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { computeTransformMatrix } from '@ir-engine/spatial/src/transform/systems/TransformSystem'
import { Button, Input, Select } from '@ir-engine/ui'
import ErrorDialog from '@ir-engine/ui/src/components/tailwind/ErrorDialog'
import LoadingView from '@ir-engine/ui/src/primitives/tailwind/LoadingView'
import { ModalHeader } from '@ir-engine/ui/src/primitives/tailwind/Modal'
import Toggle from '@ir-engine/ui/src/primitives/tailwind/Toggle'
import { HiLink } from 'react-icons/hi2'
import { LoaderUtils, Quaternion, Vector3 } from 'three'
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

export default function AddEditLocationModal(props: {
  action: string
  location?: LocationType
  sceneID?: string | null
  sceneModified?: boolean
  inStudio?: boolean

  onPublish?: () => Promise<void>
}) {
  const { t } = useTranslation()
  const compressionLoading = useHookstate(false)
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
  const compressionProgress = useHookstate({
    progress: 0,
    caption: ''
  })
  const lods = useHookstate<LODVariantDescriptor[]>([])

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
  const handlePublishFolder = async () => {
    // if (!createNewFolder) {
    //   console.error('Cannot create folder because createNewFolder is undefined.')
    //   return
    // }
    // //if exist publish folder dont create\

    // const ifFolderExist = files.some((file) => file.fullName === 'publish' && file.type === 'folder')
    // if (ifFolderExist) {
    //   console.log('Publish folder already exist')
    //   //return
    // } else {
    //   //await createNewFolder('publish')
    //   await createPublishFolder()
    // }
    const { projectName, sceneName, rootEntity, sceneAssetID, scenePath } = getState(EditorState)
    const abortController = new AbortController()
    try {
      //save current scene
      await saveSceneGLTF(sceneAssetID!, projectName!, sceneName!, abortController.signal)
      // save as duplicate scene
      if (sceneName && projectName) {
        const saveScenePath = getState(EditorState)
          .scenePath!.split('/')
          .slice(0, -1)
          .join('/')
          .replace('scenes', 'publish')

        const scenename = getState(EditorState).sceneName
        //add all mesh into one entity
        const combinedMeshEntity = createEntity(Layers.Authoring) //export entity need compress
        const rootEntity = getState(EditorState).rootEntity
        const meshEntity = [] as Entity[] //entity with mesh
        const exportParentEntity = [] as Entity[] //parent entity without mesh
        const findMeshRootEntity = (entity: Entity, rootEntity: Entity) => {
          const parentEntity = getComponent(entity, EntityTreeComponent)?.parentEntity
          if (!parentEntity) return null
          if (parentEntity === rootEntity) return entity
          return findMeshRootEntity(parentEntity, rootEntity)
        }
        setComponent(combinedMeshEntity, EntityTreeComponent, { parentEntity: rootEntity })
        setComponent(combinedMeshEntity, NameComponent, 'combined mesh entity')
        setComponent(combinedMeshEntity, TransformComponent)
        setComponent(combinedMeshEntity, UUIDComponent, UUIDComponent.generateUUID())

        const srcURL = pathJoin(config.client.fileServer, saveScenePath + '/combined-mesh.gltf')
        iterateEntityNode(rootEntity, (entity) => {
          if (hasComponent(entity, MeshComponent)) {
            if (meshEntity.includes(entity) || hasComponent(entity, ColliderComponent)) return
            meshEntity.push(entity)
            const transform = getComponent(entity, TransformComponent)
            const meshRootEntity = findMeshRootEntity(entity, rootEntity)
            if (!exportParentEntity.includes(meshRootEntity)) {
              exportParentEntity.push(meshRootEntity)
            }

            computeTransformMatrix(entity)
            const worldpos = new Vector3()
            const worldrot = new Quaternion()
            const getWorldScale = new Vector3()
            transform.matrixWorld.decompose(worldpos, worldrot, getWorldScale)
            EditorControlFunctions.modifyProperty([entity], TransformComponent, {
              position: worldpos,
              rotation: worldrot,
              scale: getWorldScale
            })

            //reparent to combined mesh entity
            EditorControlFunctions.modifyProperty([entity], EntityTreeComponent, { parentEntity: combinedMeshEntity })
          }
        })
        //export parent entities and combined mesh entity
        await exportRelativeGLTF(combinedMeshEntity, projectName, 'public/publish/combined-mesh.gltf', false)
        EditorControlFunctions.modifyProperty([combinedMeshEntity], GLTFComponent, { src: srcURL })
        EditorControlFunctions.modifyProperty([combinedMeshEntity], VisibleComponent, { visible: true })

        for (const entity of exportParentEntity) {
          const url = getComponent(entity, GLTFComponent).src
          const saveName = url.split('/').pop()?.split('.').shift()
          await exportRelativeGLTF(entity, projectName, 'public/publish/' + saveName + '.gltf', false)
          EditorControlFunctions.modifyProperty([entity], GLTFComponent, {
            src: srcURL.replace('combined-mesh', saveName as string)
          })
          setComponent(entity, VisibleComponent, true)
        }

        //combined mesh entity to compression
        const transformMetadata: Record<string, any>[] = []
        const progressCaptions: Record<ModelTransformStatus, string> = {
          [ModelTransformStatus.TransformingModels]: 'editor:properties.model.transform.status.transformingmodels',
          [ModelTransformStatus.ProcessingTexture]: 'editor:properties.model.transform.status.processingtexture',
          [ModelTransformStatus.WritingFiles]: 'editor:properties.model.transform.status.writingfiles',
          [ModelTransformStatus.Complete]: 'editor:properties.model.transform.status.complete'
        }
        const fileName = srcURL.split('/').pop()!.split('.').shift()!
        const defaults = defaultLODs.map((defaultLOD) => {
          const lod = JSON.parse(JSON.stringify(defaultLOD)) as LODVariantDescriptor
          lod.params.dst = fileName + lod.suffix
          lod.params.modelFormat = srcURL.endsWith('.gltf') ? 'gltf' : srcURL.endsWith('.vrm') ? 'vrm' : 'glb'
          lod.params.resourceUri = ''
          return lod
        })
        lods.set(defaults)
        let fileLODs = lods.value as LODVariantDescriptor[]

        const lodVariantParams: ModelTransformParameters[] = fileLODs.map((lod) => ({
          ...lod.params
        }))
        compressionLoading.set(true)
        compressionProgress.set({
          progress: 0,
          caption: 'start compression'
        })
        await transformModel(
          srcURL,
          [lodVariantParams[2]],
          (i, key, data) => {
            if (!transformMetadata[i]) transformMetadata[i] = {}
            transformMetadata[i][key] = data
          },
          (progress, status, numerator, denominator) => {
            const caption = t(progressCaptions[status]!, {
              numerator: numerator! + 1,
              denominator
            })
            compressionProgress.set({ progress, caption })
          }
        )
        const result = createSceneEntity('container')
        const variant = createSceneEntity('LOD Variant', result)
        const heuristic = Heuristic.DISTANCE
        setComponent(variant, VariantComponent, {
          levels: lods.map((lod, lodIndex) => ({
            src: `${LoaderUtils.extractUrlBase(srcURL)}${lod.params.dst}.${lod.params.modelFormat}`,
            metadata: {
              ...lod.variantMetadata,
              ...transformMetadata[lodIndex]
            }
          })),
          heuristic
        })
        const destinationPath = srcURL.replace(/\.[^.]*$/, `-integrated.gltf`)
        iterateEntityNode(result, (entity) => setComponent(entity, SourceComponent, destinationPath))
        await exportGLTF(result, destinationPath, false)
        const compressedFilePath = srcURL.replace(/\.[^.]*$/, `-LOD3.gltf`)
        //update src from combined mesh to compressed mesh
        EditorControlFunctions.modifyProperty([combinedMeshEntity], GLTFComponent, { src: compressedFilePath })
        //save current scene before create location
        const newSceneAssetID = getState(EditorState).sceneAssetID
        const newSceneName = getState(EditorState).sceneName
        await saveSceneGLTF(newSceneAssetID!, projectName!, newSceneName!, abortController.signal)

        await handlePublish()
        //re-open the original scene
        const studioUrl = `${window.location.origin}/studio?project=${projectName}&scenePath=${scenePath}`
        window.open(studioUrl, '_blank')?.focus()
        compressionLoading.set(false)
        await saveSceneGLTF(
          sceneAssetID!,
          projectName,
          sceneName + '-duplicated',
          abortController.signal,
          true,
          saveScenePath
        )
        //PopoverState.hidePopupover()
      }
    } catch (error) {
      PopoverState.showPopupover(
        <ErrorDialog title={t('editor:savingError')} description={error?.message || t('editor:savingErrorMsg')} />
      )
    }
  }

  const handlePublish = async () => {
    errors.set(getDefaultErrors())

    if (!name.value.trim()) {
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
    const updateSceneID = getState(EditorState).sceneAssetID
    const locationData: LocationData = {
      name: name.value.trim(),
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
        await locationMutation.patch(location.id, { ...locationData, id: location.id } as LocationPatch, {
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
    <div className="relative z-50 w-[50vw] bg-surface-1">
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
                  className="cursor-pointer text-ui-primary hover:underline"
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

        <div className="grid grid-flow-col border-t border-t-ui-outline px-6 py-5">
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
            <Button onClick={handlePublishFolder}>{t('save duplicate scene and publish')}</Button>
          </div>
        </div>
      </div>
      <div className="flex justify-end justify-items-stretch px-8">
        {compressionLoading.value ? (
          <div className="flex w-full flex-col">
            <div className="h-4 w-full overflow-hidden rounded bg-white">
              <div
                className="bg-blue-primary h-4 w-full origin-left transition-transform"
                style={{
                  transform: `scaleX(${compressionProgress.progress.value})`
                }}
              />
            </div>
            {compressionProgress.caption.value}
          </div>
        ) : null}
      </div>
    </div>
  )
}
