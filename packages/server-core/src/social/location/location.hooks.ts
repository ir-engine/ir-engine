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

import { BadRequest } from '@feathersjs/errors'
import { transaction } from '@feathersjs/knex'
import { hooks as schemaHooks } from '@feathersjs/schema'
import { disallow, discard, discardQuery, iff, isProvider } from 'feathers-hooks-common'
import { Knex } from 'knex'

import { locationAdminPath } from '@etherealengine/common/src/schemas/social/location-admin.schema'
import { locationAuthorizedUserPath } from '@etherealengine/common/src/schemas/social/location-authorized-user.schema'
import { locationSettingPath } from '@etherealengine/common/src/schemas/social/location-setting.schema'
import {
  LocationData,
  LocationDatabaseType,
  locationDataValidator,
  LocationID,
  LocationPatch,
  locationPatchValidator,
  locationPath,
  locationQueryValidator,
  LocationType
} from '@etherealengine/common/src/schemas/social/location.schema'
import { UserID } from '@etherealengine/common/src/schemas/user/user.schema'
import verifyScope from '@etherealengine/server-core/src/hooks/verify-scope'

import { HookContext } from '../../../declarations'
import disallowNonId from '../../hooks/disallow-non-id'
import persistData from '../../hooks/persist-data'
import logger from '../../ServerLogger'
import { LocationService } from './location.class'
import {
  locationDataResolver,
  locationExternalResolver,
  locationPatchResolver,
  locationQueryResolver,
  locationResolver
} from './location.resolvers'

const locationSettingSorts = ['locationType', 'audioEnabled', 'videoEnabled']

/* (BEFORE) FIND HOOKS */

const sortByLocationSetting = async (context: HookContext<LocationService>) => {
  const hasLocationSettingSort =
    context.params.query &&
    context.params.query.$sort &&
    Object.keys(context.params.query.$sort).some((item) => locationSettingSorts.includes(item))

  if (hasLocationSettingSort && context.params.query && context.params.query.$sort) {
    for (const sort of Object.keys(context.params.query.$sort)) {
      if (locationSettingSorts.includes(sort)) {
        const currentSort = context.params.query.$sort[sort]
        delete context.params.query.$sort[sort]

        const query = context.service.createQuery(context.params)

        query.join(locationSettingPath, `${locationSettingPath}.locationId`, `${locationPath}.id`)
        query.orderBy(`${locationSettingPath}.${sort}`, currentSort === 1 ? 'asc' : 'desc')
        query.select(`${locationPath}.*`)

        context.params.knex = query
      }
    }
  }
}

/* (BEFORE) CREATE HOOKS */

const makeLobbyHelper = async (trx: Knex.Transaction) => {
  await trx.from<LocationDatabaseType>(locationPath).update({ isLobby: false }).where({ isLobby: true })
}

const makeLobbies = async (context: HookContext<LocationService>) => {
  if (!context.data || context.method !== 'create') {
    throw new BadRequest(`${context.path} service only works for data in ${context.method}`)
  }
  const data: LocationData[] = Array.isArray(context.data) ? context.data : [context.data]

  for (const item of data) {
    if (item.isLobby) {
      await makeLobbyHelper(context.params.transaction!.trx!)
    }
  }
}

/* (AFTER) CREATE HOOKS */

const createLocationSetting = async (context: HookContext<LocationService>) => {
  if (!context.data || context.method !== 'create') {
    throw new BadRequest(`${context.path} service only works for data in ${context.method}`)
  }
  const data: LocationType[] = Array.isArray(context['actualData']) ? context['actualData'] : [context['actualData']]

  for (const item of data) {
    await context.app.service(locationSettingPath).create({
      ...item.locationSetting,
      locationId: (item as LocationType).id as LocationID
    })
  }
}

const createAuthorizedLocation = async (context: HookContext<LocationService>) => {
  if (!context.data || context.method !== 'create') {
    throw new BadRequest(`${context.path} service only works for data in ${context.method}`)
  }
  const data: LocationType[] = Array.isArray(context['actualData']) ? context['actualData'] : [context['actualData']]

  for (const item of data) {
    if (item.locationAdmin && context.params && context.params.user) {
      await context.app.service(locationAdminPath).create({
        ...(item as LocationType).locationAdmin,
        userId: context.params.user.id,
        locationId: (item as LocationType).id as LocationID
      })
      await context.app.service(locationAuthorizedUserPath).create({
        ...(item as LocationType).locationAdmin,
        userId: context.params.user.id,
        locationId: (item as LocationType).id as LocationID
      })
    }
  }
}

/* (BEFORE) PATCH HOOKS */

const makeOldLocationLobby = async (context: HookContext<LocationService>) => {
  if (!context.data || context.method !== 'patch') {
    throw new BadRequest(`${context.path} service only works for data in ${context.method}`)
  }
  const data: LocationPatch = context.data as LocationPatch

  context.oldLocation = await context.app.service(locationPath).get(context.id!)

  if (!context.oldLocation.isLobby && data.isLobby) {
    await makeLobbyHelper(context.params.transaction!.trx!)
  }
}

/* (AFTER) PATCH HOOKS */

const patchLocationSetting = async (context: HookContext<LocationService>) => {
  if (!context.data || context.method !== 'patch') {
    throw new BadRequest(`${context.path} service only works for data in ${context.method}`)
  }
  const data: LocationPatch = context['actualData']

  if (data.locationSetting)
    await context.app.service(locationSettingPath).patch(context.oldLocation.locationSetting.id, {
      videoEnabled: data.locationSetting.videoEnabled,
      audioEnabled: data.locationSetting.audioEnabled,
      faceStreamingEnabled: data.locationSetting.faceStreamingEnabled,
      screenSharingEnabled: data.locationSetting.screenSharingEnabled,
      locationType: data.locationSetting.locationType || 'public'
    })
}

/* (BEFORE) REMOVE HOOKS */

const checkIsLobby = async (context: HookContext<LocationService>) => {
  if (context.id) {
    const location = await context.app.service(locationPath).get(context.id)

    if (location && location.isLobby) {
      throw new BadRequest("Lobby can't be deleted")
    }
  }
}

const removeLocationSetting = async (context: HookContext<LocationService>) => {
  if (context.id) {
    const location = await context.app.service(locationPath).get(context.id)

    if (location.locationSetting) await context.app.service(locationSettingPath).remove(location.locationSetting.id)
  }
}

const removeLocationAdmin = async (context: HookContext<LocationService>) => {
  const selfUser = context.params!.user
  try {
    await context.app.service(locationAdminPath).remove(null, {
      query: {
        locationId: context.id?.toString() as LocationID,
        userId: selfUser?.id as UserID
      }
    })
  } catch (err) {
    logger.error(err, `Could not remove location-admin: ${err.message}`)
  }
}

/* ERROR HOOKS */

const duplicateNameError = async (context: HookContext<LocationService>) => {
  if (context.error) {
    if (context.error.code === 'ER_DUP_ENTRY') {
      throw new BadRequest('Name is in use.')
    } else if (context.error.errors && context.error.errors[0].message === 'slugifiedName must be unique') {
      throw new BadRequest('That name is already in use')
    }
    throw context.error
  }
}

export default {
  around: {
    all: [schemaHooks.resolveExternal(locationExternalResolver), schemaHooks.resolveResult(locationResolver)]
  },

  before: {
    all: [() => schemaHooks.validateQuery(locationQueryValidator), schemaHooks.resolveQuery(locationQueryResolver)],
    find: [discardQuery('action'), discardQuery('studio'), sortByLocationSetting],
    get: [],
    create: [
      iff(isProvider('external'), verifyScope('location', 'write')),
      () => schemaHooks.validateData(locationDataValidator),
      schemaHooks.resolveData(locationDataResolver),
      makeLobbies,
      persistData,
      discard('locationSetting', 'locationAdmin')
    ],
    update: [disallow()],
    patch: [
      iff(isProvider('external'), verifyScope('location', 'write')),
      () => schemaHooks.validateData(locationPatchValidator),
      schemaHooks.resolveData(locationPatchResolver),
      disallowNonId,
      makeOldLocationLobby,
      persistData,
      discard('locationSetting')
    ],
    remove: [
      iff(isProvider('external'), verifyScope('location', 'write')),
      checkIsLobby,
      removeLocationSetting,
      removeLocationAdmin
    ]
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [createLocationSetting, createAuthorizedLocation],
    update: [],
    patch: [patchLocationSetting],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [transaction.rollback(), duplicateNameError],
    update: [],
    patch: [transaction.rollback(), duplicateNameError],
    remove: []
  }
} as any
