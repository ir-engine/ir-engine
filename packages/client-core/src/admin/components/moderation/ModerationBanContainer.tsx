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

import { API, useFind, useMutation } from '@ir-engine/common'
import {
  AbuseReasonsType,
  moderationBanPath,
  ModerationBanType,
  UserType
} from '@ir-engine/common/src/schema.type.module'
import { Button } from '@ir-engine/ui'
import Text from '@ir-engine/ui/src/primitives/tailwind/Text'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { FaPlus } from 'react-icons/fa'
import { LuUserMinus } from 'react-icons/lu'
import { ModalState } from '../../../common/services/ModalState'
import { NotificationService } from '../../../common/services/NotificationService'
import { BanUsersModal } from './BanUsersModal'
import ModerationBanTable from './ModerationBanTable'

export const ModerationBanContainer = ({ search }) => {
  const { t } = useTranslation()
  const moderationBanMutation = useMutation(moderationBanPath)

  const moderationBanQuery = useFind(moderationBanPath, {
    query: {
      action: 'admin',
      $limit: 20
    }
  })

  const handleBanUser = async (formData) => {
    const banUser = {
      banUserId: (formData?.selectedUser as UserType).id,
      banned: true,
      banReason: formData?.reason as AbuseReasonsType
    } as ModerationBanType

    try {
      const response = await API.instance.service(moderationBanPath).find({
        query: {
          action: 'admin',
          banUserId: banUser.banUserId,
          $limit: 1
        }
      })

      if (response.data.length > 0) {
        NotificationService.dispatchNotify(t('admin:components.moderation.userAlreadyBanned'), { variant: 'error' })
        return
      }

      await moderationBanMutation.create(banUser)
      NotificationService.dispatchNotify(
        banUser.banned ? t('admin:components.moderation.userBanned') : t('admin:components.moderation.userUnBanned'),
        {
          variant: 'success'
        }
      )
    } catch (error) {
      NotificationService.dispatchNotify(error.message, { variant: 'error' })
      console.error(error)
    }

    ModalState.closeModal()
  }

  return (
    <>
      {moderationBanQuery.status == 'success' && moderationBanQuery.data.length == 0 && search == '' ? (
        <div className="flex w-full items-center justify-center text-white">
          <div className="mt-[241px] text-center">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gray-800">
              <LuUserMinus className="h-12 w-12 text-gray-400" />
            </div>
            <Text className="mb-2 text-2xl font-bold">{t('admin:components.moderation.addUsersToBan')}</Text>
            <p className="mb-6 text-gray-400">{t('admin:components.moderation.manageAccess')}</p>
            <Button
              variant="primary"
              onClick={() => ModalState.openModal(<BanUsersModal onSubmit={handleBanUser} />)}
              className="mx-auto flex items-center justify-center rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
            >
              <FaPlus className="mr-2" />
              {t('admin:components.moderation.addUsers')}
            </Button>
          </div>
        </div>
      ) : (
        <div className="h-full w-full p-4">
          <div className="mb-4 flex items-center justify-between">
            <Button
              variant="primary"
              onClick={() => ModalState.openModal(<BanUsersModal onSubmit={handleBanUser} />)}
              className="flex items-center justify-center rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
            >
              <FaPlus className="mr-2" />
              {t('admin:components.moderation.addUsers')}
            </Button>
          </div>
          <ModerationBanTable search={search} />
        </div>
      )}
    </>
  )
}
