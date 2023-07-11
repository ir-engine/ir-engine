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
import { Paginated, Params } from '@feathersjs/feathers'
import { SequelizeServiceOptions, Service } from 'feathers-sequelize'

import { INVITE_CODE_REGEX, USER_ID_REGEX } from '@etherealengine/common/src/constants/IdConstants'
import { ProjectPermissionInterface } from '@etherealengine/common/src/interfaces/ProjectPermissionInterface'

import { Application } from '../../../declarations'
import logger from '../../ServerLogger'
import { UserParams } from '../../user/user/user.class'

export type ProjectPermissionsDataType = ProjectPermissionInterface

export class ProjectPermission<T = ProjectPermissionsDataType> extends Service {
  app: Application
  docs: any

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }

  async makeRandomProjectOwnerIfNone(projectId) {
    const projectOwners = await this.app.service('project-permission').Model.findAll({
      paginate: false,
      where: {
        projectId: projectId,
        type: 'owner'
      }
    })
    if (projectOwners.length === 0) {
      const newOwner = await this.app.service('project-permission').Model.findOne({
        where: {
          projectId: projectId
        }
      })
      if (newOwner)
        await super.patch(newOwner.id, {
          type: 'owner'
        })
    }
  }

  async find(params?: UserParams): Promise<T[] | Paginated<T>> {
    const loggedInUser = params!.user!
    if (loggedInUser.scopes?.find((scope) => scope.type === 'admin:admin')) return super.find(params)
    if (params?.query?.projectId) {
      const permissionStatus = await super.Model.findOne({
        where: {
          projectId: params.query.projectId,
          userId: loggedInUser?.id
        }
      })
      if (permissionStatus) return super.find(params)
    }
    if (!params) params = {}
    if (!params.query) params.query = {}
    params.query.userId = loggedInUser.id
    return super.find(params)
  }

  async get(id: string, params?: UserParams): Promise<T> {
    const loggedInUser = params!.user!
    const projectPermission = await super.get(id, params)
    if (loggedInUser.scopes?.find((scope) => scope.type === 'admin:admin')) return projectPermission
    if (projectPermission.userId !== loggedInUser.id) throw new Forbidden('You do not own this project-permission')
    return projectPermission
  }

  async create(data: any, params?: UserParams): Promise<T> {
    const selfUser = params!.user!
    if (USER_ID_REGEX.test(data.inviteCode)) {
      data.userId = data.inviteCode
      delete data.inviteCode
    }
    if (INVITE_CODE_REGEX.test(data.userId)) {
      data.inviteCode = data.userId
      delete data.inviteCode
    }
    try {
      const searchParam = data.inviteCode
        ? {
            inviteCode: data.inviteCode
          }
        : {
            id: data.userId
          }
      const user = await this.app.service('user').Model.findOne({
        where: searchParam
      })
      if (!user) throw new BadRequest('Invalid user ID and/or user invite code')
      const existing = (await super.find({
        query: {
          projectId: data.projectId,
          userId: user.id
        }
      })) as Paginated<T>
      if (existing.total > 0) return existing.data[0]
      const project = await this.app.service('project').Model.findOne({
        where: {
          id: data.projectId
        }
      })
      if (!project) throw new BadRequest('Invalid project ID')
      if (!user) throw new BadRequest('Invalid user ID')
      const existingPermissionsCount = await super.Model.count({
        where: {
          projectId: data.projectId
        }
      })
      return super.create({
        projectId: data.projectId,
        userId: user.id,
        type:
          data.type === 'owner' ||
          existingPermissionsCount === 0 ||
          (selfUser.scopes?.find((scope) => scope.type === 'admin:admin') && selfUser.id === user.id)
            ? 'owner'
            : 'user'
      })
    } catch (err) {
      logger.error(err)
      throw err
    }
  }

  async patch(id: string, data: any, params?: Params): Promise<T> {
    const result = await super.patch(id, {
      type: data.type === 'owner' ? 'owner' : 'user'
    })

    await this.makeRandomProjectOwnerIfNone(result.projectId)
    return result
  }

  async remove(id: string, params?: Params): Promise<T> {
    const result = await super.remove(id, params)
    if (id && result) await this.makeRandomProjectOwnerIfNone(result.projectId)
    return result
  }
}
