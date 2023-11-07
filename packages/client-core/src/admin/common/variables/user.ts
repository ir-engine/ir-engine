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

import { AvatarID } from '@etherealengine/engine/src/schemas/user/avatar.schema'
import { UserID, UserName } from '@etherealengine/engine/src/schemas/user/user.schema'

export interface UserColumn {
  id: 'id' | 'name' | 'avatarId' | 'accountIdentifier' | 'isGuest' | 'location' | 'inviteCode' | 'instanceId' | 'action'
  label: string
  minWidth?: number
  align?: 'right'
}

export const userColumns: UserColumn[] = [
  { id: 'id', label: 'User Id', minWidth: 65 },
  { id: 'name', label: 'Name', minWidth: 65 },
  { id: 'avatarId', label: 'Avatar', minWidth: 65 },
  { id: 'accountIdentifier', label: 'Linked Accounts', minWidth: 65 },
  {
    id: 'isGuest',
    label: 'Is Guest',
    minWidth: 65,
    align: 'right'
  },
  /** @todo replace this with a list of locations */
  // {
  //   id: 'location',
  //   label: 'Location',
  //   minWidth: 65,
  //   align: 'right'
  // },
  {
    id: 'inviteCode',
    label: 'Invite code',
    minWidth: 65,
    align: 'right'
  },
  // {
  //   id: 'instanceId',
  //   label: 'Instance',
  //   minWidth: 65,
  //   align: 'right'
  // },
  {
    id: 'action',
    label: 'Action',
    minWidth: 65,
    align: 'right'
  }
]

export interface UserData {
  id: UserID
  el: any
  name: UserName
  avatarId: AvatarID | JSX.Element
  accountIdentifier: string | JSX.Element
  isGuest: string
  inviteCode: string | JSX.Element
  action: any
}
export interface UserProps {
  className?: string
  removeUserAdmin?: any
  authState?: any
  adminUserState?: any
  fetchUsersAsAdmin?: any
  search: string
}

export interface UserTabPanelProps {
  children?: React.ReactNode
  index: any
  value: any
}
