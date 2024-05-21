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

import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { HiPencil, HiTrash } from 'react-icons/hi2'

import { PopoverState } from '@etherealengine/client-core/src/common/services/PopoverState'
import { AvatarID, avatarPath, AvatarType, UserName } from '@etherealengine/common/src/schema.type.module'
import { useHookstate } from '@etherealengine/hyperflux'
import { useFind, useMutation, useSearch } from '@etherealengine/spatial/src/common/functions/FeathersHooks'
import { ConfirmDialog } from '@etherealengine/ui/src/components/tailwind/ConfirmDialog'
import AvatarImage from '@etherealengine/ui/src/primitives/tailwind/AvatarImage'
import Button from '@etherealengine/ui/src/primitives/tailwind/Button'
import Toggle from '@etherealengine/ui/src/primitives/tailwind/Toggle'

import { avatarColumns, AvatarRowType } from '../../common/constants/avatar'
import DataTable from '../../common/Table'
import AddEditAvatarModal from './AddEditAvatarModal'

export default function AvatarTable({ search }: { search: string }) {
  const { t } = useTranslation()
  const adminAvatarQuery = useFind(avatarPath, {
    query: {
      action: 'admin',
      $limit: 20,
      $sort: {
        name: 1
      }
    }
  })
  const adminAvatarPatch = useMutation(avatarPath).patch

  useSearch(
    adminAvatarQuery,
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

  const IsPublicToggle = ({ id, isPublic }: { id: AvatarID; isPublic: boolean }) => {
    const disabled = useHookstate(false)
    return (
      <Toggle
        value={isPublic}
        onChange={(value) => {
          disabled.set(true)
          adminAvatarPatch(id, { isPublic: value })
            .then(() => adminAvatarQuery.refetch())
            .catch(() => disabled.set(false))
        }}
        disabled={disabled.value}
      />
    )
  }

  const adminAvatarRemove = useMutation(avatarPath).remove
  const errorText = useHookstate('')

  useEffect(() => {
    setTimeout(() => {
      errorText.set('I AM ERROR')
    }, 5000)
  }, [])

  const createRows = (rows: readonly AvatarType[]): AvatarRowType[] =>
    rows.map((row) => ({
      id: row.id,
      name: row.name,
      user: (row.user?.name || '') as UserName,
      isPublic: <IsPublicToggle id={row.id} isPublic={row.isPublic} />,
      thumbnail: <AvatarImage src={row.thumbnailResource?.url + '?' + new Date().getTime()} className="mx-auto" />,
      action: (
        <div className="flex items-center justify-start gap-3">
          <Button
            rounded="full"
            variant="outline"
            className="h-8 w-8"
            title={t('admin:components.common.view')}
            onClick={() => PopoverState.showPopupover(<AddEditAvatarModal avatar={row} />)}
          >
            <HiPencil className="text-theme-iconGreen place-self-center" />
          </Button>
          <Button
            rounded="full"
            variant="outline"
            className="h-8 w-8"
            title={t('admin:components.common.delete')}
            onClick={() => {
              PopoverState.showPopupover(
                <ConfirmDialog
                  text={`${t('admin:components.avatar.confirmAvatarDelete')} '${row.name}'?`}
                  onSubmit={async () => {
                    await adminAvatarRemove(row.id)
                  }}
                />
              )
            }}
          >
            <HiTrash className="text-theme-iconRed place-self-center" />
          </Button>
        </div>
      )
    }))

  return <DataTable query={adminAvatarQuery} columns={avatarColumns} rows={createRows(adminAvatarQuery.data)} />
}
