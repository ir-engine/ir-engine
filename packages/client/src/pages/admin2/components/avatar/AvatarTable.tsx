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

import { AvatarType, avatarPath } from '@etherealengine/common/src/schema.type.module'

import { UserName } from '@etherealengine/common/src/schema.type.module'
import { useFind, useSearch } from '@etherealengine/spatial/src/common/functions/FeathersHooks'
import AvatarImage from '@etherealengine/ui/src/primitives/tailwind/AvatarImage'
import DataTable from '../../common/Table'
import { AvatarRowType, avatarColumns } from '../../common/constants/avatar'

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

  useSearch(
    adminAvatarQuery,
    {
      name: {
        $like: `%${search}%`
      }
    },
    search
  )

  const createRows = (rows: readonly AvatarType[]): AvatarRowType[] =>
    rows.map((row) => ({
      select: <>todo</>,
      id: row.id,
      name: row.name,
      user: (row.user?.name || '') as UserName,
      isPublic: row.isPublic ? t('admin:components.common.yes') : t('admin:components.common.no'),
      thumbnail: <AvatarImage src={row.thumbnailResource?.url + '?' + new Date().getTime()} />,
      action: ''
    }))

  return <DataTable query={adminAvatarQuery} columns={avatarColumns} rows={createRows(adminAvatarQuery.data)} />
}
