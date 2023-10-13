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

import { BadRequest, Forbidden } from '@feathersjs/errors'
import { Id, Paginated, Params } from '@feathersjs/feathers'

import { INVITE_CODE_REGEX, USER_ID_REGEX } from '@etherealengine/common/src/constants/IdConstants'

import { UserID, userPath } from '@etherealengine/engine/src/schemas/user/user.schema'
import { Application } from '../../../declarations'
import logger from '../../ServerLogger'

import type { KnexAdapterOptions } from '@feathersjs/knex'
import { KnexAdapter } from '@feathersjs/knex'

import {
  ProjectPermissionData,
  ProjectPermissionPatch,
  ProjectPermissionQuery,
  ProjectPermissionType
} from '@etherealengine/engine/src/schemas/projects/project-permission.schema'

import { projectPath } from '@etherealengine/engine/src/schemas/projects/project.schema'
import { KnexAdapterParams } from '@feathersjs/knex'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ProjectPermissionParams extends KnexAdapterParams<ProjectPermissionQuery> {}

/**
 * A class for ProjectPermission service
 */

export class ProjectPermissionService<
  T = ProjectPermissionType,
  ServiceParams extends Params = ProjectPermissionParams
> extends KnexAdapter<ProjectPermissionType, ProjectPermissionData, ProjectPermissionParams, ProjectPermissionPatch> {
  app: Application

  constructor(options: KnexAdapterOptions, app: Application) {
    super(options)
    this.app = app
  }

  async makeRandomProjectOwnerIfNone(projectId) {
    const projectOwners = (await super._find({
      query: {
        projectId: projectId,
        type: 'owner'
      },
      paginate: false
    })) as any as ProjectPermissionType[]

    if (projectOwners.length === 0) {
      const newOwner = (await super._find({
        query: {
          projectId: projectId,
          $limit: 1
        }
      })) as Paginated<ProjectPermissionType>
      if (newOwner.data.length > 0)
        await super._patch(newOwner.data[0].id, {
          type: 'owner'
        })
    }
  }

  async find(params?: ProjectPermissionParams) {
    if (!params) params = {}
    if (!params.query) params.query = {}

    const loggedInUser = params.user

    if (!loggedInUser) throw new BadRequest('User missing from request')

    if (loggedInUser.scopes?.find((scope) => scope.type === 'admin:admin')) return super._find(params)

    if (params.query.projectId) {
      const permissionStatus = (await super._find({
        query: {
          projectId: params.query.projectId,
          userId: loggedInUser.id,
          $limit: 1
        }
      })) as Paginated<ProjectPermissionType>
      if (permissionStatus.data.length > 0) return super._find(params)
    }

    params.query.userId = loggedInUser.id
    return super._find(params)
  }

  async get(id: Id, params?: ProjectPermissionParams) {
    const loggedInUser = params!.user!
    const projectPermission = await super._get(id, params)
    if (loggedInUser.scopes?.find((scope) => scope.type === 'admin:admin')) return projectPermission
    if (projectPermission.userId !== loggedInUser.id) throw new Forbidden('You do not own this project-permission')
    return projectPermission
  }

  async create(data: ProjectPermissionData, params?: ProjectPermissionParams) {
    const selfUser = params!.user!
    if (data.inviteCode && USER_ID_REGEX.test(data.inviteCode)) {
      data.userId = data.inviteCode as UserID
      delete data.inviteCode
    }
    if (data.userId && INVITE_CODE_REGEX.test(data.userId)) {
      data.inviteCode = data.userId
      delete data.userId
    }
    try {
      const searchParam = data.inviteCode
        ? {
            inviteCode: data.inviteCode
          }
        : {
            id: data.userId
          }
      const users = await this.app.service(userPath).find({
        query: searchParam
      })
      if (users.data.length === 0) throw new BadRequest('Invalid user ID and/or user invite code')
      const existing = await super._find({
        query: {
          projectId: data.projectId,
          userId: users.data[0].id
        }
      })
      if (existing.total > 0) return existing.data[0]
      const project = await this.app.service(projectPath).get(data.projectId!)

      if (!project) throw new BadRequest('Invalid project ID')
      const existingPermissionsCount = (await super._find({
        query: {
          projectId: data.projectId
        },
        paginate: false
      })) as any as ProjectPermissionType[]
      delete data.inviteCode
      return super._create({
        ...data,
        userId: users.data[0].id,
        type:
          data.type === 'owner' ||
          existingPermissionsCount.length === 0 ||
          (selfUser.scopes?.find((scope) => scope.type === 'admin:admin') && selfUser.id === users.data[0].id)
            ? 'owner'
            : 'user'
      })
    } catch (err) {
      logger.error(err)
      throw err
    }
  }

  async patch(id: Id, data: ProjectPermissionData, params?: ProjectPermissionParams) {
    const result = await super._patch(id, {
      type: data.type === 'owner' ? 'owner' : 'user'
    })

    await this.makeRandomProjectOwnerIfNone(result.projectId)
    return result
  }

  async remove(id: Id, params?: ProjectPermissionParams) {
    const result = await super._remove(id, params)
    if (id && result) await this.makeRandomProjectOwnerIfNone(result.projectId)
    return result
  }
}
