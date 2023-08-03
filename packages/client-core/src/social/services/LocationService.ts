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

import { matches, Validator } from '@etherealengine/engine/src/common/functions/MatchesUtils'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { locationPath, LocationType } from '@etherealengine/engine/src/schemas/social/location.schema'
import { defineAction, defineState, dispatchAction, getMutableState } from '@etherealengine/hyperflux'

import { locationBanPath } from '@etherealengine/engine/src/schemas/social/location-ban.schema'
import { UserId } from '@etherealengine/engine/src/schemas/user/user.schema'
import { API } from '../../API'
import { NotificationService } from '../../common/services/NotificationService'

export const LocationSeed: LocationType = {
  id: '',
  name: '',
  slugifiedName: '',
  maxUsersPerInstance: 10,
  sceneId: '',
  isLobby: false,
  isFeatured: false,
  locationSetting: {
    id: '',
    locationId: '',
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
  })
})

export const LocationServiceReceptor = (action) => {
  const s = getMutableState(LocationState)
  matches(action)
    .when(LocationAction.setLocationName.matches, (action) => {
      return s.merge({
        locationName: action.locationName
      })
    })
    .when(LocationAction.fetchingCurrentSocialLocation.matches, () => {
      return s.merge({
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
    })
    .when(LocationAction.socialLocationRetrieved.matches, (action) => {
      let bannedUsers = [] as string[]
      action.location.locationBans.forEach((ban) => {
        bannedUsers.push(ban.userId)
      })
      bannedUsers = [...new Set(bannedUsers)]
      return s.merge({
        currentLocation: {
          location: {
            ...action.location
          },
          bannedUsers,
          selfUserBanned: false,
          selfNotAuthorized: false
        },
        currentLocationUpdateNeeded: false,
        fetchingCurrentLocation: false
      })
    })
    .when(LocationAction.socialLocationNotFound.matches, () => {
      return s.merge({
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
    })
    .when(LocationAction.socialLocationBanCreated.matches, () => {
      return s.merge({ currentLocationUpdateNeeded: true })
    })
    .when(LocationAction.socialSelfUserBanned.matches, (action) => {
      s.merge({ currentLocationUpdateNeeded: true })
      s.currentLocation.merge({ selfUserBanned: action.banned })
      return
    })
    .when(LocationAction.socialLocationNotAuthorized.matches, (action) => {
      s.merge({ currentLocationUpdateNeeded: true })
      return s.currentLocation.merge({ selfNotAuthorized: true })
    })
}

export const LocationService = {
  getLocation: async (locationId: string) => {
    try {
      dispatchAction(LocationAction.fetchingCurrentSocialLocation({}))
      const location = await API.instance.client.service(locationPath).get(locationId)
      dispatchAction(LocationAction.socialLocationRetrieved({ location }))
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  getLocationByName: async (locationName: string) => {
    dispatchAction(LocationAction.fetchingCurrentSocialLocation({}))
    const locationResult = (await API.instance.client.service(locationPath).find({
      query: {
        slugifiedName: locationName
      }
    })) as Paginated<LocationType>

    if (locationResult && locationResult.total > 0) {
      if (
        locationResult.data[0].locationSetting?.locationType === 'private' &&
        !locationResult.data[0].locationAuthorizedUsers?.find((authUser) => authUser.userId === Engine.instance.userId)
      ) {
        dispatchAction(LocationAction.socialLocationNotAuthorized({ location: locationResult.data[0] }))
      } else dispatchAction(LocationAction.socialLocationRetrieved({ location: locationResult.data[0] }))
    } else {
      dispatchAction(LocationAction.socialLocationNotFound({}))
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
  banUserFromLocation: async (userId: UserId, locationId: string) => {
    try {
      await API.instance.client.service(locationBanPath).create({
        userId: userId,
        locationId: locationId
      })
      dispatchAction(LocationAction.socialLocationBanCreated({}))
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  }
}

//Action
export class LocationAction {
  static setLocationName = defineAction({
    type: 'ee.client.Location.LOCATION_NAME_SET' as const,
    locationName: matches.string
  })

  static socialLocationRetrieved = defineAction({
    type: 'ee.client.Location.LOCATION_RETRIEVED' as const,
    location: matches.object as Validator<unknown, LocationType>
  })

  static socialLocationBanCreated = defineAction({
    type: 'ee.client.Location.LOCATION_BAN_CREATED' as const
  })

  static fetchingCurrentSocialLocation = defineAction({
    type: 'ee.client.Location.FETCH_CURRENT_LOCATION' as const
  })

  static socialLocationNotFound = defineAction({
    type: 'ee.client.Location.LOCATION_NOT_FOUND' as const
  })

  static socialLocationNotAuthorized = defineAction({
    type: 'ee.client.Location.LOCATION_NOT_AUTHORIZED' as const,
    location: matches.object as Validator<unknown, LocationType>
  })

  static socialSelfUserBanned = defineAction({
    type: 'ee.client.Location.LOCATION_LOCAL_USER_BANNED' as const,
    banned: matches.boolean
  })
}
