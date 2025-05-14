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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import { ABUSE_REASONS } from '@ir-engine/common/src/constants/ModerationConstants'
import { UserType } from '@ir-engine/common/src/schema.type.module'
import { Select } from '@ir-engine/ui'
import Modal from '@ir-engine/ui/src/primitives/tailwind/Modal'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ModalState } from '../../../common/services/ModalState'
import { UserSearchInput } from './common/UserSearchInput'

export const BanUsersModal = ({ onSubmit }) => {
  const { t } = useTranslation()
  const [selectedUser, setSelectedUser] = useState<UserType | undefined>(undefined)
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = () => {
    if (!selectedUser) {
      setError(t('admin:components.moderation.bannedSelectUserError'))
      return
    }
    if (!reason) {
      setError(t('admin:components.moderation.bannedUserReasonError'))
      return
    }
    onSubmit({
      selectedUser,
      reason
    })
    setReason('')
    setError(null)
  }

  const isFormValid = selectedUser && reason

  return (
    <Modal
      title={t('admin:components.moderation.addUser')}
      className="w-[50vw] max-w-2xl"
      onClose={ModalState.closeModal}
      closeButtonText={t('common:components.cancel')}
      submitButtonText={t('admin:components.moderation.banUser')}
      onSubmit={handleSubmit}
      submitButtonDisabled={!isFormValid}
    >
      <div className="space-y-4">
        {error && <div className="text-red-500">{error}</div>}
        <UserSearchInput onSelect={setSelectedUser} />
        <div>
          <label className="mb-1 block text-sm text-gray-400">{t('admin:components.moderation.userId')}</label>
          <input
            type="text"
            disabled={!!selectedUser}
            className="w-full rounded-lg bg-[#191b1f] px-3 py-2 text-white focus:outline-none focus:ring focus:ring-blue-500"
            placeholder={t('admin:components.moderation.uidPlaceholder')}
            value={selectedUser ? selectedUser?.id : ''}
          />
        </div>
        <div>
          <Select
            labelProps={{ text: t('admin:components.moderation.reason'), position: 'top' }}
            options={[...ABUSE_REASONS].map((abuseReason) => ({
              label: t(`user:moderation.abuseReason.${abuseReason}`) as string,
              value: abuseReason
            }))}
            onChange={(e) => setReason(e as string)}
            width="full"
            helperText={t('admin:components.moderation.userBannedSelectReasonHelperText')}
            value={reason}
          />
        </div>
      </div>
    </Modal>
  )
}
