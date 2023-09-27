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
import authenticate from '../../hooks/authenticate'

import {
  LocationDatabaseType,
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
import { HookContext, NextFunction } from '@feathersjs/feathers'
import { Knex } from 'knex'
import slugify from 'slugify'
import logger from '../../ServerLogger'
import { locationSettingSorts } from './location.class'
import {
  locationDataResolver,
  locationExternalResolver,
  locationPatchResolver,
  locationQueryResolver,
  locationResolver
} from './location.resolvers'

const applyLocationSettingSort = async (context: HookContext, next: NextFunction) => {
  await next() // Read more about execution of hooks: https://github.com/feathersjs/hooks#flow-control-with-multiple-hooks

  const hasLocationSettingSort =
    context.params.query &&
    context.params.query.$sort &&
    Object.keys(context.params.query.$sort).some((item) => locationSettingSorts.includes(item))

  if (hasLocationSettingSort) {
    const { dispatch } = context

    for (const sort of Object.keys(context.params.query.$sort)) {
      if (locationSettingSorts.includes(sort)) {
        const data = dispatch.data ? dispatch.data : dispatch

        data.sort((a, b) => {
          let fa = a.locationSetting[sort],
            fb = b.locationSetting[sort]

          if (typeof fa === 'string') {
            fa = fa.toLowerCase()
            fb = fb.toLowerCase()
          }

          if (fa < fb) {
            return -1
          }
          if (fa > fb) {
            return 1
          }
          return 0
        })

        if (context.params.query.$sort[sort] === 1) {
          data.reverse()
        }
      }
    }
  }
}

const makeLobby = async (trx: Knex.Transaction, selfUser: any) => {
  if (!selfUser || !selfUser.scopes || !selfUser.scopes.find((scope) => scope.type === 'admin:admin')) {
    throw new Error('Only Admin can set Lobby')
  }

  await trx.from<LocationDatabaseType>(locationPath).update({ isLobby: false }).where({ isLobby: true })
}

const findActionHook = async (context: HookContext) => {
  const { adminnedLocations, search } = context.params?.query || {}

  if (adminnedLocations && search) {
    context.params.query = {
      ...context.params?.query,
      $or: [
        {
          name: {
            $like: `%${search}%`
          }
        },
        {
          sceneId: {
            $like: `%${search}%`
          }
        }
      ]
    }
  }

  const paramsWithoutExtras = {
    ...context.params,
    // Explicitly cloned sort object because otherwise it was affecting default params object as well.
    query: context.params.query ? JSON.parse(JSON.stringify(context.params.query)) : {}
  }

  // Remove extra params
  if (paramsWithoutExtras.query?.adminnedLocations) delete paramsWithoutExtras.query.adminnedLocations
  if (paramsWithoutExtras.query?.search || paramsWithoutExtras.query?.search === '')
    delete paramsWithoutExtras.query.search

  // Remove location setting sorts
  if (paramsWithoutExtras.query?.$sort) {
    for (const sort of locationSettingSorts) {
      const hasLocationSettingSort = Object.keys(paramsWithoutExtras.query.$sort).find((item) => item === sort)

      if (hasLocationSettingSort) {
        delete paramsWithoutExtras.query.$sort[sort]
      }
    }
  }
  context.params = paramsWithoutExtras
}

const createActionHook = async (context: HookContext) => {
  const trx = await (context.app.get('knexClient') as Knex).transaction()

  try {
    const selfUser = context.params?.user

    if (context.data.isLobby) {
      await makeLobby(trx, selfUser)
    }

    context.data.slugifiedName = slugify(context.data.name, { lower: true })

    const insertData = JSON.parse(JSON.stringify(context.data))
    delete insertData.locationSetting
    delete insertData.locationAdmin

    await trx.from<LocationDatabaseType>(locationPath).insert(insertData)

    await trx.from<LocationSettingType>(locationSettingPath).insert({
      ...context.data.locationSetting,
      locationId: (context.data as LocationType).id
    })

    if ((context.data as LocationType).locationAdmin) {
      await trx.from<LocationAdminType>(locationAdminPath).insert({
        ...(context.data as LocationType).locationAdmin,
        userId: selfUser?.id,
        locationId: (context.data as LocationType).id
      })

      await trx.from<LocationAuthorizedUserType>(locationAuthorizedUserPath).insert({
        ...(context.data as LocationType).locationAdmin,
        userId: selfUser?.id,
        locationId: (context.data as LocationType).id
      })
    }

    await trx.commit()

    context.result = await context.service.get((context.data as LocationType).id)
  } catch (err) {
    logger.error(err)
    await trx.rollback()
    if (err.code === 'ER_DUP_ENTRY') {
      throw new Error('Name is in use.')
    }
    throw err
  }
}

const patchActionHook = async (context: HookContext) => {
  const trx = await (context.app.get('knexClient') as Knex).transaction()
  try {
    const selfUser = context.params?.user

    const oldLocation = await context.service.get(context.id)

    if (!oldLocation.isLobby && context.data.isLobby) {
      await makeLobby(trx, selfUser)
    }

    if (context.data.name) {
      context.data.slugifiedName = slugify(context.data.name, { lower: true })
    }

    const updateData = JSON.parse(JSON.stringify(context.data))
    delete updateData.locationSetting

    await trx
      .from<LocationDatabaseType>(locationPath)
      .update(updateData)
      .where({ id: context.id?.toString() })

    if (context.data.locationSetting) {
      await trx
        .from<LocationSettingType>(locationSettingPath)
        .update({
          videoEnabled: context.data.locationSetting.videoEnabled,
          audioEnabled: context.data.locationSetting.audioEnabled,
          faceStreamingEnabled: context.data.locationSetting.faceStreamingEnabled,
          screenSharingEnabled: context.data.locationSetting.screenSharingEnabled,
          locationType: context.data.locationSetting.locationType || 'private'
        })
        .where({ id: oldLocation.locationSetting.id })
    }

    await trx.commit()

    context.result = await context.service.get(context.id)
  } catch (err) {
    logger.error(err)
    await trx.rollback()
    if (err.errors && err.errors[0].message === 'slugifiedName must be unique') {
      throw new Error('That name is already in use')
    }
    throw err
  }
}

const removeActionHook = async (context: HookContext) => {
  if (context.id) {
    const location = await context.service.get(context.id)

    if (location && location.isLobby) {
      throw new Error("Lobby can't be deleted")
    }

    const selfUser = context.params!.user
    if (location.locationSetting) await context.app.service(locationSettingPath).remove(location.locationSetting.id)

    try {
      // const admins = await this.app.service(locationAdminPath)._find(null, {
      //   query: {
      //     locationId: id,
      //     userId: selfUser?.id ?? null
      //   }
      // })

      await context.app.service(locationAdminPath).remove(null, {
        query: {
          locationId: context.id.toString(),
          userId: selfUser?.id
        }
      })
    } catch (err) {
      logger.error(err, `Could not remove location-admin: ${err.message}`)
    }
  }
}

export default {
  around: {
    all: [
      applyLocationSettingSort,
      schemaHooks.resolveExternal(locationExternalResolver),
      schemaHooks.resolveResult(locationResolver)
    ]
  },

  before: {
    all: [
      authenticate(),
      () => schemaHooks.validateQuery(locationQueryValidator),
      schemaHooks.resolveQuery(locationQueryResolver)
    ],
    find: [findActionHook],
    get: [],
    create: [
      iff(isProvider('external'), verifyScope('location', 'write')),
      () => schemaHooks.validateData(locationDataValidator),
      schemaHooks.resolveData(locationDataResolver),
      createActionHook
    ],
    update: [iff(isProvider('external'), verifyScope('location', 'write'))],
    patch: [
      iff(isProvider('external'), verifyScope('location', 'write')),
      () => schemaHooks.validateData(locationPatchValidator),
      schemaHooks.resolveData(locationPatchResolver),
      patchActionHook
    ],
    remove: [iff(isProvider('external'), verifyScope('location', 'write')), removeActionHook]
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
