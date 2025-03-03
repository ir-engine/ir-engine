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

import DataTable, { ITableHeadCell } from '@ir-engine/client-core/src/admin/common/Table'
import { useFind, useMutation, useSearch } from '@ir-engine/common'
import { moderationBanPath, ModerationBanType } from '@ir-engine/common/src/schema.type.module'
import { toDisplayDateTime } from '@ir-engine/common/src/utils/datetime-sql'
import { t } from 'i18next'
import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { validate as isValidUUID } from 'uuid'
import { NotificationService } from '../../../common/services/NotificationService'
import { LocationLabel } from './common/LocationLabel'
import { UserDisplayName } from './common/UserDisplayName'

const moderationBanColumns: ITableHeadCell[] = [
  { id: 'username', label: t('admin:components.moderation.moderationban.columns.username') },
  { id: 'userId', label: t('admin:components.moderation.moderationban.columns.userId') },
  { id: 'reason', label: t('admin:components.moderation.moderationban.columns.reason') },
  { id: 'space', label: t('admin:components.moderation.moderationban.columns.space') },
  { id: 'ipAddress', label: t('admin:components.moderation.moderationban.columns.ipAddress') },
  { id: 'dateReported', label: t('admin:components.moderation.moderationban.columns.dateReported') },
  { id: 'action', label: t('admin:components.moderation.moderationban.columns.action') }
]

export default function ModerationBanTable({ search }) {
  const { t } = useTranslation()
  const moderationBanMutation = useMutation(moderationBanPath)

  const updateBanUser = useCallback(
    (user) => {
      moderationBanMutation
        .patch(user.id, { banned: !user.banned })
        .then(() => {
          NotificationService.dispatchNotify(
            !user.banned ? t('admin:components.moderation.userBanned') : t('admin:components.moderation.userUnBanned'),
            {
              variant: 'success'
            }
          )
        })
        .catch((error) => {
          console.error('Error updating user ban status:', error)
        })
    },
    [moderationBanMutation, t]
  )

  const moderationBanQuery = useFind(moderationBanPath, {
    query: {
      action: 'admin',
      $limit: 20
    }
  })

  useSearch(
    moderationBanQuery,
    {
      $or: [
        {
          banUserId: isValidUUID(search) ? search : undefined
        },
        {
          banReason: {
            $like: `%${search}%`
          }
        }
      ]
    },
    search
  )

  const createRows = (rows: ModerationBanType[]) =>
    rows.map((row) => ({
      id: row.id,
      username: <UserDisplayName userId={row.banUserId} />,
      userId: row.banUserId,
      space: row.reportedLocationId ? <LocationLabel locationId={row.reportedLocationId} /> : 'N/A',
      reason: t(`user:moderation.abuseReason.${row.banReason}`),
      ipAddress: row.ipAddress,
      dateReported: <span>{toDisplayDateTime(row.createdAt)}</span>,
      action: (
        <button
          onClick={() => updateBanUser(row)}
          className="flex cursor-pointer items-center border-none bg-transparent px-0 py-0 text-blue-500"
        >
          {row.banned ? t('admin:components.moderation.unBan') : t('admin:components.moderation.ban')}
        </button>
      )
    }))

  return (
    <DataTable
      query={moderationBanQuery}
      columns={moderationBanColumns}
      rows={createRows([...moderationBanQuery.data])}
    />
  )
}
