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

import { avatarPath } from '@etherealengine/common/src/schema.type.module'
import { useFind } from '@etherealengine/spatial/src/common/functions/FeathersHooks'
import LoadingCircle from '@etherealengine/ui/src/primitives/tailwind/LoadingCircle'
import Table, {
  TableBody,
  TableCell,
  TableHeadRow,
  TableHeaderCell,
  TableRow
} from '@etherealengine/ui/src/primitives/tailwind/Table'
import React from 'react'

export default function Avatars() {
  const adminAvatarQuery = useFind(avatarPath, {
    query: {
      action: 'admin',
      $limit: 20,
      $sort: {
        name: 1
      }
    }
  })

  return adminAvatarQuery.status !== 'success' ? (
    <div className="flex h-96 w-full items-center justify-center">
      <LoadingCircle className="flex w-1/4 items-center justify-center" />
    </div>
  ) : (
    <Table>
      <TableHeadRow>
        <TableHeaderCell>id</TableHeaderCell>
        <TableHeaderCell>Name</TableHeaderCell>
        <TableHeaderCell>Owner</TableHeaderCell>
        <TableHeaderCell>Public</TableHeaderCell>
        <TableHeaderCell>Thumbnail</TableHeaderCell>
        <TableHeaderCell>Actions</TableHeaderCell>
      </TableHeadRow>
      <TableBody>
        {adminAvatarQuery.data.map((row) => (
          <TableRow key={row.id}>
            <TableCell>{row.id}</TableCell>
            <TableCell>{row.name}</TableCell>
            <TableCell>{row.user?.name || ''}</TableCell>
            <TableCell>{row.isPublic ? 'yes' : 'no'}</TableCell>
            <TableCell>
              <img
                style={{ maxHeight: '50px' }}
                crossOrigin="anonymous"
                src={row.thumbnailResource?.url + '?' + new Date().getTime()}
                alt=""
              />
            </TableCell>
            <TableCell>View | Delete</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
