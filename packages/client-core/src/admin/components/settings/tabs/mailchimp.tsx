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
import PasswordInput from '@ir-engine/ui/src/components/tailwind/PasswordInput'
import Accordion from '@ir-engine/ui/src/primitives/tailwind/Accordion'
import Button from '@ir-engine/ui/src/primitives/tailwind/Button'
import Input from '@ir-engine/ui/src/primitives/tailwind/Input'
import LoadingView from '@ir-engine/ui/src/primitives/tailwind/LoadingView'

const MailchimpTab = forwardRef(({ open }: { open: boolean }, ref: React.MutableRefObject<HTMLDivElement>) => {
  const { t } = useTranslation()
  const state = useHookstate<{ loading: boolean; errorMessage: string }>({
    loading: false,
    errorMessage: ''
  })
  const key = useHookstate<string>('')
  const server = useHookstate<string>('')
  const audienceId = useHookstate<string>('')
  const defaultTags = useHookstate<string>('')
  const groupId = useHookstate<string>('')
  const mailchimpMutation = useMutation(engineSettingPath)

  const mailchimpSettings = useFind(engineSettingPath, {
    query: {
      category: 'mailchimp',
      paginate: false
    }
  }).data

  const secretValue = mailchimpSettings.find((el) => el.key === EngineSettings.MailChimp.Key)?.value || ''
  const serverValue = mailchimpSettings.find((el) => el.key === EngineSettings.MailChimp.Server)?.value || ''
  const audienceIdValue = mailchimpSettings.find((el) => el.key === EngineSettings.MailChimp.AudienceId)?.value || ''
  const defaultTagsValue = mailchimpSettings.find((el) => el.key === EngineSettings.MailChimp.DefaultTags)?.value || ''
  const groupIdValue = mailchimpSettings.find((el) => el.key === EngineSettings.MailChimp.GroupId)?.value || ''

  useEffect(() => {
    if (mailchimpSettings.length) {
      key.set(secretValue)
      server.set(serverValue)
      audienceId.set(audienceIdValue)
      defaultTags.set(defaultTagsValue)
      groupId.set(groupIdValue)
    }
  }, [mailchimpSettings])

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!key.value || !server.value || !audienceId.value) return

    state.loading.set(true)
    const setting = {
      Key: key.value,
      Server: server.value,
      AudienceId: audienceId.value,
      DefaultTags: defaultTags.value,
      GroupId: groupId.value
    }

    const operation = Object.keys(EngineSettings.MailChimp).map((key) => {
      const settingInDb = mailchimpSettings.find((el) => el.key === EngineSettings.MailChimp[key])
      if (!settingInDb) {
        return mailchimpMutation.create({
          key: EngineSettings.MailChimp[key],
          category: 'mailchimp',
          value: setting[key],
          type: 'private'
        })
      }
      return mailchimpMutation.patch(settingInDb.id, {
        key: EngineSettings.MailChimp[key],
        category: 'mailchimp',
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

  const handleCancel = () => {
    if (mailchimpSettings.length > 0) {
      key.set(secretValue)
      server.set(serverValue)
      audienceId.set(audienceIdValue)
      defaultTags.set(defaultTagsValue)
      groupId.set(groupIdValue)
    }
  }

  return (
    <Accordion
      title={t('admin:components.setting.mailchimp.header')}
      subtitle={t('admin:components.setting.mailchimp.subtitle')}
      expandIcon={<HiPlusSmall />}
      shrinkIcon={<HiMinus />}
      ref={ref}
      open={open}
    >
      <div className="my-6 grid grid-cols-4 gap-6">
        <PasswordInput
          className="col-span-1"
          label={t('admin:components.setting.mailchimp.key')}
          value={key?.value || ''}
          onChange={(e) => key.set(e.target.value)}
        />
        <Input
          className="col-span-1"
          label={t('admin:components.setting.mailchimp.server')}
          value={server?.value || ''}
          onChange={(e) => server.set(e.target.value)}
        />
        <Input
          className="col-span-1"
          label={t('admin:components.setting.mailchimp.audienceId')}
          value={audienceId?.value || ''}
          onChange={(e) => audienceId.set(e.target.value)}
        />
        <Input
          className="col-span-1"
          label={t('admin:components.setting.mailchimp.defaultTags')}
          value={defaultTags?.value || ''}
          onChange={(e) => defaultTags.set(e.target.value)}
        />
        <Input
          className="col-span-1"
          label={t('admin:components.setting.mailchimp.groupId')}
          value={groupId?.value || ''}
          onChange={(e) => groupId.set(e.target.value)}
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

export default MailchimpTab
