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

import { apiJobPath, ApiJobType } from '@ir-engine/common/src/schema.type.module'
import { useFind } from '@ir-engine/spatial/src/common/functions/FeathersHooks'

import { toDisplayDateTime } from '@ir-engine/common/src/utils/datetime-sql'
import Badge from '@ir-engine/ui/src/primitives/tailwind/Badge'
import { apiJobColumns } from '../../common/constants/api-job'
import DataTable from '../../common/Table'

function ApiJobStatus({ apiJob }: { apiJob: ApiJobType }) {
  const { t } = useTranslation()

  return (
    <div className="flex items-center justify-between gap-3">
      {apiJob.status === 'succeeded' && (
        <Badge className="rounded" variant="success" label={t('admin:components.server.serverStatus.succeeded')} />
      )}
      {apiJob.status === 'pending' && (
        <Badge className="rounded" variant="warning" label={t('admin:components.server.serverStatus.pending')} />
      )}
      {apiJob.status === 'failed' && (
        <Badge className="rounded" variant="danger" label={t('admin:components.server.serverStatus.failed')} />
      )}
    </div>
  )
}

export default function ApiJobsTable() {
  const { t } = useTranslation()

  const adminApiJobsQuery = useFind(apiJobPath, {
    query: {
      $limit: 100,
      $sort: {
        startTime: -1
      }
    }
  })

  const createRows = (rows): ApiJobType[] =>
    rows.map((row) => ({
      id: row.id.toString(),
      name: row.name,
      status: <ApiJobStatus apiJob={row} />,
      startTime: toDisplayDateTime(row.startTime),
      endTime: toDisplayDateTime(row.endTime),
      returnData: row.returnData
    }))

  return <DataTable query={adminApiJobsQuery} columns={apiJobColumns} rows={createRows(adminApiJobsQuery.data)} />
}
