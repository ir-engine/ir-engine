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

import { useFind, useMutation } from '@ir-engine/common'
import { EngineSettings } from '@ir-engine/common/src/constants/EngineSettings'
import { engineSettingPath } from '@ir-engine/common/src/schema.type.module'
import { getDataType } from '@ir-engine/common/src/utils/dataTypeUtils'
import { useHookstate } from '@ir-engine/hyperflux'
import { Button, Input } from '@ir-engine/ui'
import PasswordInput from '@ir-engine/ui/src/components/tailwind/PasswordInput'
import Accordion from '@ir-engine/ui/src/primitives/tailwind/Accordion'
import LoadingView from '@ir-engine/ui/src/primitives/tailwind/LoadingView'

const ReadyPlayerMeTab = forwardRef(({ open }: { open: boolean }, ref: React.MutableRefObject<HTMLDivElement>) => {
  const { t } = useTranslation()
  const state = useHookstate<{ loading: boolean; errorMessage: string }>({
    loading: false,
    errorMessage: ''
  })
  const rpmSetting = useHookstate<{ appId: string; api: string; apiKey: string; partner: string }>({
    appId: '',
    api: '',
    apiKey: '',
    partner: ''
  })

  const readyPlayerMeMutation = useMutation(engineSettingPath)

  const rpmSettingsQuery = useFind(engineSettingPath, {
    query: {
      category: 'ready-player-me',
      paginate: false
    }
  })

  useEffect(() => {
    if (rpmSettingsQuery.status === 'success' && rpmSettingsQuery.data.length > 0) {
      rpmSettingsQuery.data.map((setting) => {
        rpmSetting.merge({
          [setting.key]: setting.value
        })
      })
    }
  }, [rpmSettingsQuery.status])

  const handleSubmit = async ($event) => {
    $event.preventDefault()
    const setting = rpmSetting.value

    const hasEmptySetting = Object.keys(setting).some((key) => !setting[key])

    if (hasEmptySetting) return

    state.loading.set(true)
    const operation = Object.values(EngineSettings.ReadyPlayerMe).map((key) => {
      const settingInDb = rpmSettingsQuery.data.find((el) => el.key === key)
      if (!settingInDb) {
        return readyPlayerMeMutation.create({
          key,
          category: 'ready-player-me',
          dataType: getDataType(setting[key]),
          value: setting[key],
          type: 'private'
        })
      }
      return readyPlayerMeMutation.patch(settingInDb.id, {
        key,
        category: 'ready-player-me',
        dataType: getDataType(setting[key]),
        value: setting[key],
        type: 'private'
      })
    })
    try {
      await Promise.all(operation)
      state.set({ loading: false, errorMessage: '' })
    } catch (error) {
      state.set({ loading: false, errorMessage: error.message })
    }
  }

  const handleReset = () => {
    if (rpmSettingsQuery.data.length > 0) {
      rpmSettingsQuery.data.map((setting) => {
        rpmSetting.merge({
          [setting.key]: setting.value
        })
      })
    }
  }

  return (
    <Accordion
      title={t('admin:components.setting.readyPlayerMe.header')}
      subtitle={t('admin:components.setting.readyPlayerMe.subtitle')}
      ref={ref}
      open={open}
    >
      <div className="my-6 grid grid-cols-3 gap-6">
        <Input
          fullWidth
          labelProps={{
            text: t('admin:components.setting.readyPlayerMe.appId'),
            position: 'top'
          }}
          value={rpmSetting.appId?.value || ''}
          onChange={(e) => rpmSetting.appId.set(e.target.value)}
        />
        <Input
          fullWidth
          labelProps={{
            text: t('admin:components.setting.readyPlayerMe.api'),
            position: 'top'
          }}
          value={rpmSetting.api?.value || ''}
          onChange={(e) => rpmSetting.api.set(e.target.value)}
        />

        <PasswordInput
          fullWidth
          labelProps={{
            text: t('admin:components.setting.readyPlayerMe.apiKey'),
            position: 'top'
          }}
          value={rpmSetting.apiKey?.value || ''}
          onChange={(e) => rpmSetting.apiKey.set(e.target.value)}
        />

        <Input
          fullWidth
          labelProps={{
            text: t('admin:components.setting.readyPlayerMe.partner'),
            position: 'top'
          }}
          value={rpmSetting.partner?.value || ''}
          onChange={(e) => rpmSetting.partner.set(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-8 gap-6">
        <Button size="sm" className="text-primary col-span-1 " fullWidth onClick={handleReset}>
          {t('admin:components.common.reset')}
        </Button>
        <Button size="sm" variant="primary" className="col-span-1" fullWidth onClick={handleSubmit}>
          {state.loading.value && <LoadingView spinnerOnly className="h-6 w-6" />}
          {t('admin:components.common.save')}
        </Button>
      </div>
    </Accordion>
  )
})

export default ReadyPlayerMeTab
