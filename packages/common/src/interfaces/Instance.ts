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

import { LocationData, LocationType } from '@etherealengine/engine/src/schemas/social/location.schema'

// import { LocationAuthorizedUser } from './LocationAuthorizedUser'

// interface LocationSettings {
//   id: string
//   locationId: string
//   locationType: 'private' | 'public' | 'showroom'
//   audioEnabled: boolean
//   screenSharingEnabled: boolean
//   faceStreamingEnabled: boolean
//   videoEnabled: boolean
// }

// interface Location {
//   id: string
//   name: string
//   slugifiedName: string
//   maxUsersPerInstance: number
//   sceneId: string
//   locationSettingsId: string
//   locationSetting: LocationSettings
//   isLobby: boolean
//   isFeatured: boolean
//   location_settings?: LocationSettings
//   location_setting?: LocationSettings
//   location_authorized_users?: LocationAuthorizedUser[]
// }

export interface Instance {
  id: string
  roomCode: string
  currentUsers: number
  ipAddress: string
  locationId: string
  location: LocationData | LocationType
  channelId: string
  podName?: string
  ended?: boolean
  assigned?: boolean
  assignedAt?: Date
  instanceserver_subdomain_provision?: InstanceServerSubdomainProvision
}

export const InstanceSeed: Instance = {
  id: '',
  roomCode: '',
  ipAddress: '',
  currentUsers: 0,
  location: {
    name: '',
    slugifiedName: '',
    maxUsersPerInstance: 10,
    sceneId: '',
    locationAuthorizedUsers: {
      id: '',
      locationId: '',
      userId: ''
    },
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
  channelId: ''
}

export interface InstanceServerSubdomainProvision {
  id: number
  is_id: string
  is_number: string
  allocated: boolean
}

export interface InstanceServerPatch {
  status: boolean
  message: string
}
