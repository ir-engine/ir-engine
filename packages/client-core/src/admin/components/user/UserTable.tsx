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

import { Id, NullableId } from '@feathersjs/feathers'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { HiPencil, HiTrash } from 'react-icons/hi2'

import { userPath, UserType } from '@etherealengine/common/src/schema.type.module'
import { getMutableState, State, useHookstate } from '@etherealengine/hyperflux'
import { UserParams } from '@etherealengine/server-core/src/user/user/user.class'
import { useFind, useMutation, useSearch } from '@etherealengine/spatial/src/common/functions/FeathersHooks'
import ConfirmDialog from '@etherealengine/ui/src/components/tailwind/ConfirmDialog'
import AvatarImage from '@etherealengine/ui/src/primitives/tailwind/AvatarImage'
import Button from '@etherealengine/ui/src/primitives/tailwind/Button'
import Checkbox from '@etherealengine/ui/src/primitives/tailwind/Checkbox'

import { toDisplayDateTime } from '@etherealengine/common/src/utils/datetime-sql'
import { PopoverState } from '../../../common/services/PopoverState'
import { AuthState } from '../../../user/services/AuthService'
import { userHasAccess } from '../../../user/userHasAccess'
import { userColumns, UserRowType } from '../../common/constants/user'
import DataTable from '../../common/Table'
import AccountIdentifiers from './AccountIdentifiers'
import AddEditUserModal from './AddEditUserModal'

export const removeUsers = async (
  modalProcessing: State<boolean>,
  adminUserRemove: {
    (id: Id, params?: UserParams | undefined): Promise<UserType>
    (id: null, params?: UserParams | undefined): Promise<UserType[]>
    (id: NullableId, params?: UserParams | undefined): Promise<any>
  },
  users: UserType[]
) => {
  modalProcessing.set(true)
  await Promise.all(
    users.map((user) => {
      adminUserRemove(user.id)
    })
  )
  PopoverState.hidePopupover()
  modalProcessing.set(false)
}

export default function UserTable({
  search,
  skipGuests,
  selectedUsers
}: {
  skipGuests: boolean
  search: string
  selectedUsers: State<UserType[]>
}) {
  const { t } = useTranslation()
  const user = useHookstate(getMutableState(AuthState).user)

  const adminUserQuery = useFind(userPath, {
    query: {
      isGuest: skipGuests ? false : undefined,
      $skip: 0,
      $limit: 20,
      $sort: {
        name: 1
      }
    }
  })

  useSearch(
    adminUserQuery,
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

  const adminUserRemove = useMutation(userPath).remove
  const modalProcessing = useHookstate(false)

  const createRows = (rows: readonly UserType[]): UserRowType[] =>
    rows.map((row) => {
      return {
        select: (
          <Checkbox
            value={selectedUsers.value.findIndex((invite) => invite.id === row.id) !== -1}
            onChange={(value) => {
              if (value) selectedUsers.merge([row])
              else selectedUsers.set((prevInvites) => prevInvites.filter((invite) => invite.id !== row.id))
            }}
          />
        ),
        id: row.id,
        name: row.name,
        avatar: <AvatarImage src={row?.avatar?.thumbnailResource?.url || ''} name={row.name} />,
        accountIdentifier: <AccountIdentifiers user={row} />,
        lastLogin: toDisplayDateTime(row.lastLogin),
        isGuest: row.isGuest.toString(),
        action: (
          <div className="flex items-center justify-start gap-3">
            <Button
              rounded="full"
              variant="outline"
              className="h-8 w-8"
              disabled={!userHasAccess('location:write')}
              title={t('admin:components.common.view')}
              onClick={() => PopoverState.showPopupover(<AddEditUserModal user={row} />)}
            >
              <HiPencil className="text-theme-iconGreen place-self-center" />
            </Button>
            <Button
              rounded="full"
              variant="outline"
              className="h-8 w-8"
              disabled={user.id.value === row.id}
              title={t('admin:components.common.delete')}
              onClick={() => {
                PopoverState.showPopupover(
                  <ConfirmDialog
                    text={`${t('admin:components.user.confirmUserDelete')} '${row.name}'?`}
                    onSubmit={async () => {
                      await removeUsers(modalProcessing, adminUserRemove, [row])
                    }}
                  />
                )
              }}
            >
              <HiTrash className="text-theme-iconRed place-self-center" />
            </Button>
          </div>
        )
      }
    })

  return (
    <DataTable
      query={adminUserQuery}
      columns={[
        {
          id: 'select',
          label: (
            <Checkbox
              value={selectedUsers.length === adminUserQuery.data.length}
              onChange={(value) => {
                if (value) selectedUsers.set(adminUserQuery.data.slice())
                else selectedUsers.set([])
              }}
            />
          )
        },
        ...userColumns
      ]}
      rows={createRows(adminUserQuery.data)}
    />
  )
}
