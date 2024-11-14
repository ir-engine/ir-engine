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

import { BadRequest } from '@feathersjs/errors'
import { hooks as schemaHooks } from '@feathersjs/schema'
import { disallow, discard, discardQuery, iff, iffElse, isProvider, keepQuery } from 'feathers-hooks-common'

import { locationAdminPath } from '@ir-engine/common/src/schemas/social/location-admin.schema'
import { locationAuthorizedUserPath } from '@ir-engine/common/src/schemas/social/location-authorized-user.schema'
import { locationSettingPath } from '@ir-engine/common/src/schemas/social/location-setting.schema'
import {
  locationDataValidator,
  LocationID,
  LocationPatch,
  locationPatchValidator,
  locationPath,
  locationQueryValidator,
  LocationType
} from '@ir-engine/common/src/schemas/social/location.schema'
import { UserID } from '@ir-engine/common/src/schemas/user/user.schema'
import verifyScope from '@ir-engine/server-core/src/hooks/verify-scope'

import { projectHistoryPath, staticResourcePath } from '@ir-engine/common/src/schema.type.module'
import { HookContext } from '../../../declarations'
import checkScope from '../../hooks/check-scope'
import disallowNonId from '../../hooks/disallow-non-id'
import hasAction from '../../hooks/has-action'
import isAction from '../../hooks/is-action'
import persistData from '../../hooks/persist-data'
import persistQuery from '../../hooks/persist-query'
import verifyProjectPermission from '../../hooks/verify-project-permission'
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

/* (AFTER) CREATE HOOKS */

const makeLobbies = async (context: HookContext<LocationService>) => {
  const result: LocationType[] = Array.isArray(context.result) ? context.result : ([context.result] as LocationType[])

  for (const item of result)
    if (item.isLobby) {
      await context.service._patch(null, { isLobby: false }, { query: { isLobby: true, id: { $ne: item.id } } })
    }
}

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
        userId: context.params.user.id,
        locationId: item.id as LocationID
      })
      await context.app.service(locationAuthorizedUserPath).create({
        userId: context.params.user.id,
        locationId: item.id as LocationID
      })
    }
  }
}

/* (AFTER) PATCH HOOKS */

const patchLocationSetting = async (context: HookContext<LocationService>) => {
  if (!context.data || context.method !== 'patch') {
    throw new BadRequest(`${context.path} service only works for data in ${context.method}`)
  }
  const data: LocationPatch = context['actualData']
  const result: LocationType = context.result as LocationType

  if (data.locationSetting)
    await context.app.service(locationSettingPath).patch(
      null,
      {
        videoEnabled: data.locationSetting.videoEnabled,
        audioEnabled: data.locationSetting.audioEnabled,
        faceStreamingEnabled: data.locationSetting.faceStreamingEnabled,
        screenSharingEnabled: data.locationSetting.screenSharingEnabled,
        locationType: data.locationSetting.locationType || 'public'
      },
      { query: { locationId: result.id } }
    )
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

const addDeleteLog = async (context: HookContext<LocationService>) => {
  try {
    const resource = context.result as LocationType
    const scene = await context.app.service(staticResourcePath).get(resource.sceneId)
    await context.app.service(projectHistoryPath).create({
      projectId: resource.projectId,
      userId: context.params.user?.id || null,
      action: 'LOCATION_UNPUBLISHED',
      actionIdentifier: resource.id,
      actionIdentifierType: 'location',
      actionDetail: JSON.stringify({
        locationName: resource.slugifiedName,
        sceneURL: scene.key,
        sceneId: resource.sceneId
      })
    })
  } catch (error) {
    console.error('Error in adding delete log: ', error)
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

/* BEFORE FIND HOOKS */
/**
 * @function rejectEmptyQuery
 * @param context
 * @description This hook function ensure that no empty queries are present
 */
const rejectEmptyQuery = async (context: HookContext<LocationService>) => {
  const keys: string[] = Object.keys(context.params.query || {})
  if (keys.length == 0) throw new BadRequest(`Query can't have empty params object`)
}
/**
 * @function restrictProtectedQuery
 * @param context
 * @description This hook function restricts allowed query params for scoped user's calls
 * from authorized sections (admin, dashboard, studio)
 */
const restrictProtectedQuery = async (context: HookContext<LocationService>) => {
  keepQuery(
    'id',
    'name',
    'slugifiedName',
    '$or',
    '$like',
    '$limit',
    '$sort',
    '$select',
    '$skip',
    'sceneId',
    'projectId'
  )(context)
}
/**
 * @function restrictPublicQuery
 * @param context
 * @description This hook function restricts allowed query params for public calls
 * from the viewer section by only allowing slugifiedName and projectId parameters, any other
 * parameter will be discarded from the query protecting from any malicious query injection.
 *
 * This function is discarding all params but slugifiedName and projectId instead of throwing a BadRequest if other
 * parameters are present, having as goal to avoid providing any feedback to malicious users
 * that could allow them to figure out unforeseen and unsafe patterns or combinations in order to
 * successfully perform an injection attack.
 */
const restrictPublicQuery = async (context: HookContext<LocationService>) => {
  keepQuery('slugifiedName', 'projectId')(context)
}

export default {
  around: {
    all: [schemaHooks.resolveExternal(locationExternalResolver), schemaHooks.resolveResult(locationResolver)]
  },

  before: {
    all: [schemaHooks.validateQuery(locationQueryValidator), schemaHooks.resolveQuery(locationQueryResolver)],
    find: [
      // Empty query object in findLocation is not allowed
      rejectEmptyQuery,
      // Persist query to avoid hook collitions or malformed knex query instances
      persistQuery,
      // Clean up query of non db relevant parameters
      discardQuery('action'),
      // On external calls. evaluate action property presence and restrict queries according
      iff(
        isProvider('external'),
        iffElse(
          hasAction,
          [
            iff(isAction('admin'), verifyScope('location', 'read')).else(verifyScope('editor', 'write')),
            restrictProtectedQuery
          ],
          restrictPublicQuery
        )
      ),
      sortByLocationSetting
    ],
    get: [],
    create: [
      schemaHooks.validateData(locationDataValidator),
      schemaHooks.resolveData(locationDataResolver),
      iff(
        isProvider('external'),
        iffElse(
          checkScope('location', 'write'),
          [],
          [verifyScope('editor', 'write'), verifyProjectPermission(['owner', 'editor'])]
        )
      ),
      persistData,
      discard('locationSetting', 'locationAdmin')
    ],
    update: [disallow()],
    patch: [
      schemaHooks.validateData(locationPatchValidator),
      schemaHooks.resolveData(locationPatchResolver),
      iff(
        isProvider('external'),
        iffElse(
          checkScope('location', 'write'),
          [],
          [verifyScope('editor', 'write'), verifyProjectPermission(['owner', 'editor'])]
        )
      ),
      disallowNonId,
      persistData,
      discard('locationSetting')
    ],
    remove: [
      iff(
        isProvider('external'),
        iffElse(
          checkScope('location', 'write'),
          [],
          [verifyScope('editor', 'write'), verifyProjectPermission(['owner', 'editor'])]
        )
      ),
      checkIsLobby,
      removeLocationSetting,
      removeLocationAdmin
    ]
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [makeLobbies, createLocationSetting, createAuthorizedLocation],
    update: [],
    patch: [makeLobbies, patchLocationSetting],
    remove: [addDeleteLog]
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [duplicateNameError],
    update: [],
    patch: [duplicateNameError],
    remove: []
  }
} as any
