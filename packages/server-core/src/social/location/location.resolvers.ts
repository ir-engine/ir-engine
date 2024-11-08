/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html

import { resolve, virtual } from '@feathersjs/schema'
import { v4 as uuidv4 } from 'uuid'

import { BadRequest } from '@feathersjs/errors'
import { projectPath, staticResourcePath } from '@ir-engine/common/src/schema.type.module'
import {
  LocationAuthorizedUserType,
  locationAuthorizedUserPath
} from '@ir-engine/common/src/schemas/social/location-authorized-user.schema'
import { LocationBanType, locationBanPath } from '@ir-engine/common/src/schemas/social/location-ban.schema'
import { locationSettingPath } from '@ir-engine/common/src/schemas/social/location-setting.schema'
import { LocationID, LocationQuery, LocationType } from '@ir-engine/common/src/schemas/social/location.schema'
import { UserID } from '@ir-engine/common/src/schemas/user/user.schema'
import { fromDateTimeSql, getDateTimeSql } from '@ir-engine/common/src/utils/datetime-sql'
import type { HookContext } from '@ir-engine/server-core/declarations'
import slugify from 'slugify'
import config from '../../appconfig'
import { LocationService } from './location.class'

const MAX_USER_PER_INSTANCE = 10

export const locationResolver = resolve<LocationType, HookContext>({
  locationSetting: virtual(async (location, context) => {
    const locationSetting = await context.app.service(locationSettingPath).find({
      query: {
        locationId: location.id as LocationID
      },
      paginate: false
    })
    return locationSetting.length > 0 ? locationSetting[0] : undefined
  }),
  locationAuthorizedUsers: virtual(async (location, context) => {
    return (await context.app.service(locationAuthorizedUserPath).find({
      query: {
        locationId: location.id as LocationID
      },
      paginate: false
    })) as LocationAuthorizedUserType[]
  }),
  locationBans: virtual(async (location, context) => {
    return (await context.app.service(locationBanPath).find({
      query: {
        locationId: location.id as LocationID
      },
      paginate: false
    })) as LocationBanType[]
  }),
  sceneAsset: virtual(async (location, context) => {
    return context.app.service(staticResourcePath).get(location.sceneId)
  }),
  url: virtual(async (location, _context) => {
    return `${config.client.url}/location/${location.slugifiedName}`
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
    return uuidv4() as LocationID
  },
  slugifiedName: async (value, location) => {
    if (location.name) return slugify(location.name, { lower: true })
  },
  projectId: async (value, location, context: HookContext<LocationService>) => {
    try {
      const asset = await context.app.service(staticResourcePath).get(location.sceneId)
      if (!asset.project) throw new BadRequest('Error populating projectId into location')
      const project = await context.app.service(projectPath).find({ query: { name: asset.project } })
      if (!project || project.total === 0) throw new BadRequest('Error populating projectId into location')
      return project.data[0].id
    } catch (error) {
      throw new BadRequest('Error populating projectId into location')
    }
  },
  locationSetting: async (value, location) => {
    return {
      ...location.locationSetting,
      id: uuidv4(),
      locationType: location.locationSetting.locationType || 'public',
      locationId: '' as LocationID,
      createdAt: await getDateTimeSql(),
      updatedAt: await getDateTimeSql()
    }
  },
  locationAdmin: async (value, location) => {
    return {
      ...location.locationAdmin,
      id: uuidv4(),
      locationId: '' as LocationID,
      userId: '' as UserID,
      createdAt: await getDateTimeSql(),
      updatedAt: await getDateTimeSql()
    }
  },
  maxUsersPerInstance: resolvedMaxUserPerInstance,
  updatedBy: async (_, __, context) => {
    return context.params?.user?.id || null
  },
  createdAt: getDateTimeSql,
  updatedAt: getDateTimeSql
})

export const locationPatchResolver = resolve<LocationType, HookContext>({
  projectId: async (value, location, context: HookContext<LocationService>) => {
    if (location.sceneId) {
      try {
        const asset = await context.app.service(staticResourcePath).get(location.sceneId)
        if (!asset.project) throw new BadRequest('Error populating projectId into location')
        const project = await context.app.service(projectPath).find({ query: { name: asset.project } })
        if (!project || project.total === 0) throw new BadRequest('Error populating projectId into location')
        return project.data[0].id
      } catch (error) {
        throw new BadRequest('Error populating projectId into location')
      }
    }
  },
  slugifiedName: async (value, location) => {
    if (location.name) return slugify(location.name, { lower: true })
  },
  updatedBy: async (_, __, context) => {
    return context.params?.user?.id || null
  },
  maxUsersPerInstance: resolvedMaxUserPerInstance,
  updatedAt: getDateTimeSql
})

async function resolvedMaxUserPerInstance(value, location) {
  if (location.maxUsersPerInstance > MAX_USER_PER_INSTANCE) {
    throw new BadRequest('You have entered higher than the allowed max users. Please enter a number between 1 and 10.')
  }
  return location.maxUsersPerInstance
}

export const locationQueryResolver = resolve<LocationQuery, HookContext>({})
