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
import { LocationID, locationPath } from '@ir-engine/common/src/schema.type.module'
import { useHookstate } from '@ir-engine/hyperflux'
import { useFind, useMutation } from '@ir-engine/spatial/src/common/functions/FeathersHooks'
import Input from '@ir-engine/ui/src/primitives/tailwind/Input'
import Modal from '@ir-engine/ui/src/primitives/tailwind/Modal'
import Select from '@ir-engine/ui/src/primitives/tailwind/Select'

import { NotificationService } from '../../../common/services/NotificationService'

export default function PatchServerModal() {
  const { t } = useTranslation()
  const state = useHookstate({
    locationId: '',
    locationError: '',
    count: 1
  })
  const modalProcessing = useHookstate(false)

  const handleSubmit = () => {
    modalProcessing.set(true)
    patchInstanceserver({ locationId: state.locationId.value as LocationID, count: state.count.value })
      .then((patchResponse) => {
        NotificationService.dispatchNotify(patchResponse.message, {
          variant: patchResponse.status ? 'success' : 'error'
        })
        PopoverState.hidePopupover()
      })
      .catch((e) => {
        state.locationError.set(e.message)
      })
  }

  const adminLocations = useFind(locationPath, { query: { action: 'admin' } })
  const patchInstanceserver = useMutation('instanceserver-provision').patch

  const locationsMenu = adminLocations.data.map((el) => {
    return {
      label: el.name,
      value: el.id
    }
  })

  return (
    <Modal
      title={t('admin:components.setting.patchInstanceserver')}
      className="w-[50vw] max-w-2xl"
      onSubmit={handleSubmit}
      onClose={PopoverState.hidePopupover}
      submitLoading={modalProcessing.value}
    >
      <Select
        options={locationsMenu}
        currentValue={state.locationId.value}
        onChange={(value) => {
          state.locationId.set(value)
        }}
        className="mb-5"
        label={t('admin:components.instance.location')}
      />
      <Input
        type="number"
        value={state.count.value}
        onChange={(e) => {
          state.count.set(parseInt(e.target.value))
        }}
        label={t('admin:components.instance.count')}
      />
    </Modal>
  )
}
