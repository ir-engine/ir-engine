/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import React from 'react'
import { useTranslation } from 'react-i18next'
import { HiPencil, HiTrash } from 'react-icons/hi2'

import { PopoverState } from '@etherealengine/client-core/src/common/services/PopoverState'
import { channelPath, ChannelType } from '@etherealengine/common/src/schema.type.module'
import { State } from '@etherealengine/hyperflux'
import { useFind, useMutation, useSearch } from '@etherealengine/spatial/src/common/functions/FeathersHooks'
import ConfirmDialog from '@etherealengine/ui/src/components/tailwind/ConfirmDialog'
import Button from '@etherealengine/ui/src/primitives/tailwind/Button'
import Checkbox from '@etherealengine/ui/src/primitives/tailwind/Checkbox'

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
          id: {
            $like: `%${search}%`
          }
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
          value={selectedChannels.value.findIndex((invite) => invite.id === row.id) !== -1}
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
          >
            <HiPencil className="text-theme-iconGreen place-self-center" />
          </Button>
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
          >
            <HiTrash className="text-theme-iconRed place-self-center" />
          </Button>
        </div>
      )
    }))

  return (
    <DataTable
      query={adminChannelsQuery}
      columns={[
        {
          id: 'select',
          label: (
            <Checkbox
              value={selectedChannels.length === adminChannelsQuery.data.length}
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
