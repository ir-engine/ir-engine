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

import { API, useFind } from '@ir-engine/common'
import { defaultIceServer } from '@ir-engine/common/src/constants/DefaultWebRTCSettings'
import {
  IceServerType,
  InstanceServerSettingType,
  instanceServerSettingPath
} from '@ir-engine/common/src/schema.type.module'
import { NO_PROXY, State, useHookstate } from '@ir-engine/hyperflux'
import { Checkbox, Input } from '@ir-engine/ui'
import PasswordInput from '@ir-engine/ui/src/components/tailwind/PasswordInput'
import Accordion from '@ir-engine/ui/src/primitives/tailwind/Accordion'
import Button from '@ir-engine/ui/src/primitives/tailwind/Button'
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

  const instanceServerSettingQuery = useFind(instanceServerSettingPath)
  const instanceServerSettings = instanceServerSettingQuery.data[0] ?? null
  const id = instanceServerSettings?.id
  const local = useHookstate(true)

  const settingsState = useHookstate(null as null | InstanceServerSettingType)

  useEffect(() => {
    if (instanceServerSettings) {
      settingsState.set(instanceServerSettings)
      state.set({ loading: false, errorMessage: '' })
    }
  }, [instanceServerSettings])

  const handleSubmit = (event) => {
    state.loading.set(true)
    event.preventDefault()
    const newSettings = {
      ...settingsState.get(NO_PROXY),
      local: Boolean(settingsState.value?.local),
      createdAt: undefined!,
      updatedAt: undefined!
    } as any as InstanceServerSettingType

    API.instance
      .service(instanceServerSettingPath)
      .patch(id, newSettings)
      .then(() => {
        state.set({ loading: false, errorMessage: '' })
        instanceServerSettingQuery.refetch()
      })
      .catch((e) => {
        state.set({ loading: false, errorMessage: e.message })
      })
  }

  const handleCancel = () => {
    settingsState.set(instanceServerSettings)
  }

  if (!settingsState.value)
    return <LoadingView fullScreen className="block h-12 w-12" title={t('common:loader.loading')} />

  const settings = settingsState as State<InstanceServerSettingType>

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
          labelProps={{
            text: t('admin:components.setting.clientHost'),
            position: 'top'
          }}
          value={settings?.clientHost.value || ''}
          disabled
        />

        <Input
          labelProps={{
            text: t('admin:components.setting.domain'),
            position: 'top'
          }}
          value={settings?.domain.value || ''}
          disabled
        />

        <Input
          labelProps={{
            text: t('admin:components.setting.rtcStartPort'),
            position: 'top'
          }}
          value={settings?.rtcStartPort.value || ''}
          disabled
        />

        <Input
          labelProps={{
            text: t('admin:components.setting.releaseName'),
            position: 'top'
          }}
          value={settings?.releaseName.value || ''}
          disabled
        />

        <Input
          labelProps={{
            text: t('admin:components.setting.rtcEndPort'),
            position: 'top'
          }}
          value={settings?.rtcEndPort.value || ''}
          disabled
        />

        <Input
          labelProps={{
            text: t('admin:components.setting.port'),
            position: 'top'
          }}
          value={settings?.port.value || ''}
          disabled
        />

        <Input
          labelProps={{
            text: t('admin:components.setting.rtcPortBlockSize'),
            position: 'top'
          }}
          value={settings?.rtcPortBlockSize.value || ''}
          disabled
        />

        <Input
          labelProps={{
            text: t('admin:components.setting.mode'),
            position: 'top'
          }}
          value={settings?.mode.value || ''}
          disabled
        />

        <Input
          labelProps={{
            text: t('admin:components.setting.identifierDigits'),
            position: 'top'
          }}
          value={settings?.identifierDigits.value || ''}
          disabled
        />

        <Input
          labelProps={{
            text: t('admin:components.setting.locationName'),
            position: 'top'
          }}
          value={settings?.locationName.value || ''}
          disabled
        />

        <Toggle
          containerClassName="justify-start"
          label={t('admin:components.setting.local')}
          value={local.value}
          disabled
          onChange={(value) => local.set(value)}
        />
      </div>

      <div className="col-span-1">
        <Text component="h3" fontSize="xl" fontWeight="semibold" className="col-span-full mb-4">
          {t('admin:components.setting.webRTCSettings.main')}
        </Text>

        <Checkbox
          label={t('admin:components.setting.webRTCSettings.useCustomICEServers')}
          checked={settings.webRTCSettings.useCustomICEServers.value || false}
          onChange={(value) => settings.webRTCSettings.useCustomICEServers.set(value)}
        />

        {settings.webRTCSettings.useCustomICEServers.value && (
          <Text component="h3" fontSize="xl" fontWeight="semibold" className="col-span-full mb-4">
            {t('admin:components.setting.webRTCSettings.iceServers')}
          </Text>
        )}
        {settings.webRTCSettings.useCustomICEServers.value && (
          <div>
            {settings.webRTCSettings.iceServers.map((iceServer, index) => {
              return (
                <div className="col-span-1 mb-4 rounded-2xl border-4 border-theme-input p-4" key={index}>
                  <div className="flex items-center">
                    <Text component="h4" fontSize="xl" fontWeight="semibold" className="col-span-full">
                      {t('admin:components.setting.webRTCSettings.iceServer') + (index + 1)}
                    </Text>

                    <Button
                      startIcon={<HiTrash />}
                      variant="danger"
                      size="small"
                      className="ml-2"
                      onClick={() => {
                        const iceServers = [] as IceServerType[]
                        for (const [iceServerIndex, iceServer] of Object.entries(
                          settings.webRTCSettings.iceServers.value
                        )) {
                          if (parseInt(iceServerIndex) !== index)
                            iceServers.push({
                              urls: [...new Set(iceServer.urls)],
                              useFixedCredentials: iceServer.useFixedCredentials,
                              useTimeLimitedCredentials: iceServer.useTimeLimitedCredentials,
                              username: iceServer.username,
                              credential: iceServer.credential,
                              webRTCStaticAuthSecretKey: iceServer.webRTCStaticAuthSecretKey
                            })
                        }
                        settings.webRTCSettings.iceServers.set(iceServers)
                      }}
                    >
                      Remove iceServer
                    </Button>
                  </div>
                  <div className="col-span-1 mb-4">
                    {typeof iceServer.urls.value === 'string' ? (
                      <div className="col-span-1 mb-4 flex flex-row items-center">
                        {' '}
                        <Input
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
                          startIcon={<HiTrash />}
                          variant="danger"
                          size="small"
                          style={{ margin: '20px 0 0 5px' }}
                          onClick={() => {
                            iceServer.urls.set([])
                          }}
                        />
                      </div>
                    ) : (
                      iceServer.urls?.value?.map((url, urlIndex) => {
                        return (
                          <div className="col-span-1 mb-4 flex flex-row items-center" key={urlIndex}>
                            <Input
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
                              startIcon={<HiTrash />}
                              variant="danger"
                              size="small"
                              style={{ margin: '20px 0 0 5px' }}
                              onClick={() => {
                                const urls = [...new Set(iceServer.urls.value)]
                                urls.splice(urlIndex, 1)
                                iceServer.urls.set(urls)
                              }}
                            />
                          </div>
                        )
                      })
                    )}
                    <Button
                      startIcon={<HiPlus />}
                      size="small"
                      className="mb-1 mt-1"
                      onClick={() => {
                        if (typeof iceServer.urls.value === 'string') iceServer.urls.set([iceServer.urls.value, ''])
                        else iceServer.urls.set([...new Set(iceServer.urls.value)].concat(''))
                      }}
                    >
                      Add URL
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

        {settings.webRTCSettings.useCustomICEServers.value && (
          <Button
            startIcon={<HiPlus />}
            size="small"
            className="mb-4 mt-1"
            onClick={() => {
              const iceServers = [] as IceServerType[]
              for (const iceServer of settings.webRTCSettings.iceServers.value as IceServerType[])
                iceServers.push({
                  urls: [...new Set(iceServer.urls)],
                  useFixedCredentials: iceServer.useFixedCredentials,
                  useTimeLimitedCredentials: iceServer.useTimeLimitedCredentials,
                  username: iceServer.username,
                  credential: iceServer.credential,
                  webRTCStaticAuthSecretKey: iceServer.webRTCStaticAuthSecretKey
                })
              iceServers.push(JSON.parse(JSON.stringify(defaultIceServer)))
              settings.webRTCSettings.iceServers.set(iceServers)
            }}
          >
            Add iceServer
          </Button>
        )}

        <Checkbox
          label={t('admin:components.setting.webRTCSettings.usePrivateInstanceserverIP')}
          checked={settings.webRTCSettings.usePrivateInstanceserverIP.value || false}
          onChange={(value) => settings.webRTCSettings.usePrivateInstanceserverIP.set(value)}
        />
      </div>

      <div className="mt-6 grid grid-cols-8 gap-6">
        <Button size="small" className="text-primary col-span-1 bg-theme-highlight" fullWidth onClick={handleCancel}>
          {t('admin:components.common.reset')}
        </Button>
        <Button
          size="small"
          variant="primary"
          className="col-span-1 mb-1"
          fullWidth
          onClick={handleSubmit}
          startIcon={state.loading.value && <LoadingView spinnerOnly className="h-6 w-6" />}
        >
          {t('admin:components.common.save')}
        </Button>
      </div>
    </Accordion>
  )
})

export default InstanceServerTab
