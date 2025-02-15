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

import { PopoverState } from '@ir-engine/client-core/src/common/services/PopoverState'
import { useFind, useMutation } from '@ir-engine/common'
import {
  LocationData,
  LocationID,
  LocationPatch,
  LocationType,
  locationPath,
  staticResourcePath
} from '@ir-engine/common/src/schema.type.module'
import { useHookstate } from '@ir-engine/hyperflux'
import { Button, DropdownItem, Input, Select } from '@ir-engine/ui'
import { ContextMenu } from '@ir-engine/ui/src/components/tailwind/ContextMenu'
import { CheckCircleLg, Copy02Sm, EllipsisVertical } from '@ir-engine/ui/src/icons'
import LoadingView from '@ir-engine/ui/src/primitives/tailwind/LoadingView'
import Toggle from '@ir-engine/ui/src/primitives/tailwind/Toggle'
import { NotificationService } from '../../../common/services/NotificationService'

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

export default function AddEditLocationModal(props: {
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
  const isNewPublished = useHookstate(false)
  const isLoading = locationQuery.status === 'pending' || publishLoading.value || unPublishLoading.value
  const errors = useHookstate(getDefaultErrors())

  const name = useHookstate(location?.name || '')
  const maxUsers = useHookstate(location?.maxUsersPerInstance || 5)

  const scene = useHookstate((location ? location.sceneId : props.sceneID) || '')
  const videoEnabled = useHookstate<boolean>(location?.locationSetting.videoEnabled || true)
  const audioEnabled = useHookstate<boolean>(location?.locationSetting.audioEnabled || true)
  const screenSharingEnabled = useHookstate<boolean>(location?.locationSetting.screenSharingEnabled || true)
  const locationType = useHookstate(location?.locationSetting.locationType || 'public')

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

  return (
    <div className="relative z-50 w-[60vw] bg-surface-2 px-8 pt-6">
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

            <div className="grid grid-cols-2 gap-12 border-t border-t-ui-outline py-6">
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
            <Button data-testid="publish-panel-publish-or-update-button" disabled={isLoading} onClick={handlePublish}>
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

      <ContextMenu
        anchorEvent={anchorEvent.value as React.MouseEvent<HTMLElement>}
        onClose={() => anchorEvent.set(null)}
        className="z-9999"
      >
        <div className="w-[180px]" tabIndex={0}>
          <DropdownItem
            className="text-red-500"
            label={t('editor:toolbar.publishLocation.unpublish')}
            onClick={unPublishLocation}
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
