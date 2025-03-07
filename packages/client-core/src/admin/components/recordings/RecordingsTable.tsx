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
import { HiTrash } from 'react-icons/hi2'

import { useFind, useMutation, useSearch } from '@ir-engine/common'
import { RecordingType, recordingPath } from '@ir-engine/common/src/schema.type.module'
import ConfirmDialog from '@ir-engine/ui/src/components/tailwind/ConfirmDialog'
import { validate as isValidUUID } from 'uuid'

import { Button } from '@ir-engine/ui'
import { PopoverState } from '../../../common/services/PopoverState'
import DataTable from '../../common/Table'
import { recordingColumns } from '../../common/constants/recordings'

export default function RecordingsTable({ search }: { search: string }) {
  const { t } = useTranslation()
  const recordingsQuery = useFind(recordingPath, {
    query: {
      $sort: { createdAt: 1 },
      $limit: 20,
      action: 'admin'
    }
  })

  useSearch(
    recordingsQuery,
    {
      $or: [
        {
          id: isValidUUID(search) ? search : undefined
        },
        {
          userId: isValidUUID(search) ? search : undefined
        }
      ]
    },
    search
  )

  const removeRecording = useMutation(recordingPath).remove

  const createRows = (rows: readonly RecordingType[]) =>
    rows.map((row) => ({
      id: row.id,
      user: row.userName,
      ended: row.ended ? t('admin:components.common.yes') : t('admin:components.common.no'),
      schema: JSON.stringify(row.schema),
      action: (
        <div className="flex w-full justify-center px-2 py-1">
          {/* <Button className="border-theme-primary h-8 w-8 justify-center border bg-transparent p-0" rounded>
            <HiEye className="place-self-center" />
          </Button> */}
          <Button
            className="h-8 w-8 justify-center border border-theme-primary bg-transparent p-0"
            onClick={() => {
              PopoverState.showPopupover(
                <ConfirmDialog
                  text={`${t('admin:components.recording.confirmRecordingDelete')} (${row.id}) ?`}
                  onSubmit={async () => {
                    await removeRecording(row.id)
                  }}
                />
              )
            }}
          >
            <HiTrash className="place-self-center text-[#E11D48] dark:text-[#FB7185]" />
          </Button>
        </div>
      )
    }))

  return (
    <DataTable size="xl" query={recordingsQuery} columns={recordingColumns} rows={createRows(recordingsQuery.data)} />
  )
}
