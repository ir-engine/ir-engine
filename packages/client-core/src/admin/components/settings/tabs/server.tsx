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
import { HiMinus, HiPlusSmall } from 'react-icons/hi2'

import { useFind, useMutation } from '@ir-engine/common'
import { EngineSettings } from '@ir-engine/common/src/constants/EngineSettings'
import { EngineSettingData, EngineSettingType, engineSettingPath } from '@ir-engine/common/src/schema.type.module'
import { useHookstate } from '@ir-engine/hyperflux'
import { Button, Input } from '@ir-engine/ui'
import PasswordInput from '@ir-engine/ui/src/components/tailwind/PasswordInput'
import Accordion from '@ir-engine/ui/src/primitives/tailwind/Accordion'
import LoadingView from '@ir-engine/ui/src/primitives/tailwind/LoadingView'
import Text from '@ir-engine/ui/src/primitives/tailwind/Text'
import Toggle from '@ir-engine/ui/src/primitives/tailwind/Toggle'

const ServerTab = forwardRef(({ open }: { open: boolean }, ref: React.MutableRefObject<HTMLDivElement>) => {
  const { t } = useTranslation()

  const engineSettingMutation = useMutation(engineSettingPath)
  const engineSettings = useFind(engineSettingPath, {
    query: {
      category: 'server',
      paginate: false
    }
  })
  const port = engineSettings.data.find((item) => item.key === EngineSettings.Server.Port)?.value
  const hostname = engineSettings.data.find((item) => item.key === EngineSettings.Server.Hostname)?.value
  const mode = engineSettings.data.find((item) => item.key === EngineSettings.Server.Mode)?.value
  const clientHost = engineSettings.data.find((item) => item.key === EngineSettings.Server.ClientHost)?.value
  const rootDir = engineSettings.data.find((item) => item.key === EngineSettings.Server.RootDir)?.value
  const publicDir = engineSettings.data.find((item) => item.key === EngineSettings.Server.PublicDir)?.value
  const nodeModulesDir = engineSettings.data.find((item) => item.key === EngineSettings.Server.NodeModulesDir)?.value
  const localStorageProvider = engineSettings.data.find(
    (item) => item.key === EngineSettings.Server.LocalStorageProvider
  )?.value
  const performDryRun = engineSettings.data.find((item) => item.key === EngineSettings.Server.PerformDryRun)?.value
  const storageProvider = engineSettings.data.find((item) => item.key === EngineSettings.Server.StorageProvider)?.value
  const hubEndpoint = engineSettings.data.find((item) => item.key === EngineSettings.Server.Hub.Endpoint)?.value
  const certPath = engineSettings.data.find((item) => item.key === EngineSettings.Server.CertPath)?.value
  const keyPath = engineSettings.data.find((item) => item.key === EngineSettings.Server.KeyPath)?.value
  const url = engineSettings.data.find((item) => item.key === EngineSettings.Server.Url)?.value
  const gitPem = engineSettings.data.find((item) => item.key === EngineSettings.Server.GitPem)?.value
  const localValue = engineSettings.data.find((item) => item.key === EngineSettings.Server.Local)?.value
  const releaseName = engineSettings.data.find((item) => item.key === EngineSettings.Server.ReleaseName)?.value
  const instanceserverUnreachableTimeoutSecondsSetting = engineSettings.data.find(
    (item) => item.key === EngineSettings.Server.InstanceserverUnreachableTimeoutSeconds
  )
  const githubWebhookSecretSetting = engineSettings.data.find(
    (item) => item.key === EngineSettings.Server.GithubWebhookSecret
  )

  const githubWebhookSecret = useHookstate('')
  const instanceserverUnreachableTimeoutSeconds = useHookstate('')
  const dryRun = useHookstate(true)
  const local = useHookstate(true)

  const state = useHookstate({
    loading: false,
    errorMessage: ''
  })
  useEffect(() => {
    githubWebhookSecret.set(githubWebhookSecretSetting?.value || '')
    instanceserverUnreachableTimeoutSeconds.set(instanceserverUnreachableTimeoutSecondsSetting?.value || '')
  }, [engineSettings.status])

  const handleSubmit = (event) => {
    state.loading.set(true)
    const settings = {
      [EngineSettings.Server.GithubWebhookSecret]: githubWebhookSecret.value,
      [EngineSettings.Server.InstanceserverUnreachableTimeoutSeconds]: instanceserverUnreachableTimeoutSeconds.value
    }
    const createData: EngineSettingData[] = []
    const operations: Promise<EngineSettingType | EngineSettingType[]>[] = []

    Object.keys(settings).forEach((key) => {
      const settingInDb = engineSettings.data.find((el) => el.key === key)
      if (!settingInDb) {
        createData.push({
          key,
          category: 'server',
          value: settings[key],
          type: 'private'
        })
      } else if (settingInDb.value !== settings[key]) {
        operations.push(
          engineSettingMutation.patch(settingInDb.id, {
            key,
            category: 'server',
            value: settings[key],
            type: 'private'
          })
        )
      }
    })
    if (createData.length > 0) {
      const createOperation = engineSettingMutation.create(createData)
      operations.push(createOperation)
    }

    Promise.all(operations)
      .then(() => {
        state.set({ loading: false, errorMessage: '' })
      })
      .catch((e) => {
        state.set({ loading: false, errorMessage: e.message })
      })
  }

  const handleCancel = () => {
    githubWebhookSecret.set(githubWebhookSecret.value)
    instanceserverUnreachableTimeoutSeconds.set(instanceserverUnreachableTimeoutSeconds.value)
  }

  return (
    <Accordion
      title={t('admin:components.setting.server.header')}
      subtitle={t('admin:components.setting.server.subtitle')}
      expandIcon={<HiPlusSmall />}
      shrinkIcon={<HiMinus />}
      ref={ref}
      open={open}
    >
      <div className="mt-6 grid w-full grid-cols-2 gap-4">
        <Input
          fullWidth
          value={mode || 'test'}
          labelProps={{
            text: t('admin:components.setting.mode'),
            position: 'top'
          }}
          disabled
        />

        <Input
          fullWidth
          labelProps={{
            text: t('admin:components.setting.storageProvider'),
            position: 'top'
          }}
          value={storageProvider || ''}
          disabled
        />

        <Input
          fullWidth
          value={hostname || 'test'}
          labelProps={{
            text: t('admin:components.setting.hostName'),
            position: 'top'
          }}
          disabled
        />

        <Input
          fullWidth
          labelProps={{
            text: t('admin:components.setting.port'),
            position: 'top'
          }}
          value={port || ''}
          disabled
        />

        <Input
          fullWidth
          labelProps={{
            text: t('admin:components.setting.hub'),
            position: 'top'
          }}
          value={hubEndpoint || ''}
          disabled
        />

        <Input
          fullWidth
          labelProps={{
            text: t('admin:components.setting.clientHost'),
            position: 'top'
          }}
          value={clientHost || ''}
          disabled
        />

        <Input
          fullWidth
          labelProps={{
            text: t('admin:components.setting.url'),
            position: 'top'
          }}
          value={url || ''}
          disabled
        />

        <Input
          fullWidth
          labelProps={{
            text: t('admin:components.setting.rootDirectory'),
            position: 'top'
          }}
          value={rootDir || ''}
          disabled
        />

        <Input
          fullWidth
          labelProps={{
            text: t('admin:components.setting.certPath'),
            position: 'top'
          }}
          value={certPath || ''}
          disabled
        />

        <Input
          fullWidth
          labelProps={{
            text: t('admin:components.setting.publicDirectory'),
            position: 'top'
          }}
          value={publicDir || ''}
          disabled
        />

        <Input
          fullWidth
          labelProps={{
            text: t('admin:components.setting.keyPath'),
            position: 'top'
          }}
          value={keyPath || ''}
          disabled
        />

        <Input
          fullWidth
          labelProps={{
            text: t('admin:components.setting.nodeModulesDirectory'),
            position: 'top'
          }}
          value={nodeModulesDir || ''}
          disabled
        />

        <PasswordInput
          fullWidth
          labelProps={{
            text: t('admin:components.setting.githubWebhookSecret'),
            position: 'top'
          }}
          value={githubWebhookSecret?.value || ''}
          onChange={(e) => githubWebhookSecret.set(e.target.value)}
        />

        <Input
          fullWidth
          labelProps={{
            text: t('admin:components.setting.localStorageProvider'),
            position: 'top'
          }}
          value={localStorageProvider || ''}
          disabled
        />

        <Input
          fullWidth
          labelProps={{
            text: t('admin:components.setting.releaseName'),
            position: 'top'
          }}
          value={releaseName || ''}
          disabled
        />

        <Input
          fullWidth
          labelProps={{
            text: t('admin:components.setting.instanceserverUnreachableTimeoutSeconds'),
            position: 'top'
          }}
          value={instanceserverUnreachableTimeoutSeconds?.value || ''}
          onChange={(e) => instanceserverUnreachableTimeoutSeconds.set(e.target.value)}
        />

        <div className="col-span-1 mt-5 grid grid-cols-2">
          <Toggle
            className="col-span-1"
            label={t('admin:components.setting.performDryRun')}
            value={dryRun.value}
            disabled
            onChange={(value) => dryRun.set(value)}
          />

          <Toggle
            className="col-span-1"
            label={t('admin:components.setting.local')}
            value={local.value}
            disabled
            onChange={(value) => local.set(value)}
          />
        </div>

        {state.errorMessage.value && (
          <div className="col-span-2">
            <Text component="h3" className="text-red-700">
              {state.errorMessage.value}
            </Text>
          </div>
        )}

        <div className="col-span-1 grid grid-cols-4 gap-6">
          <Button size="sm" className="text-primary col-span-1 bg-theme-highlight" fullWidth onClick={handleCancel}>
            {t('admin:components.common.reset')}
          </Button>
          <Button size="sm" variant="primary" className="col-span-1" fullWidth onClick={handleSubmit}>
            {state.loading.value && <LoadingView spinnerOnly className="h-6 w-6" />}
            {t('admin:components.common.save')}
          </Button>
        </div>
      </div>
    </Accordion>
  )
})

export default ServerTab
