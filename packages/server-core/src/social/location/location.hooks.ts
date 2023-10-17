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

import { iff, isProvider } from 'feathers-hooks-common'

import verifyScope from '@etherealengine/server-core/src/hooks/verify-scope'

import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  LocationData,
  LocationDatabaseType,
  LocationPatch,
  LocationType,
  locationDataValidator,
  locationPatchValidator,
  locationPath,
  locationQueryValidator
} from '@etherealengine/engine/src/schemas/social/location.schema'

import { LocationAdminType, locationAdminPath } from '@etherealengine/engine/src/schemas/social/location-admin.schema'
import {
  LocationAuthorizedUserType,
  locationAuthorizedUserPath
} from '@etherealengine/engine/src/schemas/social/location-authorized-user.schema'
import {
  LocationSettingType,
  locationSettingPath
} from '@etherealengine/engine/src/schemas/social/location-setting.schema'
import { BadRequest } from '@feathersjs/errors'
import { Knex } from 'knex'
import slugify from 'slugify'
import { HookContext } from '../../../declarations'
import logger from '../../ServerLogger'
import { LocationService, locationSettingSorts } from './location.class'
import {
  locationDataResolver,
  locationExternalResolver,
  locationPatchResolver,
  locationQueryResolver,
  locationResolver
} from './location.resolvers'

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

const insertLocationData = async (context: HookContext<LocationService>) => {
  if (!context.data || context.method !== 'create') {
    throw new BadRequest(`${context.path} service only works for data in ${context.method}`)
  }

  const data: LocationData[] = Array.isArray(context.data) ? context.data : [context.data]

  const trx = await (context.app.get('knexClient') as Knex).transaction()

  const result: LocationType[] = []

  for (const item of data) {
    try {
      const selfUser = context.params?.user

      if (item.isLobby) {
        await context.makeLobby(trx, selfUser)
      }

      item.slugifiedName = slugify(item.name, { lower: true })

      const insertData = JSON.parse(JSON.stringify(item))
      delete insertData.locationSetting
      delete insertData.locationAdmin

      await trx.from<LocationDatabaseType>(locationPath).insert(insertData)

      await trx.from<LocationSettingType>(locationSettingPath).insert({
        ...item.locationSetting,
        locationId: (item as LocationType).id
      })

      if ((item as LocationType).locationAdmin) {
        await trx.from<LocationAdminType>(locationAdminPath).insert({
          ...(item as LocationType).locationAdmin,
          userId: selfUser?.id,
          locationId: (item as LocationType).id
        })

        await trx.from<LocationAuthorizedUserType>(locationAuthorizedUserPath).insert({
          ...(item as LocationType).locationAdmin,
          userId: selfUser?.id,
          locationId: (item as LocationType).id
        })
      }

      await trx.commit()

      const location = await context.app.service(locationPath).get((item as LocationType).id)

      result.push(location)
    } catch (err) {
      logger.error(err)
      await trx.rollback()
      if (err.code === 'ER_DUP_ENTRY') {
        throw new BadRequest('Name is in use.')
      }
      throw err
    }
  }

  context.result = result.length === 1 ? result[0] : result
}

const updateLocation = async (context: HookContext<LocationService>) => {
  if (!context.data || context.method !== 'patch') {
    throw new BadRequest(`${context.path} service only works for data in ${context.method}`)
  }

  const data: LocationPatch = context.data as LocationPatch
  const trx = await (context.app.get('knexClient') as Knex).transaction()

  try {
    const selfUser = context.params?.user

    const oldLocation = await context.app.service(locationPath).get(context.id!)

    if (!oldLocation.isLobby && data.isLobby) {
      await context.service.makeLobby(trx, selfUser)
    }

    if (data.name) {
      data.slugifiedName = slugify(data.name, { lower: true })
    }

    const updateData = JSON.parse(JSON.stringify(data))
    delete updateData.locationSetting

    await trx
      .from<LocationDatabaseType>(locationPath)
      .update(updateData)
      .where({ id: context.id?.toString() })

    if (data.locationSetting) {
      await trx
        .from<LocationSettingType>(locationSettingPath)
        .update({
          videoEnabled: data.locationSetting.videoEnabled,
          audioEnabled: data.locationSetting.audioEnabled,
          faceStreamingEnabled: data.locationSetting.faceStreamingEnabled,
          screenSharingEnabled: data.locationSetting.screenSharingEnabled,
          locationType: data.locationSetting.locationType || 'private'
        })
        .where({ id: oldLocation.locationSetting.id })
    }

    await trx.commit()

    const location = await context.app.service(locationPath).get(context.id!)

    context.result = location
  } catch (err) {
    logger.error(err)
    await trx.rollback()
    if (err.errors && err.errors[0].message === 'slugifiedName must be unique') {
      throw new BadRequest('That name is already in use')
    }
    throw err
  }
}

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
        locationId: context.id?.toString(),
        userId: selfUser?.id
      }
    })
  } catch (err) {
    logger.error(err, `Could not remove location-admin: ${err.message}`)
  }
}

export default {
  around: {
    all: [schemaHooks.resolveExternal(locationExternalResolver), schemaHooks.resolveResult(locationResolver)]
  },

  before: {
    all: [() => schemaHooks.validateQuery(locationQueryValidator), schemaHooks.resolveQuery(locationQueryResolver)],
    find: [sortByLocationSetting],
    get: [],
    create: [
      iff(isProvider('external'), verifyScope('location', 'write')),
      () => schemaHooks.validateData(locationDataValidator),
      schemaHooks.resolveData(locationDataResolver),
      insertLocationData
    ],
    update: [iff(isProvider('external'), verifyScope('location', 'write'))],
    patch: [
      iff(isProvider('external'), verifyScope('location', 'write')),
      () => schemaHooks.validateData(locationPatchValidator),
      schemaHooks.resolveData(locationPatchResolver),
      updateLocation
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
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
} as any
