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

import { InstanceType } from '@etherealengine/common/src/schema.type.module'

export interface InstanceColumn {
  id: 'id' | 'ipAddress' | 'currentUsers' | 'locationName' | 'channelId' | 'podName' | 'action'
  label: string
  minWidth?: number
  align?: 'right'
}

export const instanceColumns: InstanceColumn[] = [
  { id: 'id', label: 'Instance ID', minWidth: 65 },
  { id: 'ipAddress', label: 'IP Address', minWidth: 65 },
  { id: 'currentUsers', label: 'Current Users', minWidth: 65 },
  {
    id: 'locationName',
    label: 'Location',
    minWidth: 65,
    align: 'right'
  },
  {
    id: 'channelId',
    label: 'Channel',
    minWidth: 65,
    align: 'right'
  },
  {
    id: 'podName',
    label: 'Pod Name',
    minWidth: 200,
    align: 'right'
  },
  {
    id: 'action',
    label: 'Action',
    minWidth: 65,
    align: 'right'
  }
]

export interface InstanceData {
  el: InstanceType
  id: string
  ipAddress: string
  currentUsers: number
  locationName: string
  channelId: string
  podName: string
  action: any
}

export interface InstanceUsersColumn {
  id: 'id' | 'name' | 'action'
  label: string
  minWidth?: number
  align?: 'right'
}

export const instanceUsersColumns: InstanceUsersColumn[] = [
  { id: 'id', label: 'User ID' },
  { id: 'name', label: 'User Name' },
  { id: 'action', label: 'Action' }
]
