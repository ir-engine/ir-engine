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

import { Paginated } from '@feathersjs/feathers'

import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { LocationID, locationPath, LocationType } from '@etherealengine/engine/src/schemas/social/location.schema'
import { defineState, getMutableState } from '@etherealengine/hyperflux'

import { SceneID } from '@etherealengine/engine/src/schemas/projects/scene.schema'
import { locationBanPath } from '@etherealengine/engine/src/schemas/social/location-ban.schema'
import { UserID } from '@etherealengine/engine/src/schemas/user/user.schema'
import { API } from '../../API'
import { NotificationService } from '../../common/services/NotificationService'

export const LocationSeed: LocationType = {
  id: '' as LocationID,
  name: '',
  slugifiedName: '',
  maxUsersPerInstance: 10,
  sceneId: '' as SceneID,
  isLobby: false,
  isFeatured: false,
  locationSetting: {
    id: '',
    locationId: '' as LocationID,
    audioEnabled: false,
    screenSharingEnabled: false,
    faceStreamingEnabled: false,
    locationType: 'private',
    videoEnabled: false,
    createdAt: '',
    updatedAt: ''
  },
  locationAuthorizedUsers: [],
  locationBans: [],
  createdAt: '',
  updatedAt: ''
}

export const LocationState = defineState({
  name: 'LocationState',
  initial: () => ({
    offline: false,
    locationName: null! as string,
    currentLocation: {
      location: LocationSeed as LocationType,
      bannedUsers: [] as string[],
      selfUserBanned: false,
      selfNotAuthorized: false
    },
    updateNeeded: true,
    currentLocationUpdateNeeded: true,
    fetchingCurrentLocation: false,
    invalidLocation: false
  }),

  setLocationName: (locationName: string) => {
    getMutableState(LocationState).merge({ locationName })
  },

  fetchingCurrentSocialLocation: () => {
    getMutableState(LocationState).merge({
      fetchingCurrentLocation: true,
      currentLocation: {
        location: LocationSeed as LocationType,
        bannedUsers: [] as string[],
        selfUserBanned: false,
        selfNotAuthorized: false
      },
      updateNeeded: true,
      currentLocationUpdateNeeded: true
    })
  },

  socialLocationRetrieved: (location: LocationType) => {
    let bannedUsers = [] as string[]
    location.locationBans.forEach((ban) => {
      bannedUsers.push(ban.userId)
    })
    bannedUsers = [...new Set(bannedUsers)]
    getMutableState(LocationState).merge({
      currentLocation: {
        location: {
          ...location
        },
        bannedUsers,
        selfUserBanned: false,
        selfNotAuthorized: false
      },
      currentLocationUpdateNeeded: false,
      fetchingCurrentLocation: false
    })
  },

  socialLocationNotFound: () => {
    getMutableState(LocationState).merge({
      currentLocation: {
        location: LocationSeed,
        bannedUsers: [],
        selfUserBanned: false,
        selfNotAuthorized: false
      },
      currentLocationUpdateNeeded: false,
      fetchingCurrentLocation: false,
      invalidLocation: true
    })
  },

  socialLocationBanCreated: () => {
    getMutableState(LocationState).merge({ currentLocationUpdateNeeded: true })
  },

  socialSelfUserBanned: (banned: boolean) => {
    getMutableState(LocationState).merge({ currentLocationUpdateNeeded: true })
    getMutableState(LocationState).currentLocation.merge({ selfUserBanned: banned })
  },

  socialLocationNotAuthorized: () => {
    getMutableState(LocationState).merge({ currentLocationUpdateNeeded: true })
    getMutableState(LocationState).currentLocation.merge({ selfNotAuthorized: true })
  }
})

export const LocationService = {
  getLocation: async (locationId: LocationID) => {
    try {
      LocationState.fetchingCurrentSocialLocation()
      const location = await API.instance.client.service(locationPath).get(locationId)
      LocationState.socialLocationRetrieved(location)
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  getLocationByName: async (locationName: string) => {
    LocationState.fetchingCurrentSocialLocation()
    const locationResult = (await API.instance.client.service(locationPath).find({
      query: {
        slugifiedName: locationName
      }
    })) as Paginated<LocationType>

    if (locationResult && locationResult.total > 0) {
      if (
        locationResult.data[0].locationSetting?.locationType === 'private' &&
        !locationResult.data[0].locationAuthorizedUsers?.find((authUser) => authUser.userId === Engine.instance.userID)
      ) {
        LocationState.socialLocationNotAuthorized()
      } else LocationState.socialLocationRetrieved(locationResult.data[0])
    } else {
      LocationState.socialLocationNotFound()
    }
  },
  getLobby: async () => {
    const lobbyResult = (await API.instance.client.service(locationPath).find({
      query: {
        isLobby: true,
        $limit: 1
      }
    })) as Paginated<LocationType>

    if (lobbyResult && lobbyResult.total > 0) {
      return lobbyResult.data[0]
    } else {
      return null
    }
  },
  banUserFromLocation: async (userId: UserID, locationId: LocationID) => {
    try {
      await API.instance.client.service(locationBanPath).create({
        userId: userId,
        locationId: locationId
      })
      LocationState.socialLocationBanCreated()
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  }
}
