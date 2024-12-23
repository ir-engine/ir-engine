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

import React, { forwardRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { HiMinus, HiPlusSmall, HiTrash } from 'react-icons/hi2'

import { useFind, useMutation } from '@ir-engine/common'
import {
  IceServer,
  WebRTCSettings,
  defaultIceServer,
  defaultWebRTCSettings
} from '@ir-engine/common/src/constants/DefaultWebRTCSettings'
import { EngineSettings } from '@ir-engine/common/src/constants/EngineSettings'
import { EngineSettingType, engineSettingPath } from '@ir-engine/common/src/schema.type.module'
import { getDataType } from '@ir-engine/common/src/utils/dataTypeUtils'
import { flattenObjectToArray, unflattenArrayToObject } from '@ir-engine/common/src/utils/jsonHelperUtils'
import { State, useHookstate } from '@ir-engine/hyperflux'
import { Button, Checkbox, Input } from '@ir-engine/ui'
import PasswordInput from '@ir-engine/ui/src/components/tailwind/PasswordInput'
import Accordion from '@ir-engine/ui/src/primitives/tailwind/Accordion'
import LoadingView from '@ir-engine/ui/src/primitives/tailwind/LoadingView'
import Text from '@ir-engine/ui/src/primitives/tailwind/Text'
import Toggle from '@ir-engine/ui/src/primitives/tailwind/Toggle'
import { HiPlus } from 'react-icons/hi2'

const InstanceServerTab = forwardRef(({ open }: { open: boolean }, ref: React.MutableRefObject<HTMLDivElement>) => {
  const { t } = useTranslation()

  const state = useHookstate({
    loading: false,
    errorMessage: ''
  })

  const engineSettingMutation = useMutation(engineSettingPath)
  const engineSettings = useFind(engineSettingPath, {
    query: {
      category: 'instance-server',
      paginate: false
    }
  })
  const instanceWebRTCSettings = useFind(engineSettingPath, {
    query: {
      category: 'instance-server-webrtc',
      jsonKey: EngineSettings.InstanceServer.WebRTCSettings,
      paginate: false
    }
  })

  const localState = useHookstate(true)
  const webRTCSettingsState = useHookstate<WebRTCSettings>(defaultWebRTCSettings)

  const getSettingValue = (settingName: string) => {
    return (
      (engineSettings.status === 'success' &&
        engineSettings.data.length > 0 &&
        engineSettings.data.find((setting) => setting.key === settingName)?.value) ||
      ''
    )
  }

  const domainValue = getSettingValue(EngineSettings.InstanceServer.Domain)
  const clientHostValue = getSettingValue(EngineSettings.InstanceServer.ClientHost)
  const rtcStartPortValue = getSettingValue(EngineSettings.InstanceServer.RtcStartPort)
  const rtcEndPortValue = getSettingValue(EngineSettings.InstanceServer.RtcEndPort)
  const rtcPortBlockSizeValue = getSettingValue(EngineSettings.InstanceServer.RtcPortBlockSize)
  const identifierDigitsValue = getSettingValue(EngineSettings.InstanceServer.IdentifierDigits)
  const releaseNameValue = getSettingValue(EngineSettings.InstanceServer.ReleaseName)
  const portValue = getSettingValue(EngineSettings.InstanceServer.Port)
  const modeValue = getSettingValue(EngineSettings.InstanceServer.Mode)
  const locationNameValue = getSettingValue(EngineSettings.InstanceServer.LocationName)
  const webRTCSettingsValue =
    instanceWebRTCSettings?.data.length === 0
      ? defaultWebRTCSettings
      : unflattenArrayToObject(
          instanceWebRTCSettings.data.map((setting) => ({ key: setting.key, value: setting.value }))
        )

  useEffect(() => {
    if (instanceWebRTCSettings.status === 'success') {
      webRTCSettingsState.set(webRTCSettingsValue as WebRTCSettings)
      state.set({ loading: false, errorMessage: '' })
    }
  }, [instanceWebRTCSettings.status])

  const handleSubmit = (event) => {
    state.loading.set(true)
    event.preventDefault()

    const webTrcKeyValues = flattenObjectToArray(webRTCSettingsState.value)

    // Create a map for quick lookup
    const instanceSettingsMap = new Map(instanceWebRTCSettings.data.map((setting) => [setting.key, setting]))

    // Ensure webTrcKeyValues is an array of objects with a key property
    const missingInstanceSettings = Array.from(instanceSettingsMap.values()).filter(
      (setting) => !webTrcKeyValues.some((entry) => entry.key === setting.key)
    )

    // Update or create settings
    const settingsUpdateOperations = webTrcKeyValues.map((entry) => {
      const settingInDb = instanceSettingsMap.get(entry.key)
      let operation: Promise<EngineSettingType>

      if (!settingInDb) {
        // Create new setting
        operation = engineSettingMutation.create({
          key: entry.key,
          category: 'instance-server-webrtc',
          value: `${entry.value}`,
          dataType: getDataType(`${entry.value}`),
          type: 'private',
          jsonKey: EngineSettings.InstanceServer.WebRTCSettings
        })
      } else if (settingInDb.value !== entry.value) {
        // Update existing setting if value has changed
        operation = engineSettingMutation.patch(settingInDb.id, {
          key: entry.key,
          category: 'instance-server-webrtc',
          value: `${entry.value}`,
          dataType: getDataType(`${entry.value}`),
          type: 'private',
          jsonKey: settingInDb.jsonKey || EngineSettings.InstanceServer.WebRTCSettings
        })
      } else {
        // No operation needed if value hasn't changed
        return Promise.resolve()
      }

      return operation
    })
    const deleteOpreations = missingInstanceSettings.map((setting) => {
      return engineSettingMutation.remove(setting.id)
    })

    Promise.all([...settingsUpdateOperations, ...deleteOpreations])
      .then(() => {
        state.set({ loading: false, errorMessage: '' })
      })
      .catch((e) => {
        state.set({ loading: false, errorMessage: e.message })
      })
  }

  const handleCancel = () => {
    if (engineSettings.status === 'success') {
      webRTCSettingsState.set(webRTCSettingsValue as WebRTCSettings)
    }
  }

  if (engineSettings.status === 'pending')
    return <LoadingView fullScreen className="block h-12 w-12" title={t('common:loader.loading')} />

  const webRTCSettings = webRTCSettingsState as State<WebRTCSettings>

  return (
    <Accordion
      title={t('admin:components.setting.instanceServer.header')}
      subtitle={t('admin:components.setting.instanceServer.subtitle')}
      expandIcon={<HiPlusSmall />}
      shrinkIcon={<HiMinus />}
      ref={ref}
      open={open}
    >
      <div className="mt-6 grid grid-cols-2 gap-6">
        <Input
          fullWidth
          labelProps={{
            text: t('admin:components.setting.clientHost'),
            position: 'top'
          }}
          value={clientHostValue || ''}
          disabled
        />

        <Input
          fullWidth
          labelProps={{
            text: t('admin:components.setting.domain'),
            position: 'top'
          }}
          value={domainValue || ''}
          disabled
        />
        <Input
          labelProps={{
            text: t('admin:components.setting.domain'),
            position: 'top'
          }}
          value={domainValue || ''}
          disabled
        />

        <Input
          fullWidth
          labelProps={{
            text: t('admin:components.setting.rtcStartPort'),
            position: 'top'
          }}
          value={rtcStartPortValue || ''}
          disabled
        />

        <Input
          fullWidth
          labelProps={{
            text: t('admin:components.setting.releaseName'),
            position: 'top'
          }}
          value={releaseNameValue || ''}
          disabled
        />

        <Input
          fullWidth
          labelProps={{
            text: t('admin:components.setting.rtcEndPort'),
            position: 'top'
          }}
          value={rtcEndPortValue || ''}
          disabled
        />

        <Input
          fullWidth
          labelProps={{
            text: t('admin:components.setting.port'),
            position: 'top'
          }}
          value={portValue || ''}
          disabled
        />

        <Input
          fullWidth
          labelProps={{
            text: t('admin:components.setting.rtcPortBlockSize'),
            position: 'top'
          }}
          value={rtcPortBlockSizeValue || ''}
          disabled
        />

        <Input
          fullWidth
          labelProps={{
            text: t('admin:components.setting.mode'),
            position: 'top'
          }}
          value={modeValue || ''}
          disabled
        />

        <Input
          fullWidth
          labelProps={{
            text: t('admin:components.setting.identifierDigits'),
            position: 'top'
          }}
          value={identifierDigitsValue || ''}
          disabled
        />

        <Input
          fullWidth
          labelProps={{
            text: t('admin:components.setting.locationName'),
            position: 'top'
          }}
          value={locationNameValue || ''}
          disabled
        />

        <Toggle
          containerClassName="justify-start"
          label={t('admin:components.setting.local')}
          value={localState.value}
          disabled
          onChange={(value) => localState.set(value)}
        />
      </div>

      <div className="col-span-1">
        <Text component="h3" fontSize="xl" fontWeight="semibold" className="col-span-full mb-4">
          {t('admin:components.setting.webRTCSettings.main')}
        </Text>

        <Checkbox
          label={t('admin:components.setting.webRTCSettings.useCustomICEServers')}
          checked={webRTCSettings?.useCustomICEServers?.value || false}
          onChange={(value) => webRTCSettings.useCustomICEServers.set(value)}
        />

        {webRTCSettings?.useCustomICEServers?.value && (
          <Text component="h3" fontSize="xl" fontWeight="semibold" className="col-span-full mb-4">
            {t('admin:components.setting.webRTCSettings.iceServers')}
          </Text>
        )}
        {webRTCSettings?.useCustomICEServers?.value && (
          <div>
            {webRTCSettings?.iceServers?.map &&
              webRTCSettings?.iceServers?.map((iceServer, index) => {
                return (
                  <div className="col-span-1 mb-4 rounded-2xl border-4 border-theme-input p-4" key={index}>
                    <div className="flex items-center">
                      <Text component="h4" fontSize="xl" fontWeight="semibold" className="col-span-full">
                        {t('admin:components.setting.webRTCSettings.iceServer') + (index + 1)}
                      </Text>

                      <Button
                        variant="red"
                        size="sm"
                        className="ml-2"
                        onClick={() => {
                          const iceServers = [] as IceServer[]
                          for (const [iceServerIndex, iceServer] of Object.entries(webRTCSettings.iceServers.value)) {
                            if (parseInt(iceServerIndex) !== index)
                              iceServers.push({
                                urls: [...new Set((iceServer as IceServer).urls as string)],
                                useFixedCredentials: (iceServer as IceServer).useFixedCredentials,
                                useTimeLimitedCredentials: (iceServer as IceServer).useTimeLimitedCredentials,
                                username: (iceServer as IceServer).username,
                                credential: (iceServer as IceServer).credential,
                                webRTCStaticAuthSecretKey: (iceServer as IceServer).webRTCStaticAuthSecretKey
                              })
                          }
                          webRTCSettings.iceServers.set(iceServers)
                        }}
                      >
                        <HiTrash />
                        Remove iceServer
                      </Button>
                    </div>
                    <div className="col-span-1 mb-4">
                      {typeof iceServer.urls.value === 'string' ? (
                        <div className="col-span-1 mb-4 flex flex-row items-center">
                          {' '}
                          <Input
                            fullWidth
                            labelProps={{
                              text: t('admin:components.setting.webRTCSettings.iceURL') + (index + 1),
                              position: 'top'
                            }}
                            value={iceServer.urls.value}
                            onChange={(e) => {
                              iceServer.urls.set(e.target.value)
                            }}
                          />
                          <Button
                            variant="red"
                            size="sm"
                            style={{ margin: '20px 0 0 5px' }}
                            onClick={() => {
                              iceServer.urls.set([])
                            }}
                          >
                            <HiTrash />
                          </Button>
                        </div>
                      ) : (
                        iceServer.urls?.value?.map((url, urlIndex) => {
                          return (
                            <div className="col-span-1 mb-4 flex flex-row items-center" key={urlIndex}>
                              <Input
                                fullWidth
                                labelProps={{
                                  text: t('admin:components.setting.webRTCSettings.iceURL') + (urlIndex + 1),
                                  position: 'top'
                                }}
                                value={url}
                                onChange={(e) => {
                                  iceServer.urls[urlIndex].set(e.target.value)
                                }}
                              />
                              <Button
                                variant="red"
                                size="sm"
                                style={{ margin: '20px 0 0 5px' }}
                                onClick={() => {
                                  const urls = [...new Set(iceServer.urls.value)]
                                  urls.splice(urlIndex, 1)
                                  iceServer.urls.set(urls)
                                }}
                              >
                                <HiTrash />
                              </Button>
                            </div>
                          )
                        })
                      )}
                      <Button
                        size="sm"
                        className="mb-1 mt-1"
                        onClick={() => {
                          if (typeof iceServer.urls.value === 'string') iceServer.urls.set([iceServer.urls.value, ''])
                          else iceServer.urls.set([...new Set(iceServer.urls.value)].concat(''))
                        }}
                      >
                        <HiPlus /> Add URL
                      </Button>
                    </div>

                    <Checkbox
                      label={t('admin:components.setting.webRTCSettings.useFixedCredentials')}
                      checked={iceServer.useFixedCredentials.value || false}
                      onChange={(value) => iceServer.useFixedCredentials.set(value)}
                    />

                    {iceServer.useFixedCredentials.value && (
                      <>
                        <Input
                          fullWidth
                          labelProps={{
                            text: t('admin:components.setting.webRTCSettings.username'),
                            position: 'top'
                          }}
                          value={iceServer.username.value || ''}
                          onChange={(e) => {
                            iceServer.username.set(e.target.value)
                          }}
                        />

                        <PasswordInput
                          labelProps={{
                            text: t('admin:components.setting.webRTCSettings.credential'),
                            position: 'top'
                          }}
                          value={iceServer.credential.value || ''}
                          onChange={(e) => {
                            iceServer.credential.set(e.target.value)
                          }}
                        />
                      </>
                    )}

                    <Checkbox
                      label={t('admin:components.setting.webRTCSettings.useTimeLimitedCredentials')}
                      checked={iceServer.useTimeLimitedCredentials.value || false}
                      onChange={(value) => iceServer.useTimeLimitedCredentials.set(value)}
                    />

                    {iceServer.useTimeLimitedCredentials.value && (
                      <PasswordInput
                        labelProps={{
                          text: t('admin:components.setting.webRTCSettings.webRTCStaticAuthSecretKey'),
                          position: 'top'
                        }}
                        value={iceServer.webRTCStaticAuthSecretKey.value || ''}
                        onChange={(e) => {
                          iceServer.webRTCStaticAuthSecretKey.set(e.target.value)
                        }}
                      />
                    )}
                  </div>
                )
              })}{' '}
          </div>
        )}

        {webRTCSettings?.useCustomICEServers?.value && (
          <Button
            size="sm"
            className="mb-4 mt-1"
            onClick={() => {
              const iceServers = [] as IceServer[]
              if (!webRTCSettings.iceServers.value) {
                webRTCSettings.iceServers.set([])
              }
              for (const iceServer of webRTCSettings.iceServers.value as IceServer[])
                iceServers.push({
                  urls: [...new Set(iceServer.urls)],
                  useFixedCredentials: iceServer.useFixedCredentials,
                  useTimeLimitedCredentials: iceServer.useTimeLimitedCredentials,
                  username: iceServer.username,
                  credential: iceServer.credential,
                  webRTCStaticAuthSecretKey: iceServer.webRTCStaticAuthSecretKey
                })
              iceServers.push(JSON.parse(JSON.stringify(defaultIceServer)))
              webRTCSettings.iceServers.set(iceServers)
            }}
          >
            <HiPlus />
            Add iceServer
          </Button>
        )}

        <Checkbox
          label={t('admin:components.setting.webRTCSettings.usePrivateInstanceserverIP')}
          checked={webRTCSettings?.usePrivateInstanceserverIP?.value || false}
          onChange={(value) => webRTCSettings.usePrivateInstanceserverIP.set(value)}
        />
      </div>

      <div className="mt-6 grid grid-cols-8 gap-6">
        <Button size="sm" className="text-primary col-span-1 bg-theme-highlight" fullWidth onClick={handleCancel}>
          {t('admin:components.common.reset')}
        </Button>
        <Button size="sm" variant="primary" className="col-span-1 mb-1" fullWidth onClick={handleSubmit}>
          {state.loading.value && <LoadingView spinnerOnly className="h-6 w-6" />}
          {t('admin:components.common.save')}
        </Button>
      </div>
    </Accordion>
  )
})

export default InstanceServerTab
