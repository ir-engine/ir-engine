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

// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html

import { resolve, virtual } from '@feathersjs/schema'
import { v4 } from 'uuid'

import { LocationAdminType, locationAdminPath } from '@etherealengine/engine/src/schemas/social/location-admin.schema'
import { locationSettingPath } from '@etherealengine/engine/src/schemas/social/location-setting.schema'
import { LocationID, LocationQuery, LocationType } from '@etherealengine/engine/src/schemas/social/location.schema'
import type { HookContext } from '@etherealengine/server-core/declarations'

import {
  LocationAuthorizedUserType,
  locationAuthorizedUserPath
} from '@etherealengine/engine/src/schemas/social/location-authorized-user.schema'
import { LocationBanType, locationBanPath } from '@etherealengine/engine/src/schemas/social/location-ban.schema'
import { UserID } from '@etherealengine/engine/src/schemas/user/user.schema'
import { fromDateTimeSql, getDateTimeSql } from '../../util/datetime-sql'
import { LocationParams } from './location.class'

export const locationResolver = resolve<LocationType, HookContext>({
  locationSetting: virtual(async (location, context) => {
    const locationSetting = await context.app.service(locationSettingPath).find({
      query: {
        locationId: location.id
      },
      paginate: false
    })
    return locationSetting.length > 0 ? locationSetting[0] : undefined
  }),
  locationAdmin: virtual(async (location, context) => {
    const params = context.params as LocationParams
    const loggedInUser = params.user

    if (
      loggedInUser &&
      params.query &&
      params.query.adminnedLocations &&
      (!loggedInUser.scopes || !loggedInUser.scopes.find((scope) => scope.type === 'admin:admin'))
    ) {
      const locationAdmin = (await context.app.service(locationAdminPath).find({
        query: {
          locationId: location.id,
          userId: loggedInUser.id
        },
        paginate: false
      })) as LocationAdminType[]

      return locationAdmin.length > 0 ? locationAdmin[0] : undefined
    }

    return undefined
  }),
  locationAuthorizedUsers: virtual(async (location, context) => {
    return (await context.app.service(locationAuthorizedUserPath).find({
      query: {
        locationId: location.id
      },
      paginate: false
    })) as LocationAuthorizedUserType[]
  }),
  locationBans: virtual(async (location, context) => {
    return (await context.app.service(locationBanPath).find({
      query: {
        locationId: location.id
      },
      paginate: false
    })) as LocationBanType[]
  }),
  createdAt: virtual(async (location) => fromDateTimeSql(location.createdAt)),
  updatedAt: virtual(async (location) => fromDateTimeSql(location.updatedAt))
})

export const locationExternalResolver = resolve<LocationType, HookContext>({
  isLobby: async (value, location) => !!location.isLobby, // https://stackoverflow.com/a/56523892/2077741
  isFeatured: async (value, location) => !!location.isFeatured // https://stackoverflow.com/a/56523892/2077741
})

export const locationDataResolver = resolve<LocationType, HookContext>({
  id: async () => {
    return v4() as LocationID
  },
  locationSetting: async (value, location) => {
    return {
      ...location.locationSetting,
      id: v4(),
      locationType: location.locationSetting.locationType || 'private',
      locationId: '' as LocationID,
      createdAt: await getDateTimeSql(),
      updatedAt: await getDateTimeSql()
    }
  },
  locationAdmin: async (value, location) => {
    return {
      ...location.locationAdmin,
      id: v4(),
      locationId: '' as LocationID,
      userId: '' as UserID,
      createdAt: await getDateTimeSql(),
      updatedAt: await getDateTimeSql()
    }
  },
  createdAt: getDateTimeSql,
  updatedAt: getDateTimeSql
})

export const locationPatchResolver = resolve<LocationType, HookContext>({
  updatedAt: getDateTimeSql
})

export const locationQueryResolver = resolve<LocationQuery, HookContext>({})
