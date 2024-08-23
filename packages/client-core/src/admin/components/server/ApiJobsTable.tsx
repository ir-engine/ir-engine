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
import { apiJobColumns } from '../../common/constants/api-job'
import DataTable from '../../common/Table'

export default function ApiJobsTable() {
  const { t } = useTranslation()

  const adminApiJobsQuery = useFind(apiJobPath, {
    query: {
      $limit: 100,
      $sort: {
        id: -1
      }
    }
  })

  const createRows = (rows): ApiJobType[] =>
    rows.map((row) => ({
      id: row.id.toString(),
      name: row.name,
      status: row.status,
      start_time: toDisplayDateTime(row.start_time),
      end_time: toDisplayDateTime(row.end_time),
      return_data: row.return_data
    }))

  return <DataTable query={adminApiJobsQuery} columns={apiJobColumns} rows={createRows(adminApiJobsQuery.data)} />
}
