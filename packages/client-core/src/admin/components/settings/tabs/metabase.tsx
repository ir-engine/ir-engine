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

import { useFind, useMutation } from '@ir-engine/common'
import { EngineSettings } from '@ir-engine/common/src/constants/EngineSettings'
import { EngineSettingData, EngineSettingType, engineSettingPath } from '@ir-engine/common/src/schema.type.module'
import { useHookstate } from '@ir-engine/hyperflux'
import { Input } from '@ir-engine/ui'
import PasswordInput from '@ir-engine/ui/src/components/tailwind/PasswordInput'
import Accordion from '@ir-engine/ui/src/primitives/tailwind/Accordion'
import Button from '@ir-engine/ui/src/primitives/tailwind/Button'
import LoadingView from '@ir-engine/ui/src/primitives/tailwind/LoadingView'
import React, { forwardRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { HiMinus, HiPlusSmall } from 'react-icons/hi2'

const MetabaseTab = forwardRef(({ open }: { open: boolean }, ref: React.MutableRefObject<HTMLDivElement>) => {
  const { t } = useTranslation()
  const state = useHookstate<{ loading: boolean; errorMessage: string }>({
    loading: false,
    errorMessage: ''
  })
  const siteUrl = useHookstate('')
  const secretKey = useHookstate('')
  const environment = useHookstate('')
  const expiration = useHookstate('10')
  const crashDashboardId = useHookstate('')
  const metabaseSettingMutation = useMutation(engineSettingPath)

  const engineSettings = useFind(engineSettingPath, {
    query: {
      category: 'metabase',
      paginate: false
    }
  }).data

  const secretValue = engineSettings.find((el) => el.key === EngineSettings.Metabase.SecretKey)?.value || ''
  const siteUrlValue = engineSettings.find((el) => el.key === EngineSettings.Metabase.SiteUrl)?.value || ''
  const environmentValue = engineSettings.find((el) => el.key === EngineSettings.Metabase.Environment)?.value || ''
  const expirationValue = engineSettings.find((el) => el.key === EngineSettings.Metabase.Expiration)?.value || '10'
  const crashDashboardIdValue =
    engineSettings.find((el) => el.key === EngineSettings.Metabase.CrashDashboardId)?.value || ''

  useEffect(() => {
    if (engineSettings.length) {
      siteUrl.set(siteUrlValue)
      secretKey.set(secretValue)
      environment.set(environmentValue)
      expiration.set(expirationValue)
      crashDashboardId.set(crashDashboardIdValue)
    }
  }, [engineSettings])

  const handleSubmit = async (event) => {
    try {
      event.preventDefault()

      if (!siteUrl.value || !secretKey.value || !environment.value) return

      state.loading.set(true)

      const setting = {
        siteUrl: siteUrl.value,
        secretKey: secretKey.value,
        environment: environment.value,
        crashDashboardId: crashDashboardId.value
      }

      const createData: EngineSettingData[] = []
      const operations: Promise<EngineSettingType | EngineSettingType[]>[] = []

      Object.values(EngineSettings.Metabase).forEach((key) => {
        const settingInDb = engineSettings.find((el) => el.key === key)
        if (!settingInDb) {
          createData.push({
            key,
            category: 'metabase',
            value: setting[key],
            type: 'private'
          })
        } else if (settingInDb.value !== setting[key]) {
          operations.push(
            metabaseSettingMutation.patch(settingInDb.id, {
              key,
              category: 'metabase',
              value: setting[key],
              type: 'private'
            })
          )
        }
      })

      if (createData.length > 0) {
        const createOperation = metabaseSettingMutation.create(createData)
        operations.push(createOperation)
      }

      await Promise.all(operations)
      state.set({ loading: false, errorMessage: '' })
    } catch (e) {
      state.set({ loading: false, errorMessage: e.message })
    }
  }

  const handleCancel = () => {
    if (engineSettings.length) {
      siteUrl.set(siteUrlValue)
      secretKey.set(secretValue)
      environment.set(environmentValue)
      expiration.set(expirationValue)
      crashDashboardId.set(crashDashboardIdValue)
    }
  }

  return (
    <Accordion
      title={t('admin:components.setting.metabase.header')}
      subtitle={t('admin:components.setting.metabase.subtitle')}
      expandIcon={<HiPlusSmall />}
      shrinkIcon={<HiMinus />}
      ref={ref}
      open={open}
    >
      <div className="my-6 grid grid-cols-3 gap-6">
        <Input
          labelProps={{
            text: t('admin:components.setting.metabase.siteUrl'),
            position: 'top'
          }}
          value={siteUrl?.value || ''}
          onChange={(e) => siteUrl.set(e.target.value)}
        />

        <Input
          labelProps={{
            text: t('admin:components.setting.metabase.environment'),
            position: 'top'
          }}
          value={environment?.value || ''}
          onChange={(e) => environment.set(e.target.value)}
        />

        <PasswordInput
          labelProps={{
            text: t('admin:components.setting.metabase.secretKey'),
            position: 'top'
          }}
          value={secretKey?.value || ''}
          onChange={(e) => secretKey.set(e.target.value)}
        />

        <Input
          type="number"
          labelProps={{
            text: t('admin:components.setting.metabase.expiration'),
            position: 'top'
          }}
          value={expiration?.value || 10}
          onChange={(e) => expiration.set(e.target.value)}
        />

        <Input
          labelProps={{
            text: t('admin:components.setting.metabase.crashDashboardId'),
            position: 'top'
          }}
          value={crashDashboardId?.value || ''}
          onChange={(e) => crashDashboardId.set(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-8 gap-6">
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
    </Accordion>
  )
})

export default MetabaseTab
