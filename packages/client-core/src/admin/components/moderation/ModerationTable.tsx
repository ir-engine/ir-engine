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

import DataTable, { ITableHeadCell } from '@ir-engine/client-core/src/admin/common/Table'
import { useFind, useSearch } from '@ir-engine/common'
import { moderationPath, ModerationType } from '@ir-engine/common/src/schema.type.module'
import { toDisplayDateTime } from '@ir-engine/common/src/utils/datetime-sql'
import { Select } from '@ir-engine/ui'
import Text from '@ir-engine/ui/src/primitives/tailwind/Text'
import { t } from 'i18next'
import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { IoArrowForward } from 'react-icons/io5'
import { UserDisplayName } from './common/UserDisplayName'
import { ModerationDetail } from './ModerationDetail'

const moderationTableColumns: ITableHeadCell[] = [
  { id: 'id', label: t('admin:components.moderation.columns.id') },
  { id: 'type', label: t('admin:components.moderation.columns.type') },
  { id: 'username', label: t('admin:components.moderation.columns.username') },
  { id: 'reason', label: t('admin:components.moderation.columns.reason') },
  { id: 'status', label: t('admin:components.moderation.columns.status') },
  { id: 'dateReported', label: t('admin:components.moderation.columns.dateReported') },
  { id: 'action', label: t('admin:components.moderation.columns.action') }
]

enum ModerationFilterStatus {
  All = 'all',
  Open = 'open',
  Resolved = 'resolved'
}
const getStatusFilterOptions = (t: (key: string) => string) =>
  Object.values(ModerationFilterStatus).map((option) => ({
    label: t(`admin:components.moderation.${option}`),
    value: option
  }))

export default function ModerationTable({ search }) {
  const { t } = useTranslation()
  const [statusFilter, setStatusFilter] = useState(ModerationFilterStatus.All)
  const [selectedReport, setSelectedReport] = useState<ModerationType>()

  const handleViewDetails = (report) => {
    setSelectedReport(report)
  }
  const handleBackToTable = () => {
    setSelectedReport(undefined)
  }
  const handleReportResolve = (report: ModerationType) => {
    setSelectedReport(userReportsQuery.data[userReportsQuery.data.findIndex((r) => r.id === report.id) + 1])
  }

  const userReportsQuery =
    statusFilter == ModerationFilterStatus.All
      ? useFind(moderationPath, {
          query: {
            $limit: 12,
            $sort: {
              referenceNumber: -1
            }
          }
        })
      : useFind(moderationPath, {
          query: {
            status: statusFilter,
            $limit: 12
          }
        })

  useSearch(
    userReportsQuery,
    {
      search
    },
    search
  )

  const createRows = (rows: ModerationType[]) =>
    rows.map((moderation) => {
      return {
        id: moderation.referenceNumber,
        type: (
          <span>
            {moderation.type == 'location'
              ? t('admin:components.moderation.space')
              : t('admin:components.moderation.user')}
          </span>
        ),
        username: (
          <span>{moderation.reportedUserId ? <UserDisplayName userId={moderation.reportedUserId} /> : 'N/A'}</span>
        ),
        reason: <span>{t(`user:moderation.abuseReason.${moderation.abuseReason}`)}</span>,
        dateReported: <span>{toDisplayDateTime(moderation.createdAt)}</span>,
        status: (
          <Text
            className={`rounded px-2 text-text-primary ${
              moderation.status === 'open' ? 'bg-[#10b981] ' : 'bg-[#2f3137] '
            }`}
          >
            {moderation.status === 'open'
              ? t('admin:components.moderation.open')
              : t('admin:components.moderation.resolved')}
          </Text>
        ),
        action: (
          <button
            onClick={() => handleViewDetails(moderation)}
            className="flex cursor-pointer items-center border-none bg-transparent px-0 py-0 text-blue-500"
          >
            {t('admin:components.moderation.viewDetails')} <IoArrowForward className="ml-2" />
          </button>
        )
      }
    })
  const statusFilterOptions = useMemo(() => getStatusFilterOptions(t), [t])

  return (
    <div className="h-full w-full">
      {selectedReport ? (
        <ModerationDetail report={selectedReport} onBack={handleBackToTable} onResloved={handleReportResolve} />
      ) : (
        <>
          <div className="w-50 mb-4 mt-5 flex items-center space-x-2">
            <Select
              labelProps={{ text: t('admin:components.moderation.statusFilter'), position: 'left' }}
              options={statusFilterOptions}
              value={statusFilter}
              onChange={(selected) => setStatusFilter(selected as ModerationFilterStatus)}
            />
          </div>
          <DataTable
            query={userReportsQuery}
            columns={moderationTableColumns}
            rows={createRows([...userReportsQuery.data])}
          />
        </>
      )}
    </div>
  )
}
