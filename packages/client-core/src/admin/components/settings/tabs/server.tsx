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

import React, { forwardRef } from 'react'
import { useTranslation } from 'react-i18next'
import { HiMinus, HiPlusSmall } from 'react-icons/hi2'

import { useFind, useMutation } from '@ir-engine/common'
import { serverSettingPath } from '@ir-engine/common/src/schema.type.module'
import { useHookstate } from '@ir-engine/hyperflux'
import { Input } from '@ir-engine/ui'
import Accordion from '@ir-engine/ui/src/primitives/tailwind/Accordion'
import Button from '@ir-engine/ui/src/primitives/tailwind/Button'
import LoadingView from '@ir-engine/ui/src/primitives/tailwind/LoadingView'
import Text from '@ir-engine/ui/src/primitives/tailwind/Text'
import Toggle from '@ir-engine/ui/src/primitives/tailwind/Toggle'

const ServerTab = forwardRef(({ open }: { open: boolean }, ref: React.MutableRefObject<HTMLDivElement>) => {
  const { t } = useTranslation()

  const serverSetting = useFind(serverSettingPath).data.at(0)

  const id = serverSetting?.id

  const githubWebhookSecret = useHookstate(serverSetting?.githubWebhookSecret)
  const instanceserverUnreachableTimeoutSeconds = useHookstate(serverSetting?.instanceserverUnreachableTimeoutSeconds)
  const dryRun = useHookstate(true)
  const local = useHookstate(true)

  const state = useHookstate({
    loading: false,
    errorMessage: ''
  })

  const patchServerSetting = useMutation(serverSettingPath).patch

  const handleSubmit = (event) => {
    if (!id) return
    state.loading.set(true)
    patchServerSetting(id, {
      githubWebhookSecret: githubWebhookSecret.value,
      instanceserverUnreachableTimeoutSeconds: instanceserverUnreachableTimeoutSeconds.value
    })
      .then(() => {
        state.set({ loading: false, errorMessage: '' })
      })
      .catch((e) => {
        state.set({ loading: false, errorMessage: e.message })
      })
  }

  const handleCancel = () => {
    githubWebhookSecret.set(serverSetting?.githubWebhookSecret)
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
          value={serverSetting?.mode || 'test'}
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
          value={serverSetting?.storageProvider || ''}
          disabled
        />

        <Input
          fullWidth
          value={serverSetting?.hostname || 'test'}
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
          value={serverSetting?.port || ''}
          disabled
        />

        <Input
          fullWidth
          labelProps={{
            text: t('admin:components.setting.hub'),
            position: 'top'
          }}
          value={serverSetting?.hub?.endpoint || ''}
          disabled
        />

        <Input
          fullWidth
          labelProps={{
            text: t('admin:components.setting.clientHost'),
            position: 'top'
          }}
          value={serverSetting?.clientHost || ''}
          disabled
        />

        <Input
          fullWidth
          labelProps={{
            text: t('admin:components.setting.url'),
            position: 'top'
          }}
          value={serverSetting?.url || ''}
          disabled
        />

        <Input
          fullWidth
          labelProps={{
            text: t('admin:components.setting.rootDirectory'),
            position: 'top'
          }}
          value={serverSetting?.rootDir || ''}
          disabled
        />

        <Input
          fullWidth
          labelProps={{
            text: t('admin:components.setting.certPath'),
            position: 'top'
          }}
          value={serverSetting?.certPath || ''}
          disabled
        />

        <Input
          fullWidth
          labelProps={{
            text: t('admin:components.setting.publicDirectory'),
            position: 'top'
          }}
          value={serverSetting?.publicDir || ''}
          disabled
        />

        <Input
          fullWidth
          labelProps={{
            text: t('admin:components.setting.keyPath'),
            position: 'top'
          }}
          value={serverSetting?.keyPath || ''}
          disabled
        />

        <Input
          fullWidth
          labelProps={{
            text: t('admin:components.setting.nodeModulesDirectory'),
            position: 'top'
          }}
          value={serverSetting?.nodeModulesDir || ''}
          disabled
        />

        <Input
          fullWidth
          labelProps={{
            text: t('admin:components.setting.githubWebhookSecret'),
            position: 'top'
          }}
          value={githubWebhookSecret.value || ''}
          onChange={(e) => githubWebhookSecret.set(e.target.value)}
        />

        <Input
          fullWidth
          labelProps={{
            text: t('admin:components.setting.localStorageProvider'),
            position: 'top'
          }}
          value={serverSetting?.localStorageProvider || ''}
          disabled
        />

        <Input
          fullWidth
          labelProps={{
            text: t('admin:components.setting.releaseName'),
            position: 'top'
          }}
          value={serverSetting?.releaseName || ''}
          disabled
        />

        <Input
          fullWidth
          labelProps={{
            text: t('admin:components.setting.instanceserverUnreachableTimeoutSeconds'),
            position: 'top'
          }}
          value={instanceserverUnreachableTimeoutSeconds?.value || ''}
          onChange={(e) => instanceserverUnreachableTimeoutSeconds.set(Number(e.target.value))}
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
          <Button size="small" className="text-primary col-span-1 bg-theme-highlight" fullWidth onClick={handleCancel}>
            {t('admin:components.common.reset')}
          </Button>
          <Button
            size="small"
            variant="primary"
            className="col-span-1"
            fullWidth
            onClick={handleSubmit}
            startIcon={state.loading.value && <LoadingView spinnerOnly className="h-6 w-6" />}
          >
            {t('admin:components.common.save')}
          </Button>
        </div>
      </div>
    </Accordion>
  )
})

export default ServerTab
