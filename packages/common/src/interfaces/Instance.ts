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
import { ChannelID } from '@etherealengine/engine/src/schemas/social/channel.schema'
import { LocationData, LocationType } from '@etherealengine/engine/src/schemas/social/location.schema'
import { UserID } from '@etherealengine/engine/src/schemas/user/user.schema'

export interface Instance {
  id: InstanceID
  roomCode: string
  currentUsers: number
  ipAddress: string
  // World servers have locationIds
  locationId?: string
  location: LocationData | LocationType
  // Media serves have channelIds
  channelId?: ChannelID
  podName?: string
  ended?: boolean
  assigned?: boolean
  assignedAt?: Date
}

export const InstanceSeed: Instance = {
  id: '' as InstanceID,
  roomCode: '',
  ipAddress: '',
  currentUsers: 0,
  location: {
    name: '',
    slugifiedName: '',
    maxUsersPerInstance: 10,
    sceneId: '',
    locationAuthorizedUsers: [
      {
        id: '',
        locationId: '',
        userId: '' as UserID,
        createdAt: '',
        updatedAt: ''
      }
    ],
    locationSetting: {
      id: '',
      locationId: '',
      locationType: 'public',
      audioEnabled: false,
      screenSharingEnabled: false,
      faceStreamingEnabled: false,
      videoEnabled: false,
      createdAt: '',
      updatedAt: ''
    },
    isLobby: false,
    isFeatured: false
  },
  podName: '',
  locationId: '',
  channelId: '' as ChannelID
}

export interface InstanceServerPatch {
  status: boolean
  message: string
}
