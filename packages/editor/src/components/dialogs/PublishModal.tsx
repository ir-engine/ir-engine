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

import React from 'react'
import { useTranslation } from 'react-i18next'

import { PopoverState } from '@etherealengine/client-core/src/common/services/PopoverState'
import {
  LocationData,
  LocationID,
  locationPath,
  LocationType,
  staticResourcePath
} from '@etherealengine/common/src/schema.type.module'
import { useHookstate } from '@etherealengine/hyperflux'
import { useFind, useMutation } from '@etherealengine/spatial/src/common/functions/FeathersHooks'
import Button from '@etherealengine/ui/src/primitives/tailwind/Button'
import Input from '@etherealengine/ui/src/primitives/tailwind/Input'
import LoadingView from '@etherealengine/ui/src/primitives/tailwind/LoadingView'
import { ModalHeader } from '@etherealengine/ui/src/primitives/tailwind/Modal'
import Select from '@etherealengine/ui/src/primitives/tailwind/Select'
import Toggle from '@etherealengine/ui/src/primitives/tailwind/Toggle'
import { HiLink } from 'react-icons/hi2'

const getDefaultErrors = () => ({
  name: '',
  maxUsers: '',
  scene: '',
  serverError: ''
})

const locationTypeOptions = [
  { label: 'Private', value: 'private' },
  { label: 'Public', value: 'public' },
  { label: 'Showroom', value: 'showroom' }
]

export default function PublishSceneModal({ location, sceneID }: { location?: LocationType; sceneID: string | null }) {
  const { t } = useTranslation()

  const locationMutation = useMutation(locationPath)

  const submitLoading = useHookstate(false)
  const errors = useHookstate(getDefaultErrors())

  const name = useHookstate(location?.name || '')
  const maxUsers = useHookstate(location?.maxUsersPerInstance || 20)

  const scene = useHookstate((location ? location.sceneId : sceneID) ?? '')
  const videoEnabled = useHookstate<boolean>(location?.locationSetting.videoEnabled || true)
  const audioEnabled = useHookstate<boolean>(location?.locationSetting.audioEnabled || true)
  const screenSharingEnabled = useHookstate<boolean>(location?.locationSetting.screenSharingEnabled || true)
  const locationType = useHookstate(location?.locationSetting.locationType || 'public')

  const scenes = useFind(staticResourcePath, {
    query: {
      paginate: false
    }
  })

  const handleSubmit = async () => {
    errors.set(getDefaultErrors())

    if (!name.value) {
      errors.name.set(t('admin:components.location.nameCantEmpty'))
    }
    if (!maxUsers.value) {
      errors.maxUsers.set(t('admin:components.location.maxUserCantEmpty'))
    }
    if (!scene.value) {
      errors.scene.set(t('admin:components.location.sceneCantEmpty'))
    }
    if (Object.values(errors.value).some((value) => value.length > 0)) {
      return
    }

    submitLoading.set(true)

    const locationData: LocationData = {
      name: name.value,
      slugifiedName: '',
      sceneId: scene.value,
      maxUsersPerInstance: maxUsers.value,
      locationSetting: {
        id: '',
        locationId: '' as LocationID,
        locationType: locationType.value,
        audioEnabled: audioEnabled.value,
        screenSharingEnabled: screenSharingEnabled.value,
        faceStreamingEnabled: false,
        videoEnabled: videoEnabled.value,
        createdAt: '',
        updatedAt: ''
      },
      isLobby: false,
      isFeatured: false
    }

    try {
      if (location?.id) {
        await locationMutation.patch(location.id, locationData)
      } else {
        await locationMutation.create(locationData)
      }
      PopoverState.hidePopupover()
    } catch (err) {
      errors.serverError.set(err.message)
    }
    submitLoading.set(false)
  }

  const unpublishLocation = async () => {
    if (location?.id) {
      submitLoading.set(true)
      try {
        await locationMutation.remove(location.id)
        PopoverState.hidePopupover()
      } catch (err) {
        errors.serverError.set(err.message)
        submitLoading.set(false)
      }
    }
  }

  return (
    <div className="relative z-50 max-h-[80vh] w-[50vw] bg-theme-surface-main">
      <div className="relative rounded-lg shadow">
        <ModalHeader
          onClose={PopoverState.hidePopupover}
          title={location?.id ? t('editor:toolbar.publishLocation.create') : t('editor:toolbar.publishLocation.update')}
        />
        <div className="h-fit max-h-[60vh] w-full overflow-y-auto px-10 py-6">
          <div className="relative grid w-full gap-6">
            {errors.serverError.value && <p className="mb-3 text-red-700">{errors.serverError.value}</p>}
            {location && (
              <Button
                size="medium"
                variant="transparent"
                className="w-full cursor-default text-left text-xs"
                endIcon={
                  <HiLink
                    className="z-10 h-4 w-4 cursor-pointer"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        new URL(window.location.origin + `/location/${location.slugifiedName}`).href
                      )
                    }}
                  />
                }
              >
                <div
                  className="cursor-pointer text-blue-primary hover:underline"
                  onClick={() => window.open(new URL(location.url))}
                >
                  {location.url}
                </div>
              </Button>
            )}
            <Input
              label={t('admin:components.location.lbl-name')}
              value={name.value}
              onChange={(event) => name.set(event.target.value)}
              error={errors.name.value}
              disabled={submitLoading.value}
            />
            <Input
              type="number"
              label={t('admin:components.location.lbl-maxuser')}
              value={maxUsers.value}
              onChange={(event) => maxUsers.set(Math.max(parseInt(event.target.value, 0), 0))}
              error={errors.maxUsers.value}
              disabled={submitLoading.value}
            />
            <Select
              label={t('admin:components.location.lbl-scene')}
              currentValue={scene.value}
              onChange={(value) => scene.set(value)}
              disabled={scenes.status !== 'success' || submitLoading.value}
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
              error={errors.scene.value}
            />
            <Select
              label={t('admin:components.location.type')}
              currentValue={locationType.value}
              onChange={(value) => locationType.set(value as 'private' | 'public' | 'showroom')}
              options={locationTypeOptions}
            />
            <Toggle
              label={t('admin:components.location.lbl-ve')}
              value={videoEnabled.value}
              onChange={videoEnabled.set}
              disabled={submitLoading.value}
            />
            <Toggle
              label={t('admin:components.location.lbl-ae')}
              value={audioEnabled.value}
              onChange={audioEnabled.set}
              disabled={submitLoading.value}
            />
            <Toggle
              label={t('admin:components.location.lbl-se')}
              value={screenSharingEnabled.value}
              onChange={screenSharingEnabled.set}
              disabled={submitLoading.value}
            />
          </div>
        </div>

        <div className="grid grid-flow-col border-t border-t-theme-primary px-6 py-5">
          <Button variant="outline" onClick={() => PopoverState.hidePopupover()}>
            {t('common:components.cancel')}
          </Button>
          <div className="ml-auto flex items-center gap-2">
            {location?.id && (
              <Button
                className="bg-[#162546]"
                endIcon={submitLoading.value ? <LoadingView spinnerOnly className="h-6 w-6" /> : undefined}
                disabled={submitLoading.value}
                onClick={unpublishLocation}
              >
                {t('editor:toolbar.publishLocation.unpublish')}
              </Button>
            )}
            <Button
              endIcon={submitLoading.value ? <LoadingView spinnerOnly className="h-6 w-6" /> : undefined}
              disabled={submitLoading.value}
              onClick={handleSubmit}
            >
              {location?.id ? t('common:components.update') : t('editor:toolbar.publishLocation.title')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
