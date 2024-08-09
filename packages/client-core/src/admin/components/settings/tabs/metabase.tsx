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

import { metabaseSettingPath } from '@etherealengine/common/src/schema.type.module'
import { useHookstate } from '@etherealengine/hyperflux'
import { useFind, useMutation } from '@etherealengine/spatial/src/common/functions/FeathersHooks'
import PasswordInput from '@etherealengine/ui/src/components/tailwind/PasswordInput'
import Accordion from '@etherealengine/ui/src/primitives/tailwind/Accordion'
import Button from '@etherealengine/ui/src/primitives/tailwind/Button'
import Input from '@etherealengine/ui/src/primitives/tailwind/Input'
import LoadingView from '@etherealengine/ui/src/primitives/tailwind/LoadingView'
import React, { forwardRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { HiMinus, HiPlusSmall } from 'react-icons/hi2'

const MetabaseTab = forwardRef(({ open }: { open: boolean }, ref: React.MutableRefObject<HTMLDivElement>) => {
  const { t } = useTranslation()
  const state = useHookstate<{ loading: boolean; errorMessage: string }>({
    loading: false,
    errorMessage: ''
  })
  const id = useHookstate<string | undefined>(undefined)
  const siteUrl = useHookstate('')
  const secretKey = useHookstate('')
  const expiration = useHookstate(10)
  const crashDashboardId = useHookstate('')
  const metabaseSettingMutation = useMutation(metabaseSettingPath)

  const { data } = useFind(metabaseSettingPath)

  useEffect(() => {
    if (data.length) {
      id.set(data[0].id)
      siteUrl.set(data[0].siteUrl)
      secretKey.set(data[0].secretKey)
      expiration.set(data[0].expiration)
      crashDashboardId.set(data[0].crashDashboardId || '')
    }
  }, [data])

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!siteUrl.value || !secretKey.value) return

    state.loading.set(true)

    const setting = {
      siteUrl: siteUrl.value,
      secretKey: secretKey.value,
      crashDashboardId: crashDashboardId.value
    }

    const operation = !id.value
      ? metabaseSettingMutation.create(setting)
      : metabaseSettingMutation.patch(id.value, setting)
    operation
      .then(() => {
        state.set({ loading: false, errorMessage: '' })
      })
      .catch((e) => {
        state.set({ loading: false, errorMessage: e.message })
      })
  }

  const handleCancel = () => {
    if (data.length) {
      id.set(data[0].id)
      siteUrl.set(data[0].siteUrl)
      secretKey.set(data[0].secretKey)
      expiration.set(data[0].expiration)
      crashDashboardId.set(data[0].crashDashboardId || '')
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
          className="col-span-1"
          label={t('admin:components.setting.metabase.siteUrl')}
          value={siteUrl?.value || ''}
          onChange={(e) => siteUrl.set(e.target.value)}
        />

        <PasswordInput
          className="col-span-1"
          label={t('admin:components.setting.metabase.secretKey')}
          value={secretKey?.value || ''}
          onChange={(e) => secretKey.set(e.target.value)}
        />

        <Input
          className="col-span-1"
          type="number"
          label={t('admin:components.setting.metabase.expiration')}
          value={expiration?.value || 10}
          onChange={(e) => expiration.set(isNaN(parseInt(e.target.value)) ? 10 : parseInt(e.target.value))}
        />

        <Input
          className="col-span-1"
          label={t('admin:components.setting.metabase.crashDashboardId')}
          value={crashDashboardId?.value || ''}
          onChange={(e) => crashDashboardId.set(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-8 gap-6">
        <Button size="xs" className="text-primary col-span-1 bg-theme-highlight" fullWidth onClick={handleCancel}>
          {t('admin:components.common.reset')}
        </Button>
        <Button
          size="xs"
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
