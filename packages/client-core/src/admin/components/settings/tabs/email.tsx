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
import { EngineSettingType, engineSettingPath } from '@ir-engine/common/src/schema.type.module'
import { getDataType } from '@ir-engine/common/src/utils/dataTypeUtils'
import { flattenObjectToArray, unflattenArrayToObject } from '@ir-engine/common/src/utils/jsonHelperUtils'
import { useHookstate } from '@ir-engine/hyperflux'
import { EmailConfigType } from '@ir-engine/server-core/src/appconfig'
import { Button, Input } from '@ir-engine/ui'
import PasswordInput from '@ir-engine/ui/src/components/tailwind/PasswordInput'
import Accordion from '@ir-engine/ui/src/primitives/tailwind/Accordion'
import LoadingView from '@ir-engine/ui/src/primitives/tailwind/LoadingView'
import Text from '@ir-engine/ui/src/primitives/tailwind/Text'
import Toggle from '@ir-engine/ui/src/primitives/tailwind/Toggle'

const EmailTab = forwardRef(({ open }: { open: boolean }, ref: React.MutableRefObject<HTMLDivElement>) => {
  const { t } = useTranslation()
  const state = useHookstate({
    loading: false,
    errorMessage: ''
  })
  const engineSetting = useFind(engineSettingPath, {
    query: {
      category: 'email',
      paginate: false
    }
  })

  const emailSettings = unflattenArrayToObject(
    engineSetting.data.map((el) => ({ key: el.key, value: el.value, dataType: el.dataType }))
  ) as EmailConfigType

  const smsNameCharacterLimit = useHookstate(emailSettings.smsNameCharacterLimit)
  const smtp = useHookstate(emailSettings?.smtp)
  const auth = useHookstate(emailSettings?.smtp?.auth)
  const from = useHookstate(emailSettings?.from)
  const subject = useHookstate(emailSettings?.subject)

  const engineSettingMutation = useMutation(engineSettingPath)

  const handleSmtpSecure = (value) => {
    smtp.set({ ...JSON.parse(JSON.stringify(smtp.value)), secure: value })
  }

  const handleUpdateSmtp = (event, type) => {
    smtp.set({
      ...JSON.parse(JSON.stringify(smtp.value)),
      [type]: event.target.value
    })
  }

  const handleUpdateAuth = (event, type) => {
    auth.set({
      ...JSON.parse(JSON.stringify(auth.value)),
      [type]: event.target.value
    })
  }

  useEffect(() => {
    if (engineSetting.status === 'success') {
      smtp.set(emailSettings?.smtp)
      auth.set(emailSettings?.smtp?.auth)
      subject.set(emailSettings?.subject)
      from.set(emailSettings?.from)
      smsNameCharacterLimit.set(emailSettings?.smsNameCharacterLimit)
    }
  }, [engineSetting.status])

  const handleSubmit = (event) => {
    state.loading.set(true)
    event.preventDefault()
    if (!smtp.value || !auth.value || !from.value || !subject.value) return

    const updatedSettings = flattenObjectToArray({
      smtp: { ...smtp.value, auth: auth.value, secure: `${smtp.value.secure}`, port: smtp.value.port },
      from: from.value,
      subject: subject.value
    })
    const emailOperationPromises: Promise<EngineSettingType | EngineSettingType[]>[] = []

    updatedSettings.forEach((setting) => {
      const settingInDb = engineSetting.data.find((el) => el.key === setting.key)
      if (!settingInDb) {
        emailOperationPromises.push(
          engineSettingMutation.create({
            key: setting.key,
            category: 'email',
            dataType: getDataType(setting.value),
            value: `${setting.value}`,
            type: 'private'
          })
        )
      } else if (settingInDb.value != setting.value) {
        emailOperationPromises.push(
          engineSettingMutation.patch(settingInDb.id, {
            key: setting.key,
            category: 'email',
            dataType: getDataType(setting.value),
            value: setting.value,
            type: 'private'
          })
        )
      }
    })

    Promise.all(emailOperationPromises)
      .then(() => {
        state.set({ loading: false, errorMessage: '' })
      })
      .catch((e) => {
        state.set({ loading: false, errorMessage: e.message })
      })
  }

  const handleCancel = () => {
    smtp.set(emailSettings?.smtp)
    auth.set(emailSettings?.smtp?.auth)
    subject.set(emailSettings?.subject)
    from.set(emailSettings?.from)
    smsNameCharacterLimit.set(emailSettings?.smsNameCharacterLimit)
  }

  const handleUpdateSubject = (event, type) => {
    subject.set({
      ...JSON.parse(JSON.stringify(subject.value)),
      [type]: event.target.value
    })
  }

  return (
    <Accordion
      title={t('admin:components.setting.email.header')}
      subtitle={t('admin:components.setting.email.subtitle')}
      expandIcon={<HiPlusSmall />}
      shrinkIcon={<HiMinus />}
      ref={ref}
      open={open}
    >
      <div className="my-4 grid grid-cols-2 gap-4">
        <Text component="h2" fontSize="base" fontWeight="semibold" className="col-span-full">
          {t('admin:components.setting.smtp')}
        </Text>
        <Input
          fullWidth
          labelProps={{
            text: t('admin:components.setting.host'),
            position: 'top'
          }}
          value={smtp?.value?.host || ''}
          onChange={(e) => handleUpdateSmtp(e, 'host')}
        />

        <Input
          fullWidth
          labelProps={{
            text: t('admin:components.setting.port'),
            position: 'top'
          }}
          value={smtp?.value?.port || ''}
          onChange={(e) => handleUpdateSmtp(e, 'port')}
        />

        <Toggle
          className="col-span-2"
          label={t('admin:components.setting.secure')}
          value={smtp?.value?.secure || false}
          onChange={handleSmtpSecure}
        />
      </div>

      <div className="my-4 grid grid-cols-2 gap-4">
        <Text component="h2" fontSize="base" fontWeight="semibold" className="col-span-full">
          {t('admin:components.setting.from')}
        </Text>
        <Input
          fullWidth
          labelProps={{
            text: t('admin:components.setting.from'),
            position: 'top'
          }}
          value={from?.value || ''}
          onChange={(e) => from.set(e.target.value)}
        />
      </div>

      <div className="my-4 grid grid-cols-2 gap-4">
        <Text component="h2" fontSize="base" fontWeight="semibold" className="col-span-full">
          {t('admin:components.setting.auth')}
        </Text>
        <Input
          fullWidth
          labelProps={{
            text: t('admin:components.setting.userName'),
            position: 'top'
          }}
          value={auth?.value?.user || ''}
          onChange={(e) => handleUpdateAuth(e, 'user')}
        />

        <PasswordInput
          fullWidth
          labelProps={{
            text: t('admin:components.setting.password'),
            position: 'top'
          }}
          value={auth?.value?.pass || ''}
          onChange={(e) => handleUpdateAuth(e, 'pass')}
        />
      </div>

      <div className="my-4 grid grid-cols-2 gap-4">
        <Text component="h2" fontSize="base" fontWeight="semibold" className="col-span-full">
          {t('admin:components.setting.subject')}
        </Text>
        <Input
          fullWidth
          labelProps={{
            text: t('admin:components.setting.login'),
            position: 'top'
          }}
          value={subject?.value?.login || ''}
          onChange={(e) => handleUpdateSubject(e, 'login')}
        />

        <Input
          fullWidth
          labelProps={{
            text: t('admin:components.setting.friend'),
            position: 'top'
          }}
          value={subject?.value?.friend || ''}
          onChange={(e) => handleUpdateSubject(e, 'friend')}
        />

        <Input
          fullWidth
          labelProps={{
            text: t('admin:components.setting.channel'),
            position: 'top'
          }}
          value={subject?.value?.channel || ''}
          onChange={(e) => handleUpdateSubject(e, 'channel')}
        />

        <Input
          fullWidth
          labelProps={{
            text: t('admin:components.setting.smsNameCharLimit'),
            position: 'top'
          }}
          value={smsNameCharacterLimit?.value?.toString() || ''}
          disabled
        />

        {state.errorMessage.value && (
          <div className="col-span-full">
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
            {t('admin:components.common.save')}
            {state.loading.value && <LoadingView spinnerOnly className="h-6 w-6" />}
          </Button>
        </div>
      </div>
    </Accordion>
  )
})

export default EmailTab
