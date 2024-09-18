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

import { Id, NullableId } from '@feathersjs/feathers'
import { useFind, useMutation, useSearch } from '@ir-engine/common'
import { UserType, userPath } from '@ir-engine/common/src/schema.type.module'
import { toDisplayDateTime } from '@ir-engine/common/src/utils/datetime-sql'
import { State, getMutableState, useHookstate } from '@ir-engine/hyperflux'
import ConfirmDialog from '@ir-engine/ui/src/components/tailwind/ConfirmDialog'
import AvatarImage from '@ir-engine/ui/src/primitives/tailwind/AvatarImage'
import Button from '@ir-engine/ui/src/primitives/tailwind/Button'
import Checkbox from '@ir-engine/ui/src/primitives/tailwind/Checkbox'
import Tooltip from '@ir-engine/ui/src/primitives/tailwind/Tooltip'
import { truncateText } from '@ir-engine/ui/src/primitives/tailwind/TruncatedLink'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { FaRegCircleCheck, FaRegCircleXmark } from 'react-icons/fa6'
import { HiPencil, HiTrash } from 'react-icons/hi2'
import { LuInfo } from 'react-icons/lu'
import { PopoverState } from '../../../common/services/PopoverState'
import { AuthState } from '../../../user/services/AuthService'
import { userHasAccess } from '../../../user/userHasAccess'
import DataTable from '../../common/Table'
import { UserRowType, userColumns } from '../../common/constants/user'
import AccountIdentifiers from './AccountIdentifiers'
import AddEditUserModal from './AddEditUserModal'

export const removeUsers = async (
  modalProcessing: State<boolean>,
  adminUserRemove: {
    (id: Id): Promise<UserType>
    (id: null): Promise<UserType[]>
    (id: NullableId): Promise<any>
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
      search
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
        name: truncateText(row.name, { visibleChars: 14, ellipsisPosition: 'end' }),
        avatar: <AvatarImage src={row?.avatar?.thumbnailResource?.url || ''} name={row.name} />,
        accountIdentifier: <AccountIdentifiers user={row} />,
        lastLogin: row.lastLogin && (
          <div className="flex">
            {toDisplayDateTime(row.lastLogin.createdAt)}
            <Tooltip
              content={
                <>
                  <span>IP Address: {row.lastLogin.ipAddress}</span>
                  <br />
                  <span>User Agent: {row.lastLogin.userAgent}</span>
                </>
              }
            >
              <LuInfo className="ml-2 h-5 w-5 bg-transparent" />
            </Tooltip>
          </div>
        ),
        acceptedTOS: row.acceptedTOS ? (
          <FaRegCircleCheck className="h-5 w-5 text-theme-iconGreen" />
        ) : (
          <FaRegCircleXmark className="h-5 w-5 text-theme-iconRed" />
        ),
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
              startIcon={<HiPencil className="place-self-center text-theme-iconGreen" />}
            />
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
              startIcon={<HiTrash className="place-self-center text-theme-iconRed" />}
            />
          </div>
        )
      }
    })

  return (
    <DataTable
      className="h-[calc(100vh_-_386px)]"
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
