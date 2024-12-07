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
import { HiEye } from 'react-icons/hi2'

import { useFind } from '@ir-engine/common'
import { buildStatusPath, BuildStatusType } from '@ir-engine/common/src/schema.type.module'

import { Button } from '@ir-engine/ui'
import TruncatedText from '@ir-engine/ui/src/primitives/tailwind/TruncatedText'
import { PopoverState } from '../../../../common/services/PopoverState'
import { buildStatusColumns, BuildStatusRowType } from '../../../common/constants/build-status'
import DataTable from '../../../common/Table'
import BuildStatusLogsModal, { BuildStatusBadge, getStartOrEndDate } from './BuildStatusLogsModal'

export default function BuildStatusTable() {
  const { t } = useTranslation()

  const adminBuildStatusQuery = useFind(buildStatusPath, {
    query: {
      $limit: 10,
      $sort: {
        id: -1
      }
    }
  })

  const createRows = (rows: readonly BuildStatusType[]): BuildStatusRowType[] =>
    rows.map((row) => ({
      id: row.id.toString(),
      commitSHA: (
        <TruncatedText
          variant="copy"
          text={row.commitSHA || ''}
          truncatorChar=""
          visibleChars={8}
          truncatorPosition="end"
        />
      ),
      status: <BuildStatusBadge status={row.status} />,
      dateStarted: getStartOrEndDate(row.dateStarted),
      dateEnded: getStartOrEndDate(row.dateEnded, true),
      logs: (
        <Button
          size="sm"
          disabled={!row.logs || !row.logs.length}
          onClick={() => {
            PopoverState.showPopupover(<BuildStatusLogsModal buildStatus={row} />)
          }}
        >
          <HiEye />
          {t('admin:components.buildStatus.viewLogs')}
        </Button>
      )
    }))

  return (
    <DataTable
      query={adminBuildStatusQuery}
      columns={buildStatusColumns}
      rows={createRows(adminBuildStatusQuery.data)}
    />
  )
}
