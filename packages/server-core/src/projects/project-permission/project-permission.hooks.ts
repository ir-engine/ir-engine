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

import { INVITE_CODE_REGEX, USER_ID_REGEX } from '@etherealengine/common/src/regex'
import {
  ProjectPermissionData,
  ProjectPermissionPatch,
  ProjectPermissionType,
  projectPermissionDataValidator,
  projectPermissionPatchValidator,
  projectPermissionPath,
  projectPermissionQueryValidator
} from '@etherealengine/common/src/schemas/projects/project-permission.schema'
import { projectPath } from '@etherealengine/common/src/schemas/projects/project.schema'
import { InviteCode, UserID, UserType, userPath } from '@etherealengine/common/src/schemas/user/user.schema'
import setLoggedInUserData from '@etherealengine/server-core/src/hooks/set-loggedin-user-in-body'
import { checkScope } from '@etherealengine/spatial/src/common/functions/checkScope'
import { BadRequest, Forbidden } from '@feathersjs/errors'
import { Paginated } from '@feathersjs/feathers'
import { hooks as schemaHooks } from '@feathersjs/schema'
import { disallow, discardQuery, iff, iffElse, isProvider } from 'feathers-hooks-common'

import { HookContext } from '../../../declarations'
import logger from '../../ServerLogger'
import checkScopeHook from '../../hooks/check-scope'
import enableClientPagination from '../../hooks/enable-client-pagination'
import resolveProjectId from '../../hooks/resolve-project-id'
import verifyProjectOwner from '../../hooks/verify-project-owner'
import { ProjectPermissionService } from './project-permission.class'
import {
  projectPermissionDataResolver,
  projectPermissionExternalResolver,
  projectPermissionPatchResolver,
  projectPermissionQueryResolver,
  projectPermissionResolver
} from './project-permission.resolvers'

/**
 * Updates the inviteCode and userId fields to match the correct types
 * @param context
 * @returns
 */
const ensureInviteCode = async (context: HookContext<ProjectPermissionService>) => {
  if (!context.data || context.method !== 'create') {
    throw new BadRequest(`${context.path} service only works for data in ${context.method}`)
  }

  const data: ProjectPermissionData[] = Array.isArray(context.data) ? context.data : [context.data]

  if (data[0].inviteCode && USER_ID_REGEX.test(data[0].inviteCode)) {
    data[0].userId = data[0].inviteCode as string as UserID
    delete data[0].inviteCode
  }
  if (data[0].userId && INVITE_CODE_REGEX.test(data[0].userId)) {
    data[0].inviteCode = data[0].userId as string as InviteCode
    delete (data[0] as any).userId
  }
  context.data = data[0]
}

/**
 * Checks if the user already has permissions for the project
 * @param context
 * @returns
 */
const checkExistingPermissions = async (context: HookContext<ProjectPermissionService>) => {
  if (!context.data || context.method !== 'create') {
    throw new BadRequest(`${context.path} service only works for data in ${context.method}`)
  }

  const data: ProjectPermissionData[] = Array.isArray(context.data) ? context.data : [context.data]

  const selfUser = context.params!.user!
  try {
    const searchParam = data[0].inviteCode
      ? {
          inviteCode: data[0].inviteCode
        }
      : {
          id: data[0].userId
        }
    const users = (await context.app.service(userPath).find({
      query: searchParam
    })) as Paginated<UserType>
    if (users.data.length === 0) throw new BadRequest('Invalid user ID and/or user invite code')
    const existing = (await context.app.service(projectPermissionPath).find({
      query: {
        projectId: data[0].projectId,
        userId: users.data[0].id
      }
    })) as Paginated<ProjectPermissionType>
    if (existing.total > 0) context.result = existing.data[0]
    const project = await context.app.service(projectPath).get(data[0].projectId!)

    if (!project) throw new BadRequest('Invalid project ID')
    const existingPermissionsCount = (await context.app.service(projectPermissionPath).find({
      query: {
        projectId: data[0].projectId
      },
      paginate: false
    })) as any as ProjectPermissionType[]
    delete data[0].inviteCode

    context.data = {
      ...context.data,
      userId: users.data[0].id,
      type:
        data[0].type === 'owner' ||
        existingPermissionsCount.length === 0 ||
        ((await checkScope(selfUser, 'projects', 'write')) && selfUser.id === users.data[0].id)
          ? 'owner'
          : data[0].type
    }
  } catch (err) {
    logger.error(err)
    throw err
  }
}

/**
 * Checks if the user has permissions for the project
 * If they have some sort of permission, then they can see everyone else's permissions.
 * If they do not, then it will add `userId: context.params.user.id` to the query, to prevent the user seeing
 * any permissions, as that will force there to be no matches.
 * @param context
 * @returns
 */
const checkPermissionStatus = async (context: HookContext<ProjectPermissionService>) => {
  if (context.params.query?.projectId) {
    const permissionStatus = (await context.service._find({
      query: {
        projectId: context.params.query.projectId,
        userId: context.params.user!.id,
        $limit: 1
      }
    })) as Paginated<ProjectPermissionType>
    if (permissionStatus.data.length > 0) return context
  }

  // If user does not have permission of querying project then we should force user's id in request
  // in order to restrict user from querying other user's permissions.
  context.params.query = { ...context.params.query, userId: context.params.user!.id }
}

/**
 * Checks if the user owns the project
 * @param context
 * @returns
 */
const ensureOwnership = async (context: HookContext<ProjectPermissionService>) => {
  const loggedInUser = context.params!.user!
  if (await checkScope(loggedInUser, 'projects', 'read')) return
  const result = (Array.isArray(context.result) ? context.result : [context.result]) as ProjectPermissionType[]
  if (result[0].userId !== loggedInUser.id) throw new Forbidden('You do not own this project-permission')
}

/**
 * Ensures that the type field is present in the patch data
 * @param context
 * @returns
 */
const ensureTypeInPatch = async (context: HookContext<ProjectPermissionService>) => {
  if (!context.data || context.method !== 'patch') {
    throw new BadRequest(`${context.path} service only works for data in ${context.method}`)
  }

  const data: ProjectPermissionPatch = context.data as ProjectPermissionPatch
  context.data = { type: data.type === 'owner' ? 'owner' : data.type } as ProjectPermissionData
}

/**
 * Makes a random user the owner of the project if there are no owners
 * @param context
 * @returns
 */
const makeRandomProjectOwner = async (context: HookContext<ProjectPermissionService>) => {
  const result = (Array.isArray(context.result) ? context.result : [context.result]) as ProjectPermissionType[]
  if (context.id && context.result) await context.service.makeRandomProjectOwnerIfNone(result[0].projectId)
}

export default {
  around: {
    all: [
      schemaHooks.resolveExternal(projectPermissionExternalResolver),
      schemaHooks.resolveResult(projectPermissionResolver)
    ]
  },

  before: {
    all: [
      schemaHooks.validateQuery(projectPermissionQueryValidator),
      schemaHooks.resolveQuery(projectPermissionQueryResolver)
    ],
    find: [
      enableClientPagination(),
      resolveProjectId(),
      discardQuery('project'),
      iff(isProvider('external'), iffElse(checkScopeHook('projects', 'read'), [], checkPermissionStatus))
    ],
    get: [],
    create: [
      iff(isProvider('external'), verifyProjectOwner()),
      schemaHooks.validateData(projectPermissionDataValidator),
      schemaHooks.resolveData(projectPermissionDataResolver),
      setLoggedInUserData('createdBy'),
      ensureInviteCode,
      checkExistingPermissions
    ],
    update: [disallow()],
    patch: [
      iff(isProvider('external'), verifyProjectOwner()),
      schemaHooks.validateData(projectPermissionPatchValidator),
      schemaHooks.resolveData(projectPermissionPatchResolver),
      ensureTypeInPatch
    ],
    remove: [iff(isProvider('external'), verifyProjectOwner())]
  },

  after: {
    all: [],
    find: [],
    get: [ensureOwnership],
    create: [],
    update: [],
    patch: [makeRandomProjectOwner],
    remove: [makeRandomProjectOwner]
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
