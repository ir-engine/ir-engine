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
import { HiPencil, HiTrash } from 'react-icons/hi2'

import { PopoverState } from '@ir-engine/client-core/src/common/services/PopoverState'
import { useFind, useMutation, useSearch } from '@ir-engine/common'
import { channelPath, ChannelType } from '@ir-engine/common/src/schema.type.module'
import { State } from '@ir-engine/hyperflux'
import { Checkbox } from '@ir-engine/ui'
import ConfirmDialog from '@ir-engine/ui/src/components/tailwind/ConfirmDialog'
import Button from '@ir-engine/ui/src/primitives/tailwind/Button'
import { validate as isValidUUID } from 'uuid'

import { channelColumns, ChannelRowType } from '../../common/constants/channel'
import DataTable from '../../common/Table'
import AddEditChannelModal from './AddEditChannelModal'

export default function ChannelTable({
  search,
  selectedChannels
}: {
  search: string
  selectedChannels: State<ChannelType[]>
}) {
  const { t } = useTranslation()

  const adminChannelsQuery = useFind(channelPath, {
    query: {
      action: 'admin',
      $limit: 20,
      $sort: {
        name: 1
      }
    }
  })
  const adminChannelRemove = useMutation(channelPath).remove

  useSearch(
    adminChannelsQuery,
    {
      $or: [
        {
          id: isValidUUID(search) ? search : undefined
        },
        {
          name: {
            $like: `%${search}%`
          }
        }
      ]
    },
    search
  )

  const createRows = (rows: readonly ChannelType[]): ChannelRowType[] =>
    rows.map((row) => ({
      select: (
        <Checkbox
          checked={selectedChannels.value.findIndex((invite) => invite.id === row.id) !== -1}
          onChange={(value) => {
            if (value) selectedChannels.merge([row])
            else selectedChannels.set((prevInvites) => prevInvites.filter((invite) => invite.id !== row.id))
          }}
        />
      ),
      id: row.id,
      name: row.name,
      action: (
        <div className="flex items-center justify-start gap-3">
          <Button
            rounded="full"
            variant="outline"
            className="h-8 w-8"
            title={t('admin:components.common.view')}
            onClick={() => PopoverState.showPopupover(<AddEditChannelModal channel={row} />)}
            startIcon={<HiPencil className="place-self-center text-theme-iconGreen" />}
          />
          <Button
            rounded="full"
            variant="outline"
            className="h-8 w-8"
            title={t('admin:components.common.delete')}
            onClick={() =>
              PopoverState.showPopupover(
                <ConfirmDialog
                  text={`${t('admin:components.channel.confirmChannelDelete')} '${row.name}'?`}
                  onSubmit={async () => {
                    adminChannelRemove(row.id)
                  }}
                />
              )
            }
            startIcon={<HiTrash className="place-self-center text-theme-iconRed" />}
          />
        </div>
      )
    }))

  return (
    <DataTable
      size="xl"
      query={adminChannelsQuery}
      columns={[
        {
          id: 'select',
          label: (
            <Checkbox
              checked={selectedChannels.length === adminChannelsQuery.data.length}
              onChange={(value) => {
                if (value) selectedChannels.set(adminChannelsQuery.data.slice())
                else selectedChannels.set([])
              }}
            />
          )
        },
        ...channelColumns
      ]}
      rows={createRows(adminChannelsQuery.data)}
    />
  )
}
