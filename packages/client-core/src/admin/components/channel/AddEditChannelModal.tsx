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

import React from 'react'
import { useTranslation } from 'react-i18next'

import { PopoverState } from '@ir-engine/client-core/src/common/services/PopoverState'
import { channelPath, ChannelType } from '@ir-engine/common/src/schema.type.module'
import { useHookstate } from '@ir-engine/hyperflux'
import { useMutation } from '@ir-engine/spatial/src/common/functions/FeathersHooks'
import Input from '@ir-engine/ui/src/primitives/tailwind/Input'
import Modal from '@ir-engine/ui/src/primitives/tailwind/Modal'

const getDefaultErrors = () => ({
  channelName: '',
  serverError: ''
})

export default function AddEditChannelModal({ channel }: { channel?: ChannelType }) {
  const { t } = useTranslation()

  const channelName = useHookstate(channel?.name || '')
  const channelMutation = useMutation(channelPath)

  const submitLoading = useHookstate(false)
  const errors = useHookstate(getDefaultErrors())

  const handleSubmit = async () => {
    errors.set(getDefaultErrors())

    if (!channelName.value) {
      errors.channelName.set(t('admin:components.channel.nameRequired'))
      return
    }

    try {
      if (channel?.id) {
        channelMutation.patch(channel.id, { name: channelName.value })
      } else {
        channelMutation.create({ name: channelName.value })
      }
      PopoverState.hidePopupover()
    } catch (err) {
      errors.serverError.set(err.message)
    }
  }

  return (
    <Modal
      title={channel?.id ? t('admin:components.channel.update') : t('admin:components.channel.createChannel')}
      className="w-[50vw] max-w-2xl"
      onSubmit={handleSubmit}
      onClose={PopoverState.hidePopupover}
      submitLoading={submitLoading.value}
    >
      {errors.serverError.value && <p className="mb-3 text-red-700">{errors.serverError.value}</p>}
      <Input
        label={t('admin:components.channel.name')}
        value={channelName.value}
        onChange={(event) => channelName.set(event.target.value)}
        error={errors.channelName.value}
      />
    </Modal>
  )
}
