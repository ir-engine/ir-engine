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
import { engineSettingPath } from '@ir-engine/common/src/schema.type.module'
import { useHookstate } from '@ir-engine/hyperflux'
import { Input } from '@ir-engine/ui'
import PasswordInput from '@ir-engine/ui/src/components/tailwind/PasswordInput'
import Accordion from '@ir-engine/ui/src/primitives/tailwind/Accordion'
import Button from '@ir-engine/ui/src/primitives/tailwind/Button'
import LoadingView from '@ir-engine/ui/src/primitives/tailwind/LoadingView'

const ZendeskTab = forwardRef(({ open }: { open: boolean }, ref: React.MutableRefObject<HTMLDivElement>) => {
  const { t } = useTranslation()
  const state = useHookstate<{ loading: boolean; errorMessage: string }>({
    loading: false,
    errorMessage: ''
  })
  const name = useHookstate<string>('')
  const secret = useHookstate<string>('')
  const kid = useHookstate<string>('')
  const zendeskMutation = useMutation(engineSettingPath)

  const zendeskSettings = useFind(engineSettingPath, {
    query: {
      category: 'zendesk',
      paginate: false
    }
  }).data

  const secretValue = zendeskSettings.find((el) => el.key === EngineSettings.Zendesk.Secret)?.value || ''
  const nameValue = zendeskSettings.find((el) => el.key === EngineSettings.Zendesk.Name)?.value || ''
  const kidValue = zendeskSettings.find((el) => el.key === EngineSettings.Zendesk.Kid)?.value || ''

  useEffect(() => {
    if (zendeskSettings.length > 0) {
      name.set(nameValue)
      secret.set(secretValue)
      kid.set(kidValue)
    }
  }, [secretValue, nameValue, kidValue])

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!name.value || !secret.value || !kid.value) return

    state.loading.set(true)
    const setting = {
      name: name.value,
      secret: secret.value,
      kid: kid.value
    }
    const operation = Object.values(EngineSettings.Zendesk).map((key) => {
      const settingInDb = zendeskSettings.find((el) => el.key === key)
      if (!settingInDb) {
        return zendeskMutation.create({
          key,
          category: 'zendesk',
          value: setting[key],
          type: 'private'
        })
      }
      return zendeskMutation.patch(settingInDb.id, {
        key,
        category: 'zendesk',
        value: setting[key],
        type: 'private'
      })
    })
    Promise.all(operation)
      .then(() => {
        state.set({ loading: false, errorMessage: '' })
      })
      .catch((e) => {
        state.set({ loading: false, errorMessage: e.message })
      })
  }

  const handleReset = () => {
    if (zendeskSettings.length > 0) {
      name.set(nameValue)
      secret.set(secretValue)
      kid.set(kidValue)
    }
  }

  return (
    <Accordion
      title={t('admin:components.setting.zendesk.header')}
      subtitle={t('admin:components.setting.zendesk.subtitle')}
      expandIcon={<HiPlusSmall />}
      shrinkIcon={<HiMinus />}
      ref={ref}
      open={open}
    >
      <div className="my-6 grid grid-cols-3 gap-6">
        <Input
          fullWidth
          labelProps={{
            text: t('admin:components.setting.keyName'),
            position: 'top'
          }}
          value={name?.value || ''}
          onChange={(e) => name.set(e.target.value)}
        />

        <PasswordInput
          fullWidth
          labelProps={{
            text: t('admin:components.setting.secret'),
            position: 'top'
          }}
          value={secret?.value || ''}
          onChange={(e) => secret.set(e.target.value)}
        />

        <Input
          fullWidth
          labelProps={{
            text: t('admin:components.setting.kid'),
            position: 'top'
          }}
          value={kid?.value || ''}
          onChange={(e) => kid.set(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-8 gap-6">
        <Button size="small" className="text-primary col-span-1 bg-theme-highlight" fullWidth onClick={handleReset}>
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

export default ZendeskTab
