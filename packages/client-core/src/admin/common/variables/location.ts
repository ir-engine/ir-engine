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

import { InstanceID } from '@etherealengine/engine/src/schemas/networking/instance.schema'
import { InviteCode } from '@etherealengine/engine/src/schemas/user/user.schema'

export interface LocationColumn {
  id: 'sceneId' | 'maxUsersPerInstance' | 'scene' | 'name' | 'locationType' | 'tags' | 'videoEnabled' | 'action'
  label: string
  minWidth?: number
  align?: 'right' | 'center'
}

export const locationColumns: LocationColumn[] = [
  {
    id: 'name',
    label: 'Name',
    minWidth: 65
  },
  { id: 'sceneId', label: 'Scene', minWidth: 65 },
  {
    id: 'maxUsersPerInstance',
    label: 'Max Users Per Instance',
    minWidth: 80,
    align: 'center'
  },
  {
    id: 'locationType',
    label: 'Type',
    minWidth: 65,
    align: 'right'
  },
  {
    id: 'tags',
    label: 'Tags',
    minWidth: 65,
    align: 'center'
  },
  {
    id: 'videoEnabled',
    label: 'Video Enabled',
    minWidth: 65,
    align: 'center'
  },
  {
    id: 'action',
    label: 'Action',
    minWidth: 65,
    align: 'right'
  }
]

export interface LocationData {
  id: string
  user: any
  name: string
  avatar: string
  status: string
  location: string
  inviteCode: InviteCode
  instanceId: InstanceID
  action: any
}
