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

import React, { lazy, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

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
import { exportRelativeGLTF } from '@ir-engine/editor/src/functions/exportGLTF'
import { saveSceneGLTF } from '@ir-engine/editor/src/functions/sceneFunctions'
import { EditorState } from '@ir-engine/editor/src/services/EditorServices'
import { SceneThumbnailState } from '@ir-engine/editor/src/services/SceneThumbnailState'
import { ModelTransformParameters } from '@ir-engine/engine/src/assets/classes/ModelTransform'
import { pathJoin } from '@ir-engine/engine/src/assets/functions/miscUtils'
import { GLTFComponent } from '@ir-engine/engine/src/gltf/GLTFComponent'
import { SourceComponent } from '@ir-engine/engine/src/scene/components/SourceComponent'
import { getState, useHookstate } from '@ir-engine/hyperflux'
import { TransformComponent } from '@ir-engine/spatial'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { ColliderComponent } from '@ir-engine/spatial/src/physics/components/ColliderComponent'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { computeTransformMatrix } from '@ir-engine/spatial/src/transform/systems/TransformSystem'

import { Button, DropdownItem, Input, Select, Tooltip } from '@ir-engine/ui'
import { ContextMenu } from '@ir-engine/ui/src/components/tailwind/ContextMenu'
import ErrorDialog from '@ir-engine/ui/src/components/tailwind/ErrorDialog'
import { CheckCircleLg, Copy02Sm, EllipsisVertical } from '@ir-engine/ui/src/icons'
import LoadingView from '@ir-engine/ui/src/primitives/tailwind/LoadingView'
import Toggle from '@ir-engine/ui/src/primitives/tailwind/Toggle'
import { HiOutlineInformationCircle } from 'react-icons/hi2'
import { Quaternion, Vector3 } from 'three'
import { NotificationService } from '../../../common/services/NotificationService'
import CompressedPublishConfirmation from './CompressedPublishConfirmation'

function formatPublishedDate(isoString) {
  const date = new Date(isoString)

  const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
  const formattedDate = date.toLocaleDateString('en-US', options)

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZoneName: 'short'
  }
  const formattedTime = date.toLocaleTimeString('en-US', timeOptions)

  return { formattedDate, formattedTime }
}
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

const LOCATION_MAX = 5

type AddEditLocationModalProps = Readonly<{
  action: string
  location?: LocationType
  sceneID?: string | null
  sceneModified?: boolean
  inStudio?: boolean
  projectFullName?: string

  onPublish?: () => Promise<void>
  onPublishSuccess?: (location: LocationType) => void
}>

export default function AddEditLocationModal(props: AddEditLocationModalProps) {
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
  const isNewPublished = useHookstate(false)
  const isLoading = locationQuery.status === 'pending' || publishLoading.value || unPublishLoading.value
  const errors = useHookstate(getDefaultErrors())

  const name = useHookstate(location?.name || '')
  const maxUsers = useHookstate(LOCATION_MAX)

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

  const projectQueryParam = props.action === 'studio' && !props.inStudio ? props.projectFullName : undefined

  const scenes = useFind(staticResourcePath, {
    query: {
      paginate: false,
      type: 'scene',
      project: projectQueryParam
    }
  })

  const scenesOptions = useMemo(() => {
    if (scenes.status === 'pending') {
      return [{ value: '', label: t('common:select.fetching') }]
    }
    if (scenes.status === 'success' && scenes.data.length) {
      return [
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
    return []
  }, [scenes])

  const validate = (): boolean => {
    errors.set(getDefaultErrors())

    if (!name.value.trim()) {
      errors.name.set(t('admin:components.location.nameCantEmpty'))
    }
    if (!maxUsers.value) {
      errors.maxUsers.set(t('admin:components.location.maxUserCantEmpty'))
    }
    if (maxUsers.value > LOCATION_MAX) {
      errors.maxUsers.set(t('admin:components.location.maxUserExceeded'))
    }
    if (!scene.value) {
      errors.scene.set(t('admin:components.location.sceneCantEmpty'))
    }

    return !Object.values(errors.value).some((value) => value.length > 0)
  }

  const handlePublishFolder = async () => {
    const isValid = validate()
    if (!isValid) {
      return
    }
    PopoverState.showPopupover(<CompressedPublishConfirmation />)
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

        const scenename = getState(EditorState).sceneName?.split('.').shift()
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
        EditorControlFunctions.modifyProperty([combinedMeshEntity], EntityTreeComponent, { parentEntity: rootEntity })
        setComponent(combinedMeshEntity, NameComponent, 'combined mesh entity')
        setComponent(combinedMeshEntity, TransformComponent)
        setComponent(combinedMeshEntity, UUIDComponent, UUIDComponent.generateUUID())
        const newSource = GLTFComponent.getInstanceID(rootEntity)
        setComponent(combinedMeshEntity, SourceComponent, newSource)
        const srcURL = pathJoin(config.client.fileServer, saveScenePath + '/' + scenename + '/combined-mesh.gltf')
        iterateEntityNode(rootEntity, (entity) => {
          if (hasComponent(entity, MeshComponent)) {
            if (meshEntity.includes(entity) || hasComponent(entity, ColliderComponent)) return
            meshEntity.push(entity)
            const transform = getComponent(entity, TransformComponent)
            const meshRootEntity = findMeshRootEntity(entity, rootEntity)
            if (meshRootEntity === null) return
            if (!exportParentEntity.includes(meshRootEntity as Entity)) {
              exportParentEntity.push(meshRootEntity as Entity)
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
        await exportRelativeGLTF(
          combinedMeshEntity,
          projectName,
          'public/publish/' + scenename + '/' + 'combined-mesh.gltf',
          false
        )
        EditorControlFunctions.modifyProperty([combinedMeshEntity], GLTFComponent, { src: srcURL })
        EditorControlFunctions.modifyProperty([combinedMeshEntity], VisibleComponent, { visible: true })

        for (const entity of exportParentEntity) {
          const url = getComponent(entity, GLTFComponent).src
          const saveName = url.split('/').pop()?.split('.').shift()
          await exportRelativeGLTF(entity, projectName, 'public/publish/' + scenename + '/' + saveName + '.gltf', false)
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
        // const result = createSceneEntity('container')
        // const variant = createSceneEntity('LOD Variant', result)
        // const heuristic = Heuristic.DISTANCE
        // setComponent(variant, VariantComponent, {
        //   levels: lods.map((lod, lodIndex) => ({
        //     src: `${LoaderUtils.extractUrlBase(srcURL)}${lod.params.dst}.${lod.params.modelFormat}`,
        //     metadata: {
        //       ...lod.variantMetadata,
        //       ...transformMetadata[lodIndex]
        //     }
        //   })),
        //   heuristic
        // })
        // const destinationPath = srcURL.replace(/\.[^.]*$/, `-integrated.gltf`)
        // const gltfEntity = getAncestorWithComponents(result, [GLTFComponent])
        // const uuid = getComponent(gltfEntity, UUIDComponent)
        // const sourceID = SourceComponent.getSourceID(uuid, destinationPath)
        // iterateEntityNode(result, (entity) => setComponent(entity, SourceComponent, sourceID))
        // await exportGLTF(result, destinationPath, false)
        const compressedFilePath = srcURL.replace(/\.[^.]*$/, `-LOD2.gltf`)
        //update src from combined mesh to compressed mesh
        compressionLoading.set(false)
        EditorControlFunctions.modifyProperty([combinedMeshEntity], GLTFComponent, { src: compressedFilePath })

        //save duplicated scene and publish that
        await saveSceneGLTF(
          sceneAssetID!,
          projectName,
          sceneName.replace('.gltf', '-compressed.gltf'),
          abortController.signal,
          true,
          saveScenePath + '/' + scenename
        )

        await handlePublish(true)
        //re-open the original scene
        const studioUrl = `${window.location.origin}/studio?project=${projectName}&scenePath=${scenePath}`
        window.open(studioUrl, '_blank')?.focus()
        PopoverState.hidePopupover()
      }
    } catch (error) {
      PopoverState.showPopupover(
        <ErrorDialog title={t('editor:savingError')} description={error?.message || t('editor:savingErrorMsg')} />
      )
    }
  }

  const handlePublish = async (inCompress = false) => {
    const isValid = validate()
    if (!isValid) {
      return
    }
    publishLoading.set(true)

    const updateSceneID = getState(EditorState).sceneAssetID

    try {
      if (updateSceneID) {
        await SceneThumbnailState.createThumbnail()
        await SceneThumbnailState.uploadThumbnail()
      }
    } catch (e) {
      errors.serverError.set(e.message)
    }

    if (!inCompress && props.onPublish) {
      try {
        await props.onPublish()
      } catch (e) {
        errors.serverError.set(e.message)
        publishLoading.set(false)
        return
      }
    }

    const locationData: LocationData = {
      name: name.value.trim(),
      sceneId: updateSceneID || (location?.sceneId as string),
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
      isNewPublished.set(true)
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

  const anchorEvent = useHookstate<null | React.MouseEvent<HTMLElement>>(null)

  useEffect(() => {
    if (isNewPublished.value && location && props.onPublishSuccess) {
      props.onPublishSuccess(location)
    }
  }, [location, props.onPublishSuccess, isNewPublished.value])

  return (
    <div className="absolute z-50 bg-surface-2 px-8 pt-6">
      <div className="relative rounded-lg py-2">
        <div className="flex justify-between pb-6">
          <span className="text-xl">
            {location?.id ? t('editor:toolbar.publishLocation.update') : t('editor:toolbar.publishLocation.create')}
          </span>
          <div className="flex items-center gap-3">
            {location ? (
              <span className="text-xs text-green-500">
                {t('editor:toolbar.publishLocation.publishDate', formatPublishedDate(location.createdAt))}
              </span>
            ) : (
              <span className="text-text-primary">{t('editor:toolbar.publishLocation.notYetPublished')}</span>
            )}
            <button onClick={(event) => anchorEvent.set(event)}>
              <EllipsisVertical />
            </button>
          </div>
        </div>

        <div className="h-fit max-h-[60vh] w-full overflow-y-auto">
          <div className="relative grid w-full gap-6">
            {errors.serverError.value && <p className="mb-3 text-red-700">{errors.serverError.value}</p>}
            {
              <div className={location ? 'border-y border-y-ui-outline' : ''}>
                {location && (
                  <LocationPublishSuccess published={isNewPublished.value ? false : !!location} url={location.url} />
                )}
              </div>
            }
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

            <Select
              labelProps={{
                text: t('admin:components.location.lbl-scene'),
                position: 'top'
              }}
              value={scene.value}
              onChange={(value: string) => scene.set(value)}
              disabled={!!props.sceneID || scenes.status !== 'success' || isLoading}
              options={scenesOptions}
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

            <div className="grid grid-cols-[276px_minmax(0,1fr)] gap-12 border-t border-t-ui-outline py-6">
              <div className="flex flex-col">
                {props.inStudio && (
                  <React.Suspense fallback={null}>
                    <StudioSections />
                  </React.Suspense>
                )}
              </div>

              <div className="grid h-full grid-rows-[auto,1fr] gap-5">
                <div className="flex h-auto flex-col self-start">
                  <h5>{t('editor:toolbar.publishLocation.multiplayerFeatures')}</h5>
                  <span className="text-xs">{t('editor:toolbar.publishLocation.multiplayerDescription')}</span>
                </div>

                <div className="flex flex-col gap-5">
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
                    placeholder="5 - Default"
                    max={LOCATION_MAX}
                  />
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
                </div>
              </div>
            </div>
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
            <Tooltip content={t('editor:toolbar.publishLocation.createCompressedScenePublishInfo')}>
              <Button className="bg-[#2F3A4D]" onClick={handlePublishFolder}>
                <HiOutlineInformationCircle />
                {t('editor:toolbar.publishLocation.createCompressedScenePublish')}
              </Button>
            </Tooltip>
            <Button
              data-testid="publish-panel-publish-or-update-button"
              disabled={isLoading}
              onClick={() => handlePublish()}
            >
              {location?.id
                ? t('common:components.update')
                : props.sceneModified
                ? t('editor:toolbar.publishLocation.saveAndPublish')
                : t('editor:toolbar.publishLocation.title')}
              {publishLoading.value ? <LoadingView spinnerOnly className="h-6 w-6" /> : undefined}
            </Button>
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

      <ContextMenu
        anchorEvent={anchorEvent.value as React.MouseEvent<HTMLElement>}
        onClose={() => anchorEvent.set(null)}
        className="z-9999"
      >
        <div className="w-[180px]" tabIndex={0}>
          <DropdownItem
            className="text-red-500"
            label={t('editor:toolbar.publishLocation.unpublish')}
            onMouseDown={(e) => {
              e.stopPropagation()
              unPublishLocation()
              anchorEvent.set(null)
            }}
          />
        </div>
      </ContextMenu>
    </div>
  )
}

const LocationPublishSuccess = ({ published, url }: { published: boolean; url: string }) => {
  const copied = useHookstate(false)
  const { t } = useTranslation()

  const handleCopy = () => {
    navigator.clipboard
      .writeText(url)
      .then(() => {
        copied.set(true)
        setTimeout(() => copied.set(false), 5000)

        NotificationService.dispatchNotify(t('editor:toolbar.publishLocation.locationLinkCopied'), {
          variant: 'success'
        })
      })
      .catch((err) => {
        alert(`Failed to copy URL: ${err}`)
      })
  }

  return (
    <div className={published ? 'border-b border-t border-black' : ''}>
      <div
        className={`flex items-center justify-between rounded p-3 ${
          published ? 'bg-transparent shadow' : 'bg-surface-success'
        }`}
      >
        <div className="flex items-center gap-4">
          <div className="flex h-full items-center">
            <CheckCircleLg className={`h-10 w-10 ${published ? 'text-green-500' : 'text-white'}`} />
          </div>

          <div className="flex flex-col">
            <span className="font-semibold text-text-primary">
              {published
                ? t('editor:toolbar.publishLocation.publishSuccess')
                : t('editor:toolbar.publishLocation.publicUrl')}
            </span>
            <span className="cursor-pointer py-1 text-sm font-light text-text-primary" onClick={() => window.open(url)}>
              {url}
            </span>
          </div>
        </div>

        <div className="flex items-center">
          <button
            onClick={handleCopy}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-white transition ${
              published ? 'bg-ui-success hover:bg-[#0e5026]' : 'bg-black bg-opacity-50'
            }`}
          >
            <Copy02Sm className="text-white" />
            {published ? t('editor:toolbar.publishLocation.copy') : t('editor:toolbar.publishLocation.copyPublicUrl')}
          </button>
        </div>
      </div>
    </div>
  )
}
