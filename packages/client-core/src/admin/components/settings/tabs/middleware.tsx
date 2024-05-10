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

import { middlewareSettingPath } from '@etherealengine/common/src/schema.type.module'
import { useHookstate } from '@etherealengine/hyperflux'
import { useFind, useMutation } from '@etherealengine/spatial/src/common/functions/FeathersHooks'
import Accordion from '@etherealengine/ui/src/primitives/tailwind/Accordion'
import Button from '@etherealengine/ui/src/primitives/tailwind/Button'
import Input from '@etherealengine/ui/src/primitives/tailwind/Input'
import LoadingView from '@etherealengine/ui/src/primitives/tailwind/LoadingView'
import Text from '@etherealengine/ui/src/primitives/tailwind/Text'
import React, { forwardRef } from 'react'
import { useTranslation } from 'react-i18next'
import { HiMinus, HiPlusSmall } from 'react-icons/hi2'

console.log('#### middleware')

const MiddlewareTab = forwardRef(({ open }: { open: boolean }, ref: React.MutableRefObject<HTMLDivElement>) => {
  const { t } = useTranslation()

  const middlewareSetting = useFind(middlewareSettingPath).data.at(0)
  console.log('middlewareSetting', middlewareSetting)
  const id = middlewareSetting?.id
  console.log('id', id)

  const conf0 = useHookstate(middlewareSetting?.conf0)
  const conf1 = useHookstate(middlewareSetting?.conf1)
  const conf2 = useHookstate(middlewareSetting?.conf2)

  conf0.set(middlewareSetting?.conf0)
  conf1.set(middlewareSetting?.conf1)
  conf2.set(middlewareSetting?.conf2)

  console.log('HOOK', conf0.value, conf1.value, conf2.value)

  const state = useHookstate({
    loading: false,
    errorMessage: ''
  })

  const patchMiddlewareSetting = useMutation(middlewareSettingPath).patch

  const handleSubmit = (event) => {
    if (!id) return
    state.loading.set(true)
    patchMiddlewareSetting(id, {
      conf0: conf0.value,
      conf1: conf1.value,
      conf2: conf2.value
    })
      .then(() => {
        state.set({ loading: false, errorMessage: '' })
      })
      .catch((e) => {
        state.set({ loading: false, errorMessage: e.message })
      })
  }

  const handleCancel = () => {
    conf0.set(middlewareSetting?.conf0)
    conf1.set(middlewareSetting?.conf1)
    conf2.set(middlewareSetting?.conf2)
  }

  return (
    <Accordion
      title={t('admin:components.setting.middleware.header')}
      subtitle={t('admin:components.setting.middleware.subtitle')}
      expandIcon={<HiPlusSmall />}
      shrinkIcon={<HiMinus />}
      ref={ref}
      open={open}
    >
      <div className="mt-6 grid grid-cols-2 gap-4">
        <Text component="h3" fontSize="xl" fontWeight="semibold" className="col-span-full mb-4">
          {t('admin:components.setting.middleware.main')}
        </Text>

        <Input
          className="col-span-1"
          label={t('admin:components.setting.middleware.main')}
          value={conf0.value || ''}
          onChange={(e) => conf0.set(e.target.value)}
        />

        {/*  <Toggle*/}
        {/*    containerClassName="justify-start col-span-full"*/}
        {/*    label={t('admin:components.setting.middleware.toggle0')}*/}
        {/*    value={middlewareSetting.toggle0.value}*/}
        {/*    onChange={(value) => middlewareSetting.toggle0.set(value)}*/}
        {/*  />*/}

        <Text component="h3" fontSize="xl" fontWeight="semibold" className="col-span-full my-4">
          {t('admin:components.setting.middleware.sub0')}
        </Text>

        <Input
          className="col-span-1"
          label={t('admin:components.setting.middleware.sub0opt0')}
          value={conf1.value || ''}
          onChange={(e) => conf1.set(e.target.value)}
        />

        <Text component="h3" fontSize="xl" fontWeight="semibold" className="col-span-full my-4">
          {t('admin:components.setting.middleware.sub1')}
        </Text>

        <Input
          className="col-span-1"
          label={t('admin:components.setting.middleware.sub1opt0')}
          value={conf2.value || ''}
          onChange={(e) => conf2.set(e.target.value)}
        />
      </div>

      <div className="mt-6 grid grid-cols-8 gap-6">
        <Button size="small" className="bg-theme-highlight text-primary col-span-1" onClick={handleCancel} fullWidth>
          {t('admin:components.common.reset')}
        </Button>
        <Button
          size="small"
          variant="primary"
          className="col-span-1"
          onClick={handleSubmit}
          startIcon={state.loading.value && <LoadingView spinnerOnly className="h-6 w-6" />}
          fullWidth
        >
          {t('admin:components.common.save')}
        </Button>
      </div>
    </Accordion>
  )
})

export default MiddlewareTab
