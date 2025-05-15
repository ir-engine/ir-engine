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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import React, { forwardRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { useFind, useMutation } from '@ir-engine/common'
import { engineSettingPath, EngineSettingType } from '@ir-engine/common/src/schema.type.module'
import { getDataType } from '@ir-engine/common/src/utils/dataTypeUtils'
import { flattenObjectToArray, unflattenArrayToObject } from '@ir-engine/common/src/utils/jsonHelperUtils'
import { State, useHookstate } from '@ir-engine/hyperflux'
import { ClientEngineSettingType } from '@ir-engine/server-core/src/appconfig'
import { Button, Input, Select } from '@ir-engine/ui'
import Accordion from '@ir-engine/ui/src/primitives/tailwind/Accordion'
import LoadingView from '@ir-engine/ui/src/primitives/tailwind/LoadingView'
import Text from '@ir-engine/ui/src/primitives/tailwind/Text'
import Toggle from '@ir-engine/ui/src/primitives/tailwind/Toggle'

// Initial state for client settings
const initialClientState: Partial<ClientEngineSettingType> = {
  logo: '',
  title: '',
  shortTitle: '',
  startPath: '/',
  url: '',
  releaseName: '',
  siteDescription: '',
  appleTouchIcon: '',
  favicon32px: '',
  favicon16px: '',
  icon192px: '',
  icon512px: '',
  webmanifestLink: '',
  swScriptLink: '',
  appBackground: '',
  appTitle: '',
  appSubtitle: '',
  appDescription: '',
  appSocialLinks: [],
  gtmContainerId: '',
  gtmAuth: '',
  gtmPreview: '',
  privacyPolicy: '',
  termsOfService: '',
  assistanceLink: '',
  homepageLinkButtonEnabled: false,
  homepageLinkButtonRedirect: '',
  homepageLinkButtonText: '',
  mediaSettings: {
    audio: {
      maxBitrate: 128
    },
    video: {
      codec: 'VP9',
      maxResolution: 'hd',
      lowResMaxBitrate: 300,
      midResMaxBitrate: 600,
      highResMaxBitrate: 1500
    },
    screenshare: {
      codec: 'VP9',
      maxResolution: 'hd',
      lowResMaxBitrate: 1000,
      midResMaxBitrate: 2500,
      highResMaxBitrate: 4000
    }
  }
}

const ClientTab = forwardRef(({ open }: { open: boolean }, ref: React.MutableRefObject<HTMLDivElement>) => {
  const { t } = useTranslation()

  const loadingState = useHookstate({
    loading: false,
    errorMessage: ''
  })

  const engineSettingData = useFind(engineSettingPath, {
    query: {
      category: 'client',
      paginate: false
    }
  })

  const clientSettings = unflattenArrayToObject(
    engineSettingData.data.map((el) => ({ key: el.key, value: el.value, dataType: el.dataType }))
  ) as ClientEngineSettingType

  const settingsState = useHookstate(initialClientState as ClientEngineSettingType)
  const originalSettings = useHookstate(initialClientState as ClientEngineSettingType)
  const engineSettingMutation = useMutation(engineSettingPath)

  useEffect(() => {
    if (engineSettingData.status === 'success' && engineSettingData.data.length > 0) {
      settingsState.set({ ...initialClientState, ...clientSettings } as ClientEngineSettingType)
      originalSettings.set({ ...initialClientState, ...clientSettings } as ClientEngineSettingType)
      loadingState.set({ loading: false, errorMessage: '' })
    }
  }, [engineSettingData.status, engineSettingData.data])

  const codecMenu = [
    {
      value: 'VP9',
      label: 'VP9'
    },
    {
      value: 'VP8',
      label: 'VP8'
    },
    {
      value: 'h264',
      label: 'h264'
    }
  ]

  const videoMaxResolutionMenu = [
    {
      value: 'fhd',
      label: t('admin:components.setting.videoFHD')
    },
    {
      value: 'hd',
      label: t('admin:components.setting.videoHD')
    },
    {
      value: 'fwvga',
      label: t('admin:components.setting.videoFWVGA')
    },
    {
      value: 'nhd',
      label: t('admin:components.setting.videoNHD')
    }
  ]

  const handleSubmit = (event: React.FormEvent) => {
    loadingState.loading.set(true)
    event.preventDefault()

    const newSettings = { ...settingsState.get() }

    // Flatten the object for engine-setting
    const flattenedSettings = flattenObjectToArray(newSettings)

    // Create promises array for all operations
    const clientOperationPromises: Promise<EngineSettingType | EngineSettingType[]>[] = []

    flattenedSettings.forEach((setting) => {
      const settingInDb = engineSettingData.data.find((el) => el.key === setting.key)
      if (!settingInDb) {
        // Create new setting
        clientOperationPromises.push(
          engineSettingMutation.create({
            key: setting.key,
            category: 'client',
            dataType: getDataType(setting.value),
            value: `${setting.value}`,
            type: 'public'
          })
        )
      } else if (settingInDb.value != setting.value) {
        // Update existing setting
        clientOperationPromises.push(
          engineSettingMutation.patch(settingInDb.id, {
            key: setting.key,
            category: 'client',
            dataType: getDataType(setting.value),
            value: `${setting.value}`,
            type: 'public'
          })
        )
      }
    })

    Promise.all(clientOperationPromises)
      .then(() => {
        loadingState.set({ loading: false, errorMessage: '' })
        engineSettingData.refetch()
      })
      .catch((e: Error) => {
        loadingState.set({ loading: false, errorMessage: e.message })
      })
  }

  const handleCancel = () => {
    settingsState.set(originalSettings.get())
  }

  if (!settingsState.value)
    return <LoadingView fullScreen className="block h-12 w-12" title={t('common:loader.loading')} />

  const settings = settingsState as State<ClientEngineSettingType>

  return (
    <Accordion
      title={t('admin:components.setting.client.header')}
      subtitle={t('admin:components.setting.client.subtitle')}
      ref={ref}
      open={open}
    >
      <div className="mt-6 grid grid-cols-2 gap-4">
        <Text component="h3" fontSize="xl" fontWeight="semibold" className="col-span-full mb-4">
          {t('admin:components.setting.client.main')}
        </Text>

        <Input
          fullWidth
          labelProps={{
            text: t('admin:components.setting.appTitle'),
            position: 'top'
          }}
          value={settings.appTitle.value || ''}
          onChange={(e) => settings.appTitle.set(e.target.value)}
        />

        <Input
          fullWidth
          labelProps={{
            text: t('admin:components.setting.title'),
            position: 'top'
          }}
          value={settings.title.value || ''}
          onChange={(e) => settings.title.set(e.target.value)}
        />

        <Input
          fullWidth
          labelProps={{
            text: t('admin:components.setting.appSubtitle'),
            position: 'top'
          }}
          value={settings.appSubtitle.value || ''}
          onChange={(e) => settings.appSubtitle.set(e.target.value)}
        />

        <Input
          fullWidth
          labelProps={{
            text: t('admin:components.setting.shortTitle'),
            position: 'top'
          }}
          value={settings.shortTitle.value || ''}
          onChange={(e) => settings.shortTitle.set(e.target.value)}
        />

        <Input
          fullWidth
          labelProps={{
            text: t('admin:components.setting.appDescription'),
            position: 'top'
          }}
          value={settings.appDescription.value || ''}
          onChange={(e) => settings.appDescription.set(e.target.value)}
        />

        <Input
          fullWidth
          labelProps={{
            text: t('admin:components.setting.startPath'),
            position: 'top'
          }}
          value={settings.startPath.value || '/'}
          onChange={(e) => settings.startPath.set(e.target.value)}
        />

        <Input
          fullWidth
          labelProps={{
            text: t('admin:components.setting.appBackground'),
            position: 'top'
          }}
          value={settings.appBackground.value || ''}
          onChange={(e) => settings.appBackground.set(e.target.value)}
        />

        <Input
          fullWidth
          labelProps={{
            text: t('admin:components.setting.description'),
            position: 'top'
          }}
          value={settings.siteDescription.value || ''}
          onChange={(e) => settings.siteDescription.set(e.target.value)}
        />
        <Input
          fullWidth
          labelProps={{
            text: t('admin:components.setting.googleTagManagerContainerId'),
            position: 'top'
          }}
          value={settings.gtmContainerId.value || ''}
          onChange={(e) => settings.gtmContainerId.set(e.target.value)}
        />
        <Input
          fullWidth
          labelProps={{
            text: t('admin:components.setting.googleTagManagerAuth'),
            position: 'top'
          }}
          value={settings.gtmAuth.value || ''}
          onChange={(e) => settings.gtmAuth.set(e.target.value)}
        />
        <Input
          fullWidth
          labelProps={{
            text: t('admin:components.setting.googleTagManagerPreview'),
            position: 'top'
          }}
          value={settings.gtmPreview.value || ''}
          onChange={(e) => settings.gtmPreview.set(e.target.value)}
        />

        <Toggle
          label={t('admin:components.setting.homepageLinkButtonEnabled')}
          value={settings.homepageLinkButtonEnabled.value}
          onChange={(value) => settings.homepageLinkButtonEnabled.set(value)}
        />

        <Text component="h3" fontSize="xl" fontWeight="semibold" className="col-span-full my-4">
          {t('admin:components.setting.client.logo')}
        </Text>

        <Input
          fullWidth
          labelProps={{
            text: t('admin:components.setting.logo'),
            position: 'top'
          }}
          value={settings.logo.value || ''}
          onChange={(e) => settings.logo.set(e.target.value)}
        />

        <Input
          fullWidth
          labelProps={{
            text: t('admin:components.setting.appleTouchIcon'),
            position: 'top'
          }}
          value={settings.appleTouchIcon.value || ''}
          onChange={(e) => settings.appleTouchIcon.set(e.target.value)}
        />

        <Input
          fullWidth
          labelProps={{
            text: t('admin:components.setting.favIcon16px'),
            position: 'top'
          }}
          value={settings.favicon16px.value || ''}
          onChange={(e) => settings.favicon16px.set(e.target.value)}
        />

        <Input
          fullWidth
          labelProps={{
            text: t('admin:components.setting.favIcon32px'),
            position: 'top'
          }}
          value={settings.favicon32px.value || ''}
          onChange={(e) => settings.favicon32px.set(e.target.value)}
        />

        <Input
          fullWidth
          labelProps={{
            text: t('admin:components.setting.icon192px'),
            position: 'top'
          }}
          value={settings.icon192px.value || ''}
          onChange={(e) => settings.icon192px.set(e.target.value)}
        />

        <Input
          fullWidth
          labelProps={{
            text: t('admin:components.setting.icon512px'),
            position: 'top'
          }}
          value={settings.icon512px.value || ''}
          onChange={(e) => settings.icon512px.set(e.target.value)}
        />

        <Text component="h3" fontSize="xl" fontWeight="semibold" className="col-span-full my-4">
          {t('admin:components.setting.client.other')}
        </Text>

        <Input
          fullWidth
          labelProps={{
            text: t('admin:components.setting.webmanifestLink'),
            position: 'top'
          }}
          value={settings.webmanifestLink.value || ''}
          onChange={(e) => settings.webmanifestLink.set(e.target.value)}
        />

        <Input
          fullWidth
          labelProps={{
            text: t('admin:components.setting.swScriptLink'),
            position: 'top'
          }}
          value={settings.swScriptLink.value || ''}
          onChange={(e) => settings.swScriptLink.set(e.target.value)}
        />

        <Input
          fullWidth
          labelProps={{
            text: t('admin:components.setting.url'),
            position: 'top'
          }}
          value={clientSettings?.url || ''}
          disabled
        />

        <Input
          fullWidth
          labelProps={{
            text: t('admin:components.setting.releaseName'),
            position: 'top'
          }}
          value={clientSettings?.releaseName || ''}
          disabled
        />

        <Input
          fullWidth
          labelProps={{
            text: t('admin:components.setting.privacyPolicy'),
            position: 'top'
          }}
          value={settings.privacyPolicy.value}
          onChange={(e) => settings.privacyPolicy.set(e.target.value)}
        />
        <Input
          fullWidth
          labelProps={{
            text: t('admin:components.setting.termsOfService'),
            position: 'top'
          }}
          value={settings.termsOfService.value}
          onChange={(e) => settings.termsOfService.set(e.target.value)}
        />

        <Input
          fullWidth
          labelProps={{
            text: t('admin:components.setting.assistanceLink'),
            position: 'top'
          }}
          value={settings.assistanceLink.value}
          onChange={(e) => settings.assistanceLink.set(e.target.value)}
        />

        <Text component="h3" fontSize="xl" fontWeight="semibold" className="col-span-full my-4">
          {t('admin:components.setting.client.media')}
        </Text>

        <Input
          fullWidth
          type="number"
          labelProps={{
            text: t('admin:components.setting.audioMaxBitrate'),
            position: 'top'
          }}
          value={settings.mediaSettings.audio.maxBitrate.value || ''}
          onChange={(e) => settings.mediaSettings.audio.maxBitrate.set(Number(e.target.value))}
        />

        <Select
          labelProps={{
            text: t('admin:components.setting.videoMaxResolution'),
            position: 'top'
          }}
          value={settings.mediaSettings.video.maxResolution.value}
          options={videoMaxResolutionMenu}
          onChange={(value: string) => settings.mediaSettings.video.maxResolution.set(value)}
        />

        <Select
          labelProps={{
            text: t('admin:components.setting.videoCodec'),
            position: 'top'
          }}
          value={settings.mediaSettings.video.codec.value}
          options={codecMenu}
          onChange={(value: string) => settings.mediaSettings.video.codec.set(value)}
        />

        {(settings.mediaSettings.video.codec.value === 'VP8' ||
          settings.mediaSettings.video.codec.value === 'h264') && (
          <>
            <Input
              fullWidth
              type="number"
              labelProps={{
                text: t('admin:components.setting.videoLowResMaxBitrate'),
                position: 'top'
              }}
              value={settings.mediaSettings.video.lowResMaxBitrate.value || ''}
              onChange={(e) => settings.mediaSettings.video.lowResMaxBitrate.set(Number(e.target.value))}
            />

            <Input
              fullWidth
              type="number"
              labelProps={{
                text: t('admin:components.setting.videoMidResMaxBitrate'),
                position: 'top'
              }}
              value={settings.mediaSettings.video.midResMaxBitrate.value || ''}
              onChange={(e) => settings.mediaSettings.video.midResMaxBitrate.set(Number(e.target.value))}
            />

            <Input
              fullWidth
              type="number"
              labelProps={{
                text: t('admin:components.setting.videoHighResMaxBitrate'),
                position: 'top'
              }}
              value={settings.mediaSettings.video.highResMaxBitrate.value || ''}
              onChange={(e) => settings.mediaSettings.video.highResMaxBitrate.set(Number(e.target.value))}
            />
          </>
        )}

        <Select
          labelProps={{
            text: t('admin:components.setting.screenshareCodec'),
            position: 'top'
          }}
          value={settings.mediaSettings.screenshare.codec.value}
          options={codecMenu}
          onChange={(value: string) => settings.mediaSettings.screenshare.codec.set(value)}
        />

        {(settings.mediaSettings.screenshare.codec.value === 'VP8' ||
          settings.mediaSettings.screenshare.codec.value === 'h264') && (
          <>
            <Input
              fullWidth
              type="number"
              labelProps={{
                text: t('admin:components.setting.screenshareLowResMaxBitrate'),
                position: 'top'
              }}
              value={settings.mediaSettings.screenshare.lowResMaxBitrate.value || ''}
              onChange={(e) => settings.mediaSettings.screenshare.lowResMaxBitrate.set(Number(e.target.value))}
            />

            <Input
              fullWidth
              type="number"
              labelProps={{
                text: t('admin:components.setting.screenshareMidResMaxBitrate'),
                position: 'top'
              }}
              value={settings.mediaSettings.screenshare.midResMaxBitrate.value || ''}
              onChange={(e) => settings.mediaSettings.screenshare.midResMaxBitrate.set(Number(e.target.value))}
            />

            <Input
              fullWidth
              type="number"
              labelProps={{
                text: t('admin:components.setting.screenshareHighResMaxBitrate'),
                position: 'top'
              }}
              value={settings.mediaSettings.screenshare.highResMaxBitrate.value || ''}
              onChange={(e) => settings.mediaSettings.screenshare.highResMaxBitrate.set(Number(e.target.value))}
            />
          </>
        )}
      </div>

      <div className="mt-6 grid grid-cols-8 gap-6">
        <Button size="sm" className="text-primary col-span-1 " onClick={handleCancel} fullWidth>
          {t('admin:components.common.reset')}
        </Button>
        <Button size="sm" variant="primary" className="col-span-1" onClick={handleSubmit} fullWidth>
          {loadingState.loading.value && <LoadingView spinnerOnly className="h-6 w-6" />}
          {t('admin:components.common.save')}
        </Button>
      </div>
    </Accordion>
  )
})

export default ClientTab
