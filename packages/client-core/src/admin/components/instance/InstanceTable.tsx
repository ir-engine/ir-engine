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
import { HiEye, HiTrash } from 'react-icons/hi2'

import { useFind, useMutation, useSearch } from '@ir-engine/common'
import { instancePath, InstanceType } from '@ir-engine/common/src/schema.type.module'
import ConfirmDialog from '@ir-engine/ui/src/components/tailwind/ConfirmDialog'
import Button from '@ir-engine/ui/src/primitives/tailwind/Button'

import { PopoverState } from '../../../common/services/PopoverState'
import { instanceColumns } from '../../common/constants/instance'
import DataTable from '../../common/Table'
import ViewModal from './ViewModal'

export default function InstanceTable({ search }: { search: string }) {
  const { t } = useTranslation()
  const instancesQuery = useFind(instancePath, {
    query: {
      $sort: { ended: 1 },
      $limit: 20,
      action: 'admin'
    }
  })

  useSearch(
    instancesQuery,
    {
      search
    },
    search
  )

  const removeInstance = useMutation(instancePath).remove

  const createRows = (rows: readonly InstanceType[]) =>
    rows.map((row) => ({
      id: row.id,
      ipAddress: row.ipAddress,
      currentUsers: row.currentUsers,
      ended: row.ended ? t('admin:components.instance.ended') : t('admin:components.instance.active'),
      locationName: row.location && row.location.name ? row.location.name : '',
      channelId: row.channelId,
      podName: row.podName,
      action: (
        <div className="flex items-center justify-start gap-3 px-2 py-1">
          <Button
            className="bg-theme-blue-secondary text-blue-700 dark:text-white"
            onClick={() => {
              PopoverState.showPopupover(<ViewModal instanceId={row.id} />)
            }}
            startIcon={<HiEye className="place-self-center text-blue-700 dark:text-white" />}
            size="small"
          >
            {t('admin:components.instance.actions.view')}
          </Button>
          <Button
            className="h-8 w-8 justify-center border border-theme-primary bg-transparent p-0"
            rounded="full"
            onClick={() => {
              PopoverState.showPopupover(
                <ConfirmDialog
                  text={`${t('admin:components.instance.confirmInstanceDelete')} (${row.id}) ?`}
                  onSubmit={async () => {
                    await removeInstance(row.id)
                  }}
                />
              )
            }}
          >
            <HiTrash className="place-self-center text-theme-iconRed" />
          </Button>
        </div>
      )
    }))

  return <DataTable query={instancesQuery} columns={instanceColumns} rows={createRows(instancesQuery.data)} />
}
